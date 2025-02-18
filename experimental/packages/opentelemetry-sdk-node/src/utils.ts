/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { diag, TextMapPropagator } from '@opentelemetry/api';
import {
  CompositePropagator,
  getStringFromEnv,
  getStringListFromEnv,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { OTLPTraceExporter as OTLPProtoTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPTraceExporter as OTLPGrpcTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import {
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
  ResourceDetector,
  serviceInstanceIdDetector,
} from '@opentelemetry/resources';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  SpanExporter,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';

const RESOURCE_DETECTOR_ENVIRONMENT = 'env';
const RESOURCE_DETECTOR_HOST = 'host';
const RESOURCE_DETECTOR_OS = 'os';
const RESOURCE_DETECTOR_PROCESS = 'process';
const RESOURCE_DETECTOR_SERVICE_INSTANCE_ID = 'serviceinstance';

export function getResourceDetectorsFromEnv(): Array<ResourceDetector> {
  // When updating this list, make sure to also update the section `resourceDetectors` on README.
  const resourceDetectors = new Map<string, ResourceDetector>([
    [RESOURCE_DETECTOR_ENVIRONMENT, envDetector],
    [RESOURCE_DETECTOR_HOST, hostDetector],
    [RESOURCE_DETECTOR_OS, osDetector],
    [RESOURCE_DETECTOR_SERVICE_INSTANCE_ID, serviceInstanceIdDetector],
    [RESOURCE_DETECTOR_PROCESS, processDetector],
  ]);

  const resourceDetectorsFromEnv =
    process.env.OTEL_NODE_RESOURCE_DETECTORS?.split(',') ?? ['all'];

  if (resourceDetectorsFromEnv.includes('all')) {
    return [...resourceDetectors.values()].flat();
  }

  if (resourceDetectorsFromEnv.includes('none')) {
    return [];
  }

  return resourceDetectorsFromEnv.flatMap(detector => {
    const resourceDetector = resourceDetectors.get(detector);
    if (!resourceDetector) {
      diag.warn(
        `Invalid resource detector "${detector}" specified in the environment variable OTEL_NODE_RESOURCE_DETECTORS`
      );
    }
    return resourceDetector || [];
  });
}

export function filterBlanksAndNulls(list: string[]): string[] {
  return list.map(item => item.trim()).filter(s => s !== 'null' && s !== '');
}

export function getOtlpProtocolFromEnv(): string {
  return (
    getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_PROTOCOL') ??
    getStringFromEnv('OTEL_EXPORTER_OTLP_PROTOCOL') ??
    'http/protobuf'
  );
}

function getOtlpExporterFromEnv(): SpanExporter {
  const protocol = getOtlpProtocolFromEnv();

  switch (protocol) {
    case 'grpc':
      return new OTLPGrpcTraceExporter();
    case 'http/json':
      return new OTLPHttpTraceExporter();
    case 'http/protobuf':
      return new OTLPProtoTraceExporter();
    default:
      diag.warn(
        `Unsupported OTLP traces protocol: ${protocol}. Using http/protobuf.`
      );
      return new OTLPProtoTraceExporter();
  }
}

function getJaegerExporter() {
  // The JaegerExporter does not support being required in bundled
  // environments. By delaying the require statement to here, we only crash when
  // the exporter is actually used in such an environment.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
    return new JaegerExporter();
  } catch (e) {
    throw new Error(
      `Could not instantiate JaegerExporter. This could be due to the JaegerExporter's lack of support for bundling. If possible, use @opentelemetry/exporter-trace-otlp-proto instead. Original Error: ${e}`
    );
  }
}

export function getSpanProcessorsFromEnv(): SpanProcessor[] {
  const exportersMap = new Map<string, () => SpanExporter>([
    ['otlp', () => getOtlpExporterFromEnv()],
    ['zipkin', () => new ZipkinExporter()],
    ['console', () => new ConsoleSpanExporter()],
    ['jaeger', () => getJaegerExporter()],
  ]);
  const exporters: SpanExporter[] = [];
  const processors: SpanProcessor[] = [];
  let traceExportersList = filterBlanksAndNulls(
    Array.from(new Set(getStringListFromEnv('OTEL_TRACES_EXPORTER')))
  );

  if (traceExportersList[0] === 'none') {
    diag.warn(
      'OTEL_TRACES_EXPORTER contains "none". SDK will not be initialized.'
    );
    return [];
  }

  if (traceExportersList.length === 0) {
    diag.debug('OTEL_TRACES_EXPORTER is empty. Using default otlp exporter.');
    traceExportersList = ['otlp'];
  } else if (
    traceExportersList.length > 1 &&
    traceExportersList.includes('none')
  ) {
    diag.warn(
      'OTEL_TRACES_EXPORTER contains "none" along with other exporters. Using default otlp exporter.'
    );
    traceExportersList = ['otlp'];
  }

  for (const name of traceExportersList) {
    const exporter = exportersMap.get(name)?.();
    if (exporter) {
      exporters.push(exporter);
    } else {
      diag.warn(`Unrecognized OTEL_TRACES_EXPORTER value: ${name}.`);
    }
  }

  for (const exp of exporters) {
    if (exp instanceof ConsoleSpanExporter) {
      processors.push(new SimpleSpanProcessor(exp));
    } else {
      processors.push(new BatchSpanProcessor(exp));
    }
  }

  if (exporters.length === 0) {
    diag.warn(
      'Unable to set up trace exporter(s) due to invalid exporter and/or protocol values.'
    );
  }

  return processors;
}

/**
 * Get a propagator as defined by environment variables
 */
export function getPropagatorFromEnv(): TextMapPropagator | null | undefined {
  // Empty and undefined MUST be treated equal.
  const propagatorsEnvVarValue = getStringListFromEnv('OTEL_PROPAGATORS');
  if (propagatorsEnvVarValue == null) {
    // return undefined to fall back to default
    return undefined;
  }

  // Implementation note: this only contains specification required propagators that are actually hosted in this repo.
  // Any other propagators (like aws, aws-lambda, should go into `@opentelemetry/auto-configuration-propagators` instead).
  const propagatorsFactory = new Map<string, () => TextMapPropagator>([
    ['tracecontext', () => new W3CTraceContextPropagator()],
    ['baggage', () => new W3CTraceContextPropagator()],
    ['b3', () => new B3Propagator()],
    [
      'b3multi',
      () => new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
    ],
    ['jaeger', () => new JaegerPropagator()],
  ]);

  // Values MUST be deduplicated in order to register a Propagator only once.
  const uniquePropagatorNames = Array.from(new Set(propagatorsEnvVarValue));

  const propagators = uniquePropagatorNames.map(name => {
    const propagator = propagatorsFactory.get(name)?.();
    if (!propagator) {
      diag.warn(
        `Propagator "${name}" requested through environment variable is unavailable.`
      );
      return undefined;
    }

    return propagator;
  });

  const validPropagators = propagators.reduce<TextMapPropagator[]>(
    (list, item) => {
      if (item) {
        list.push(item);
      }
      return list;
    },
    []
  );

  if (validPropagators.length === 0) {
    // null to signal that the default should **not** be used in its place.
    return null;
  } else if (uniquePropagatorNames.length === 1) {
    return validPropagators[0];
  } else {
    return new CompositePropagator({
      propagators: validPropagators,
    });
  }
}

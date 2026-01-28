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

import {
  context,
  ContextManager,
  diag,
  propagation,
  TextMapPropagator,
} from '@opentelemetry/api';
import {
  CompositePropagator,
  getNumberFromEnv,
  getStringFromEnv,
  getStringListFromEnv,
  W3CBaggagePropagator,
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
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { ConfigurationModel } from '@opentelemetry/configuration';
import {
  IMetricReader,
  PeriodicExportingMetricReader,
  PushMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter as OTLPGrpcMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPMetricExporter as OTLPHttpMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPMetricExporter as OTLPProtoMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import {
  BatchLogRecordProcessor,
  BufferConfig,
  LogRecordExporter,
  LoggerProviderConfig,
} from '@opentelemetry/sdk-logs';

const RESOURCE_DETECTOR_ENVIRONMENT = 'env';
const RESOURCE_DETECTOR_HOST = 'host';
const RESOURCE_DETECTOR_OS = 'os';
const RESOURCE_DETECTOR_PROCESS = 'process';
const RESOURCE_DETECTOR_SERVICE_INSTANCE_ID = 'serviceinstance';

export function getResourceDetectorsFromEnv(): Array<ResourceDetector> {
  // When updating this list, make sure to also update the section `resourceDetectors` on README.
  const resourceDetectors = new Map<string, ResourceDetector>([
    [RESOURCE_DETECTOR_HOST, hostDetector],
    [RESOURCE_DETECTOR_OS, osDetector],
    [RESOURCE_DETECTOR_SERVICE_INSTANCE_ID, serviceInstanceIdDetector],
    [RESOURCE_DETECTOR_PROCESS, processDetector],
    [RESOURCE_DETECTOR_ENVIRONMENT, envDetector],
  ]);

  const resourceDetectorsFromEnv = getStringListFromEnv(
    'OTEL_NODE_RESOURCE_DETECTORS'
  ) ?? ['all'];

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

export function getSpanProcessorsFromEnv(): SpanProcessor[] {
  const exportersMap = new Map<string, () => SpanExporter>([
    ['otlp', () => getOtlpExporterFromEnv()],
    ['zipkin', () => new ZipkinExporter()],
    ['console', () => new ConsoleSpanExporter()],
  ]);
  const exporters: SpanExporter[] = [];
  const processors: SpanProcessor[] = [];
  let traceExportersList = Array.from(
    new Set(getStringListFromEnv('OTEL_TRACES_EXPORTER'))
  ).filter(s => s !== 'null');

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

  if (propagatorsEnvVarValue.includes('none')) {
    return null;
  }

  // Implementation note: this only contains specification required propagators that are actually hosted in this repo.
  // Any other propagators (like aws, aws-lambda, should go into `@opentelemetry/auto-configuration-propagators` instead).
  const propagatorsFactory = new Map<string, () => TextMapPropagator>([
    ['tracecontext', () => new W3CTraceContextPropagator()],
    ['baggage', () => new W3CBaggagePropagator()],
    ['b3', () => new B3Propagator()],
    [
      'b3multi',
      () => new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
    ],
    ['jaeger', () => new JaegerPropagator()],
  ]);

  // Values MUST be deduplicated in order to register a Propagator only once.
  const uniquePropagatorNames = Array.from(new Set(propagatorsEnvVarValue));
  const validPropagators: TextMapPropagator[] = [];

  uniquePropagatorNames.forEach(name => {
    const propagator = propagatorsFactory.get(name)?.();
    if (!propagator) {
      diag.warn(
        `Propagator "${name}" requested through environment variable is unavailable.`
      );
      return;
    }

    validPropagators.push(propagator);
  });

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

/**
 * Get a propagator as defined by configuration model from configuration
 */
export function getPropagatorFromConfiguration(
  config: ConfigurationModel
): TextMapPropagator | null | undefined {
  const propagatorsValue = getKeyListFromObjectArray(
    config.propagator?.composite
  );
  if (propagatorsValue == null) {
    // return undefined to fall back to default
    return undefined;
  }

  if (propagatorsValue.includes('none')) {
    return null;
  }

  // Implementation note: this only contains specification required propagators that are actually hosted in this repo.
  // Any other propagators (like aws, aws-lambda, should go into `@opentelemetry/auto-configuration-propagators` instead).
  const propagatorsFactory = new Map<string, () => TextMapPropagator>([
    ['tracecontext', () => new W3CTraceContextPropagator()],
    ['baggage', () => new W3CBaggagePropagator()],
    ['b3', () => new B3Propagator()],
    [
      'b3multi',
      () => new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
    ],
    ['jaeger', () => new JaegerPropagator()],
  ]);

  // Values MUST be deduplicated in order to register a Propagator only once.
  const uniquePropagatorNames = Array.from(new Set(propagatorsValue));
  const validPropagators: TextMapPropagator[] = [];

  uniquePropagatorNames.forEach(name => {
    const propagator = propagatorsFactory.get(name)?.();
    if (!propagator) {
      diag.warn(
        `Propagator "${name}" requested through configuration is unavailable.`
      );
      return;
    }

    validPropagators.push(propagator);
  });

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

export function setupContextManager(
  contextManager: ContextManager | null | undefined
) {
  // null means 'do not register'
  if (contextManager === null) {
    return;
  }

  // undefined means 'register default'
  if (contextManager === undefined) {
    const defaultContextManager = new AsyncLocalStorageContextManager();
    defaultContextManager.enable();
    context.setGlobalContextManager(defaultContextManager);
    return;
  }

  contextManager.enable();
  context.setGlobalContextManager(contextManager);
}

export function setupDefaultContextManager() {
  const defaultContextManager = new AsyncLocalStorageContextManager();
  defaultContextManager.enable();
  context.setGlobalContextManager(defaultContextManager);
}

export function setupPropagator(
  propagator: TextMapPropagator | null | undefined
) {
  // null means 'do not register'
  if (propagator === null) {
    return;
  }

  // undefined means 'register default'
  if (propagator === undefined) {
    propagation.setGlobalPropagator(
      new CompositePropagator({
        propagators: [
          new W3CTraceContextPropagator(),
          new W3CBaggagePropagator(),
        ],
      })
    );
    return;
  }

  propagation.setGlobalPropagator(propagator);
}

export function getKeyListFromObjectArray(
  obj: object[] | undefined
): string[] | undefined {
  if (!obj || obj.length === 0) {
    return undefined;
  }
  return obj
    .map(item => Object.keys(item))
    .reduce((prev, curr) => prev.concat(curr), []);
}

export function getNonNegativeNumberFromEnv(
  envVarName: string
): number | undefined {
  const value = getNumberFromEnv(envVarName);
  if (value != null && value <= 0) {
    diag.warn(
      `${envVarName} (${value}) is invalid, expected number greater than 0, using default.`
    );
    return undefined;
  }
  return value;
}

export function getPeriodicExportingMetricReaderFromEnv(
  exporter: PushMetricExporter
): IMetricReader {
  const defaultTimeoutMillis = 30_000;
  const defaultIntervalMillis = 60_000;

  const rawExportIntervalMillis = getNonNegativeNumberFromEnv(
    'OTEL_METRIC_EXPORT_INTERVAL'
  );
  const rawExportTimeoutMillis = getNonNegativeNumberFromEnv(
    'OTEL_METRIC_EXPORT_TIMEOUT'
  );

  // Apply defaults
  const exportIntervalMillis = rawExportIntervalMillis ?? defaultIntervalMillis;
  let exportTimeoutMillis = rawExportTimeoutMillis ?? defaultTimeoutMillis;

  // Ensure timeout doesn't exceed interval
  if (exportTimeoutMillis > exportIntervalMillis) {
    // determine which env vars were set and which ones defaulted for logging purposes
    const timeoutSource =
      rawExportTimeoutMillis != null
        ? rawExportTimeoutMillis.toString()
        : `${defaultTimeoutMillis}, default`;
    const intervalSource =
      rawExportIntervalMillis != null
        ? rawExportIntervalMillis.toString()
        : `${defaultIntervalMillis}, default`;

    const bothSetByUser =
      rawExportTimeoutMillis != null && rawExportIntervalMillis != null;
    const logMessage = `OTEL_METRIC_EXPORT_TIMEOUT (${timeoutSource}) is greater than OTEL_METRIC_EXPORT_INTERVAL (${intervalSource}). Clamping timeout to interval value.`;

    // only bother users if they explicitly set both values.
    if (bothSetByUser) {
      diag.warn(logMessage);
    } else {
      diag.info(logMessage);
    }

    exportTimeoutMillis = exportIntervalMillis;
  }

  return new PeriodicExportingMetricReader({
    exportTimeoutMillis,
    exportIntervalMillis,
    exporter,
  });
}

export function getOtlpMetricExporterFromEnv(): PushMetricExporter {
  const protocol =
    (
      getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_PROTOCOL') ??
      getStringFromEnv('OTEL_EXPORTER_OTLP_PROTOCOL')
    )?.trim() || 'http/protobuf'; // Using || to also fall back on empty string

  switch (protocol) {
    case 'grpc':
      return new OTLPGrpcMetricExporter();
    case 'http/json':
      return new OTLPHttpMetricExporter();
    case 'http/protobuf':
      return new OTLPProtoMetricExporter();
  }

  diag.warn(
    `Unsupported OTLP metrics protocol: "${protocol}". Using http/protobuf.`
  );
  return new OTLPProtoMetricExporter();
}

/**
 * Get LoggerProviderConfig from environment variables.
 */
export function getLoggerProviderConfigFromEnv(): LoggerProviderConfig {
  return {
    logRecordLimits: {
      attributeCountLimit:
        getNonNegativeNumberFromEnv('OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT') ??
        getNonNegativeNumberFromEnv('OTEL_ATTRIBUTE_COUNT_LIMIT'),
      attributeValueLengthLimit:
        getNonNegativeNumberFromEnv(
          'OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT'
        ) ?? getNonNegativeNumberFromEnv('OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT'),
    },
  };
}

/**
 * Get configuration for BatchLogRecordProcessor from environment variables.
 */
export function getBatchLogRecordProcessorConfigFromEnv(): BufferConfig {
  return {
    maxQueueSize: getNonNegativeNumberFromEnv('OTEL_BLRP_MAX_QUEUE_SIZE'),
    scheduledDelayMillis: getNonNegativeNumberFromEnv(
      'OTEL_BLRP_SCHEDULED_DELAY_MILLIS'
    ),
    exportTimeoutMillis: getNonNegativeNumberFromEnv(
      'OTEL_BLRP_EXPORT_TIMEOUT_MILLIS'
    ),
    maxExportBatchSize: getNonNegativeNumberFromEnv(
      'OTEL_BLRP_MAX_EXPORT_BATCH_SIZE'
    ),
  };
}

export function getBatchLogRecordProcessorFromEnv(
  exporter: LogRecordExporter
): BatchLogRecordProcessor {
  return new BatchLogRecordProcessor(
    exporter,
    getBatchLogRecordProcessorConfigFromEnv()
  );
}

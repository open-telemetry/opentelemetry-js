/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Create SDK components from environment variable settings.
 * https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/
 */

import type {
  MeterProvider as ApiMeterProvider,
  TextMapPropagator,
} from '@opentelemetry/api';
import { diag } from '@opentelemetry/api';
import {
  CompositePropagator,
  getNumberFromEnv,
  getStringFromEnv,
  getStringListFromEnv,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import type {
  Sampler,
  SpanExporter,
  SpanLimits,
  SpanProcessor,
} from '@opentelemetry/sdk-trace';
import { TracerProvider } from '@opentelemetry/sdk-trace';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import type {
  LogRecordProcessor,
  LogRecordLimits,
} from '@opentelemetry/sdk-logs';
import {
  ConsoleLogRecordExporter,
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { OTLPLogExporter as OTLPHttpLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPLogExporter as OTLPGrpcLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPLogExporter as OTLPProtoLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import type { IMetricReader } from '@opentelemetry/sdk-metrics';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import type { ResourceDetector, Resource } from '@opentelemetry/resources';
import {
  defaultResource,
  detectResources,
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
  resourceFromAttributes,
  serviceInstanceIdDetector,
} from '@opentelemetry/resources';
import type { StartSdkFromEnvOptions } from './types';
import { serviceNameEnvDetector } from './ServiceNameEnvDetector';

// Note: circular import here that would be nice to break
import {
  getBatchLogRecordProcessorFromEnv,
  getMetricReadersFromEnv,
  getNonNegativeNumberFromEnv,
  getSpanProcessorsFromEnv,
} from './utils';

/**
 * Return a TextMapPropagator per the OTEL_PROPAGATORS envvar, or a default.
 * This *warns* on and ignores unknown propagator names.
 * This may return `null` if "none" is in OTEL_PROPAGATORS, or only unknown
 * propagator names were provided.
 */
export function createPropagatorFromEnv(): TextMapPropagator | null {
  let propagatorNames = getStringListFromEnv('OTEL_PROPAGATORS') ?? [];
  if (propagatorNames.length === 0) {
    propagatorNames = ['tracecontext', 'baggage']; // default value
  }
  if (propagatorNames.includes('none')) {
    return null;
  }
  propagatorNames = Array.from(new Set(propagatorNames)); // dedupe

  // Implementation note: this only contains specification required propagators that are actually hosted in this repo.
  // Any other propagators (like aws, aws-lambda, should go into `@opentelemetry/auto-configuration-propagators` instead).
  const propagatorFactory = new Map<string, () => TextMapPropagator>([
    ['tracecontext', () => new W3CTraceContextPropagator()],
    ['baggage', () => new W3CBaggagePropagator()],
    ['b3', () => new B3Propagator()],
    [
      'b3multi',
      () => new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
    ],
    [
      'jaeger',
      () => {
        diag.warn(
          'The Jaeger propagator is deprecated and will be removed in a future release. Use the W3C TraceContext propagator ("tracecontext") instead.'
        );
        return new JaegerPropagator();
      },
    ],
  ]);

  const propagators = [];
  for (const name of propagatorNames) {
    const propagator = propagatorFactory.get(name)?.();
    if (!propagator) {
      diag.warn(`unknown propagator from "OTEL_PROPAGATORS": "${name}"`);
    } else {
      propagators.push(propagator);
    }
  }

  if (propagators.length === 0) {
    return null;
  } else if (propagators.length === 1) {
    return propagators[0];
  } else {
    return new CompositePropagator({ propagators });
  }
}

// XXX See if cleanly can move these to create-from-env (need the StartSdk*Options types there, then) -> types.ts
export function createPropagatorFromOptsAndEnv(
  optsPropagators: StartSdkFromEnvOptions['propagators']
): TextMapPropagator | null {
  let propagator: TextMapPropagator | null;
  if (optsPropagators !== undefined) {
    if (optsPropagators === null) {
      propagator = null;
    } else if (optsPropagators.length === 0) {
      throw new Error(
        'invalid "propagators" option: must have at least one item'
      );
    } else if (optsPropagators.length === 1) {
      propagator = optsPropagators[0];
    } else {
      propagator = new CompositePropagator({ propagators: optsPropagators });
    }
  } else {
    propagator = createPropagatorFromEnv();
  }
  return propagator;
}

export function createResourceFromOptsAndEnv(
  opts?: Pick<
    StartSdkFromEnvOptions,
    'baseResource' | 'resourceDetectors' | 'resourceAttributes'
  >
): Resource {
  let resource = opts?.baseResource ?? defaultResource();

  // Resource detectors
  let detectors: ResourceDetector[];
  if (opts?.resourceDetectors) {
    detectors = opts.resourceDetectors;
  } else {
    // XXX Debatable what should be the default set of res detectors.
    // - Current NodeSDK uses 'env,process,host'
    // - `os.*` and `host.*` are useful, but are still in "Development"
    //   https://opentelemetry.io/docs/specs/semconv/registry/attributes/os/
    //   https://opentelemetry.io/docs/specs/semconv/registry/attributes/host/
    // - `process.*` is still in "Development", and can include some noise, and possibly more data than intended with `process.command_args`.
    // - `serviceinstance` should be added (perhaps eventually called "service")
    // - `startNodeSdk()` is a breaking replacement for NodeSDK so we could opt
    //   to change to using the new spec names: https://opentelemetry.io/docs/specs/otel/resource/sdk/#resource-detector-name
    //   TODO: do this, similar to create-from-config.ts handling
    // - My vote is just 'service'. Others can be added when they are stabilized.
    //   Documented advice should be to make a per-app explicit decision.
    // - XXX handle the env switch?? then both OTEL_ related envvars. Sigh.
    // - XXX can we export some utilities here to make auto-instr-node handling easier?
    const DEFAULT_RESOURCE_DETECTOR_NAMES = 'service'.split(',')

    let detectorNames = getStringListFromEnv('OTEL_NODE_RESOURCE_DETECTORS');
    if (!detectorNames || detectorNames.length === 0) {
      // XXX Handling empty list here fixes an issue from getResourceDetectorsFromEnv, BTW.
      detectorNames = DEFAULT_RESOURCE_DETECTOR_NAMES;
    } else if (detectorNames.includes('none')) {
      detectorNames = [];
    } else if (detectorNames.includes('all')) {
      detectorNames = 'host,process,service'.split(',');
    }

    // Support the names defined at https://opentelemetry.io/docs/specs/otel/resource/sdk/#resource-detector-name
    // and warn about no longer supported names used by `new NodeSDK()`.
    detectors = [];
    for (const detectorName of detectorNames) {
      switch (detectorName) {
        case 'process':
          detectors.push(processDetector);
          break;
        case 'os':
          diag.warn(
            `"os" resource detector name is no longer supported, use "host" which populates 'host.*' and 'os.*' resource attributes (see https://opentelemetry.io/docs/specs/otel/resource/sdk/#resource-detector-name)`
          );
          break;
        case 'host':
          detectors.push(hostDetector);
          detectors.push(osDetector);
          break;
        case 'serviceinstance':
          diag.warn(
            `"serviceinstance" resource detector name is no longer supported, use "service" which populates 'service.instance.id' and reads OTEL_SERVICE_NAME (see https://opentelemetry.io/docs/specs/otel/resource/sdk/#resource-detector-name)`
          );
          break;
        case 'service':
          detectors.push(serviceInstanceIdDetector);
          detectors.push(serviceNameEnvDetector);
          break;
        case 'env':
          detectors.push(envDetector);
          break;
        default:
          diag.warn(
            `unknown resource detector "${detectorName}" in OTEL_NODE_RESOURCE_DETECTORS environment variable: this detector will be skipped`
          );
          break;
      }
    }
  }
  if (detectors.length > 0) {
    resource = resource.merge(detectResources({ detectors }));
  }

  // Handle OTEL_RESOURCE_ATTRIBUTES.
  //
  // One twist from the spec is that while attrs from `OTEL_RESOURCE_ATTRIBUTES`
  // should win over those from resource detectors, an exception is
  // `OTEL_SERVICE_NAME` from the "service" detector should win.
  // Currently `envDetector` v2.10.0 *also* reads OTEL_SERVICE_NAME, so we
  // don't need to do anything here. If/when `envDetector` (see #6988) stops
  // reading OTEL_SERVICE_NAME, then will need to:
  //    if 'service.name' in envAttrs && detectors && serviceNameEnvDetector in detectors && it set 'service.name': delete envAttrs['service.name']
  // XXX this is wrong, cannot use envDetector, because if 'service' is not selected, then this reads OTEL_SERVICE_NAME when should not, sigh.
  // XXX HERE Let's add *new* experimental detectors to ores: ServiceNameEnvDetector, ResourceAttributesEnvDetector, envDetector is a grouping of the two.
  //     Downstream can use the two as primitives.
  resource = resource.merge(detectResources({ detectors: [envDetector] }));

  if (opts?.resourceAttributes) {
    resource = resource.merge(resourceFromAttributes(opts.resourceAttributes));
  }

  return resource;
}

const DEFAULT_RATIO = 1;

export function createSamplerFromEnv(): Sampler | undefined {
  const samplerName = getStringFromEnv('OTEL_TRACES_SAMPLER');
  if (samplerName === undefined) {
    return undefined;
  }
  switch (samplerName) {
    case 'always_on':
      return new AlwaysOnSampler();
    case 'always_off':
      return new AlwaysOffSampler();
    case 'parentbased_always_on':
      return new ParentBasedSampler({
        root: new AlwaysOnSampler(),
      });
    case 'parentbased_always_off':
      return new ParentBasedSampler({
        root: new AlwaysOffSampler(),
      });
    case 'traceidratio':
      return new TraceIdRatioBasedSampler(getSamplerRatioFromEnv());
    case 'parentbased_traceidratio':
      return new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(getSamplerRatioFromEnv()),
      });
    default:
      diag.error(
        `unknown OTEL_TRACES_SAMPLER value "${samplerName}", using default`
      );
      return undefined;
  }
}

function getSamplerRatioFromEnv(): number | undefined {
  const ratio = getNumberFromEnv('OTEL_TRACES_SAMPLER_ARG');
  if (ratio == null) {
    diag.error(
      `OTEL_TRACES_SAMPLER_ARG is blank, defaulting to ${DEFAULT_RATIO}.`
    );
    return DEFAULT_RATIO;
  }

  if (ratio < 0 || ratio > 1) {
    diag.error(
      `OTEL_TRACES_SAMPLER_ARG=${ratio} was given, but it is out of range ([0..1]), defaulting to ${DEFAULT_RATIO}.`
    );
    return DEFAULT_RATIO;
  }

  return ratio;
}

export function createSpanLimitsFromEnv(): SpanLimits | undefined {
  return {
    attributeCountLimit:
      getNumberFromEnv('OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT') ??
      getNumberFromEnv('OTEL_ATTRIBUTE_COUNT_LIMIT'),
    attributeValueLengthLimit:
      getNumberFromEnv('OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT') ??
      getNumberFromEnv('OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT'),
    eventCountLimit: getNumberFromEnv('OTEL_SPAN_EVENT_COUNT_LIMIT'),
    linkCountLimit: getNumberFromEnv('OTEL_SPAN_LINK_COUNT_LIMIT'),
    attributePerEventCountLimit: getNumberFromEnv(
      'OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT'
    ),
    attributePerLinkCountLimit: getNumberFromEnv(
      'OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT'
    ),
  };
}

export function createBatchSpanProcessorFromEnv(
  exporter: SpanExporter,
  selfObsMeterProvider?: ApiMeterProvider
): BatchSpanProcessor {
  return new BatchSpanProcessor({
    exporter,
    selfObsMeterProvider,
    maxQueueSize: getNonNegativeNumberFromEnv('OTEL_BSP_MAX_QUEUE_SIZE'),
    scheduledDelayMillis: getNonNegativeNumberFromEnv(
      'OTEL_BSP_SCHEDULE_DELAY'
    ),
    exportTimeoutMillis: getNonNegativeNumberFromEnv('OTEL_BSP_EXPORT_TIMEOUT'),
    maxExportBatchSize: getNonNegativeNumberFromEnv(
      'OTEL_BSP_MAX_EXPORT_BATCH_SIZE'
    ),
  });
}

export function createTracerProviderFromOptsAndEnv(
  resource: Resource,
  opts?: Pick<
    StartSdkFromEnvOptions,
    'spanProcessors' | 'sampler' | 'spanLimits'
  >,
  meterProvider?: ApiMeterProvider
): TracerProvider | undefined {
  let spanProcessors: SpanProcessor[];
  if (opts?.spanProcessors) {
    spanProcessors = opts.spanProcessors;
  } else {
    spanProcessors = getSpanProcessorsFromEnv(meterProvider);
  }

  if (spanProcessors.length === 0) {
    return undefined;
  } else {
    return new TracerProvider({
      resource,
      spanProcessors,
      sampler: opts?.sampler ?? createSamplerFromEnv(),
      spanLimits: {
        ...createSpanLimitsFromEnv(),
        ...opts?.spanLimits,
      },
      meterProvider,
    });
  }
}

function createLogRecordLimitsFromEnv(): LogRecordLimits | undefined {
  return {
    attributeCountLimit:
      getNumberFromEnv('OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT') ??
      getNumberFromEnv('OTEL_ATTRIBUTE_COUNT_LIMIT'),
    attributeValueLengthLimit:
      getNumberFromEnv('OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT') ??
      getNumberFromEnv('OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT'),
  };
}

function createLogRecordProcessorsFromEnv(
  selfObsMeterProvider: ApiMeterProvider | undefined
): LogRecordProcessor[] {
  let exporterNames = Array.from(
    new Set(getStringListFromEnv('OTEL_LOGS_EXPORTER') ?? [])
  );
  if (exporterNames.length === 0) {
    exporterNames = ['otlp'];
  }
  if (exporterNames.includes('none')) {
    return [];
  }

  const exporters = [];
  for (const exporterName of exporterNames) {
    switch (exporterName) {
      case 'otlp': {
        const protocol =
          (
            getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_PROTOCOL') ??
            getStringFromEnv('OTEL_EXPORTER_OTLP_PROTOCOL')
          )?.trim() || 'http/protobuf'; // Using || to also fall back on empty string
        switch (protocol) {
          case 'grpc':
            exporters.push(new OTLPGrpcLogExporter());
            break;
          case 'http/json':
            exporters.push(new OTLPHttpLogExporter());
            break;
          case 'http/protobuf':
            exporters.push(new OTLPProtoLogExporter());
            break;
          default:
            diag.warn(
              `Unsupported OTLP logs protocol: "${protocol}". Using http/protobuf.`
            );
            exporters.push(new OTLPProtoLogExporter());
        }
        break;
      }
      case 'console':
        exporters.push(new ConsoleLogRecordExporter());
        break;
      default:
        diag.warn(
          `Unsupported exporter name in OTEL_LOGS_EXPORTER: "${exporterName}". Supported values are: otlp, console, none.`
        );
        break;
    }
  }

  return exporters.map(exporter => {
    if (exporter instanceof ConsoleLogRecordExporter) {
      return new SimpleLogRecordProcessor({
        exporter,
        selfObsMeterProvider,
      });
    } else {
      return getBatchLogRecordProcessorFromEnv(exporter, selfObsMeterProvider);
    }
  });
}

export function createLoggerProviderFromOptsAndEnv(
  resource: Resource,
  opts?: Pick<
    StartSdkFromEnvOptions,
    'logRecordProcessors' | 'logRecordLimits'
  >,
  meterProvider?: ApiMeterProvider
): LoggerProvider | undefined {
  let processors: LogRecordProcessor[];
  if (opts?.logRecordProcessors) {
    processors = opts.logRecordProcessors;
  } else {
    processors = createLogRecordProcessorsFromEnv(meterProvider);
  }

  if (processors.length === 0) {
    return undefined;
  } else {
    return new LoggerProvider({
      resource,
      processors,
      logRecordLimits: {
        ...createLogRecordLimitsFromEnv(),
        ...opts?.logRecordLimits,
      },
      meterProvider,
    });
  }
}

export function createMeterProviderFromOptsAndEnv(
  resource: Resource,
  opts?: Pick<StartSdkFromEnvOptions, 'metricReaders' | 'views'>,
  sdkMetricsEnabled?: boolean
): MeterProvider | undefined {
  let readers: IMetricReader[];
  if (opts?.metricReaders) {
    readers = opts.metricReaders;
  } else {
    readers = getMetricReadersFromEnv();
  }

  if (readers.length === 0) {
    return undefined;
  } else {
    return new MeterProvider({
      resource,
      views: opts?.views,
      readers,
      sdkMetricsEnabled,
    });
  }
}

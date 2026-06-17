/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ContextManager, TextMapPropagator } from '@opentelemetry/api';
import { context, diag, propagation } from '@opentelemetry/api';
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
import type {
  DetectedResourceAttributes,
  Resource,
  ResourceDetector,
} from '@opentelemetry/resources';
import {
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
  resourceFromAttributes,
  serviceInstanceIdDetector,
} from '@opentelemetry/resources';
import type {
  Sampler,
  SpanExporter,
  SpanLimits,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  BatchSpanProcessor,
  ConsoleSpanExporter,
  ParentBasedSampler,
  SimpleSpanProcessor,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { OTLPLogExporter as OTLPHttpLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPLogExporter as OTLPGrpcLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPLogExporter as OTLPProtoLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import {
  createEmptyMetadata,
  createInsecureCredentials,
  createSslCredentials,
} from '@opentelemetry/otlp-grpc-exporter-base';
import type {
  ConfigurationModel,
  LogRecordExporterConfigModel,
  InstrumentTypeConfigModel,
  AggregationConfigModel,
  MetricProducerConfigModel,
  PeriodicMetricReaderConfigModel,
  SpanExporterConfigModel,
  SamplerConfigModel,
  NameStringValuePairConfigModel,
  HttpTlsConfigModel,
  GrpcTlsConfigModel,
  TextMapPropagatorConfigModel,
  AttributeLimitsConfigModel,
  BatchLogRecordProcessorConfigModel,
  LoggerProviderConfigModel,
  LogRecordProcessorConfigModel,
  OtlpGrpcExporterConfigModel,
  OtlpHttpExporterConfigModel,
  SimpleLogRecordProcessorConfigModel,
  LogRecordLimitsConfigModel,
} from '@opentelemetry/configuration';
import {
  mergePropagatorCompositeConfig,
  mergeResourceAttributesConfig,
} from '@opentelemetry/configuration';
import type {
  AggregationOption,
  IAttributesProcessor,
  IMetricReader,
  PushMetricExporter,
  ViewOptions,
} from '@opentelemetry/sdk-metrics';
import {
  AggregationType,
  ConsoleMetricExporter,
  createAllowListAttributesProcessor,
  createDenyListAttributesProcessor,
  InstrumentType,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter as OTLPGrpcMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPMetricExporter as OTLPHttpMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPMetricExporter as OTLPProtoMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import type {
  BatchLogRecordProcessorOptions,
  LogRecordExporter,
  LoggerProviderOptions,
  LogRecordProcessor,
  LogRecordLimits,
} from '@opentelemetry/sdk-logs';
import type { MetricProducer } from '@opentelemetry/sdk-metrics';
import {
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
  SimpleLogRecordProcessor,
  LoggerProvider,
} from '@opentelemetry/sdk-logs';
import * as fs from 'fs';
import { inspect } from 'util';

const RESOURCE_DETECTOR_ENVIRONMENT = 'env';
const RESOURCE_DETECTOR_HOST = 'host';
const RESOURCE_DETECTOR_OS = 'os';
const RESOURCE_DETECTOR_PROCESS = 'process';
const RESOURCE_DETECTOR_SERVICE_INSTANCE_ID = 'serviceinstance';

export function getResourceFromConfiguration(
  config: ConfigurationModel
): Resource | undefined {
  if (!config.resource) {
    return undefined;
  }

  const configAttrs = mergeResourceAttributesConfig(
    config.resource.attributes,
    config.resource.attributes_list
  );
  if (!configAttrs) {
    return undefined;
  }

  const attrs: DetectedResourceAttributes = {};
  for (let i = 0; i < configAttrs.length; i++) {
    const a = configAttrs[i];
    if (a.value !== null) {
      attrs[a.name] = a.value;
    }
  }
  return resourceFromAttributes(attrs, {
    schemaUrl: config.resource.schema_url ?? undefined,
  });
}

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

export function getResourceDetectorsFromConfiguration(
  config: ConfigurationModel
): Array<ResourceDetector> {
  const detectors = config.resource?.['detection/development']?.detectors ?? [];

  return detectors.flatMap(detector => {
    const result: ResourceDetector[] = [];
    if (detector.host !== undefined) result.push(hostDetector);
    if (detector.os !== undefined) result.push(osDetector);
    if (detector.process !== undefined) result.push(processDetector);
    if (detector.service !== undefined) result.push(serviceInstanceIdDetector);
    if (detector.env !== undefined) result.push(envDetector);
    return result;
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
): TextMapPropagator | undefined {
  if (!config.propagator) {
    return undefined;
  }

  const configComposite = mergePropagatorCompositeConfig(
    config.propagator.composite,
    config.propagator.composite_list
  );
  if (!configComposite) {
    return undefined;
  }

  // TextMapPropagator config items are objects with a single key (the name).
  // Transform this into a more convenient `(name, value)` 2-tuple.
  //
  // As well, guard against two cases where the TypeScript type
  // `TextMapPropagatorConfigModel` does not exactly represent the JSON schema:
  // 1. `"minProperties": 1, "maxProperties": 1,`
  // 2. The type allows keys with an `undefined` value, but the JSON schema
  //    does not.
  const kvFromItem = (
    item: TextMapPropagatorConfigModel
  ): [string, object | null] => {
    const keys = [];
    let value = undefined;
    for (const key of Object.keys(item)) {
      value = item[key];
      if (value === undefined) {
        continue;
      }
      keys.push(key);
    }
    if (keys.length !== 1) {
      throw new Error(
        `invalid "propagator" entry in configuration, there must be exactly one key (with a non-undefined value): ${inspect(item)}`
      );
    }
    return [keys[0], value as object | null];
  };

  // First pass: handle 'none', remove dupes.
  const names = new Set();
  const kvs = [];
  for (const item of configComposite) {
    const kv = kvFromItem(item);
    const k = kv[0];
    if (names.has(k)) {
      continue;
    }
    names.add(k);
    kvs.push(kv);
    if (k === 'none') {
      return undefined;
    }
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

  const validPropagators: TextMapPropagator[] = [];
  for (const [name] of kvs) {
    const propagator = propagatorsFactory.get(name)?.();
    if (!propagator) {
      diag.warn(
        `Propagator "${name}" requested through configuration is unavailable.`
      );
      continue;
    }
    validPropagators.push(propagator);
  }

  if (validPropagators.length === 0) {
    return undefined;
  } else if (validPropagators.length === 1) {
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

  const keys: string[] = [];
  for (const item of obj) {
    for (const key of Object.keys(item)) {
      keys.push(key);
    }
  }
  return keys;
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

function getMetricProducersFromConfiguration(
  producers: MetricProducerConfigModel[] | undefined
): MetricProducer[] | undefined {
  if (!producers || producers.length === 0) {
    return undefined;
  }
  const result: MetricProducer[] = [];
  for (const producer of producers) {
    if (producer.opencensus) {
      try {
        const {
          OpenCensusMetricProducer,
          // eslint-disable-next-line @typescript-eslint/no-require-imports
        } = require('@opentelemetry/shim-opencensus');
        result.push(new OpenCensusMetricProducer());
      } catch {
        diag.warn(
          'OpenCensus metric producer configured but @opentelemetry/shim-opencensus is not installed.'
        );
      }
    } else {
      diag.warn('Unsupported metric producer configured.');
    }
  }
  return result.length > 0 ? result : undefined;
}

export function getPeriodicMetricReaderFromConfiguration(
  periodic: PeriodicMetricReaderConfigModel
): IMetricReader | undefined {
  if (periodic.exporter) {
    let exporter;
    if (periodic.exporter.otlp_http !== undefined) {
      const encoding = periodic.exporter.otlp_http?.encoding ?? 'protobuf';
      if (encoding === 'json') {
        exporter = new OTLPHttpMetricExporter({
          compression:
            periodic.exporter.otlp_http?.compression === 'gzip'
              ? CompressionAlgorithm.GZIP
              : CompressionAlgorithm.NONE,
        });
      } else if (encoding === 'protobuf') {
        exporter = new OTLPProtoMetricExporter({
          compression:
            periodic.exporter.otlp_http?.compression === 'gzip'
              ? CompressionAlgorithm.GZIP
              : CompressionAlgorithm.NONE,
        });
      } else {
        diag.warn(`Unsupported OTLP metrics encoding: ${encoding}.`);
      }
    }
    if (periodic.exporter.otlp_grpc !== undefined) {
      exporter = new OTLPGrpcMetricExporter({
        compression:
          periodic.exporter.otlp_grpc?.compression === 'gzip'
            ? CompressionAlgorithm.GZIP
            : CompressionAlgorithm.NONE,
      });
    }

    const metricProducers = getMetricProducersFromConfiguration(
      periodic.producers
    );

    if (exporter) {
      // TODO(6425): add cardinality_limits
      return new PeriodicExportingMetricReader({
        exportIntervalMillis: periodic.interval ?? 60_000,
        exportTimeoutMillis: periodic.timeout ?? 30_000,
        exporter,
        metricProducers,
      });
    }
    if (periodic.exporter.console !== undefined) {
      return new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter(),
        metricProducers,
      });
    }
  }
  diag.warn('Unsupported Metric Exporter.');
  return undefined;
}

/**
 * Get LoggerProviderConfig from environment variables.
 */
export function getLoggerProviderConfigFromEnv(): LoggerProviderOptions {
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
export function getBatchLogRecordProcessorConfigFromEnv(): Omit<
  BatchLogRecordProcessorOptions,
  'exporter'
> {
  return {
    maxQueueSize: getNonNegativeNumberFromEnv('OTEL_BLRP_MAX_QUEUE_SIZE'),
    scheduledDelayMillis: getNonNegativeNumberFromEnv(
      'OTEL_BLRP_SCHEDULE_DELAY'
    ),
    exportTimeoutMillis: getNonNegativeNumberFromEnv(
      'OTEL_BLRP_EXPORT_TIMEOUT'
    ),
    maxExportBatchSize: getNonNegativeNumberFromEnv(
      'OTEL_BLRP_MAX_EXPORT_BATCH_SIZE'
    ),
  };
}

export function getBatchLogRecordProcessorFromEnv(
  exporter: LogRecordExporter
): BatchLogRecordProcessor {
  return new BatchLogRecordProcessor({
    exporter,
    ...getBatchLogRecordProcessorConfigFromEnv(),
  });
}

function createLogRecordLimitsFromConfig(
  limits?: LogRecordLimitsConfigModel,
  attribute_limits?: AttributeLimitsConfigModel
): LogRecordLimits {
  return {
    attributeValueLengthLimit:
      limits?.attribute_value_length_limit ??
      attribute_limits?.attribute_value_length_limit ??
      undefined,
    attributeCountLimit:
      limits?.attribute_count_limit ??
      attribute_limits?.attribute_count_limit ??
      undefined,
  };
}

export function createLoggerProviderFromConfig(
  resource: Resource,
  logger_provider: LoggerProviderConfigModel,
  attribute_limits?: AttributeLimitsConfigModel
): LoggerProvider {
  const processors = logger_provider.processors.map(p =>
    createLogRecordProcessorFromConfig(p)
  );
  const logRecordLimits = createLogRecordLimitsFromConfig(
    logger_provider.limits,
    attribute_limits
  );
  checkConfigUse('LoggerProvider', logger_provider, ['processors', 'limits']);

  return new LoggerProvider({
    resource,
    processors,
    logRecordLimits,
    // TODO: loggerConfigurator
    // TODO: meterProvider
    // Note: forceFlushTimeoutMillis not configurable via decl conf.
  });
}

export function createLogRecordExporterFromConfig(
  exporter: LogRecordExporterConfigModel
): LogRecordExporter {
  const [name, properties] = mustSingleEntry(exporter, 'LogRecordExporter');

  switch (name) {
    case 'otlp_http': {
      const props = properties as OtlpHttpExporterConfigModel;
      const commonOpts = {
        compression:
          props?.compression === 'gzip'
            ? CompressionAlgorithm.GZIP
            : CompressionAlgorithm.NONE,
        url: props?.endpoint ?? undefined,
        headers: getHeadersFromConfiguration(props?.headers),
        timeoutMillis: validateExporterTimeout(props?.timeout),
        httpAgentOptions: getHttpAgentOptionsFromTls(props?.tls),
      };
      const encoding = props?.encoding ?? 'protobuf';
      switch (encoding) {
        case 'json':
          return new OTLPHttpLogExporter(commonOpts);
        case 'protobuf':
          return new OTLPProtoLogExporter(commonOpts);
        default:
          throw new Error(
            `unknown OtlpHttpExporter encoding in configuration: "${encoding}"`
          );
      }
    }

    case 'otlp_grpc': {
      const props = properties as OtlpGrpcExporterConfigModel;
      return new OTLPGrpcLogExporter({
        compression:
          props?.compression === 'gzip'
            ? CompressionAlgorithm.GZIP
            : CompressionAlgorithm.NONE,
        url: props?.endpoint ?? undefined,
        timeoutMillis: validateExporterTimeout(props?.timeout),
        credentials: getGrpcCredentialsFromTls(props?.tls),
        metadata: getGrpcMetadataFromHeaders(props?.headers),
      });
    }

    case 'console':
      return new ConsoleLogRecordExporter();

    default:
      throw new Error(
        `unknown LogRecordExporter name in configuration: "${name}"`
      );
  }
}

export function createLogRecordProcessorFromConfig(
  processor: LogRecordProcessorConfigModel
): LogRecordProcessor {
  const [name, properties] = mustSingleEntry(processor, 'LogRecordProcessor');

  switch (name) {
    case 'batch': {
      const props = properties as BatchLogRecordProcessorConfigModel;
      const exporter = createLogRecordExporterFromConfig(props.exporter);
      return new BatchLogRecordProcessor({
        exporter,
        maxQueueSize: props.max_queue_size ?? undefined,
        maxExportBatchSize: props.max_export_batch_size ?? undefined,
        scheduledDelayMillis: props.schedule_delay ?? undefined,
        exportTimeoutMillis: props.export_timeout ?? undefined,
      });
    }

    case 'simple': {
      const props = properties as SimpleLogRecordProcessorConfigModel;
      const exporter = createLogRecordExporterFromConfig(props.exporter);
      return new SimpleLogRecordProcessor(exporter);
    }

    default:
      throw new Error(`unknown LogRecordProcessor name: "${name}"`);
  }
}

export function getHeadersFromConfiguration(
  headers: NameStringValuePairConfigModel[] | undefined
): Record<string, string> | undefined {
  if (!headers) {
    return undefined;
  }
  const result: Record<string, string> = {};
  headers.forEach(header => {
    if (header.value !== null) {
      result[header.name] = header.value;
    }
  });
  return result;
}

/**
 * Validate an exporter timeout value. The spec says 0 means "no limit
 * (infinity)" but the JS exporters don't support that yet (see #6617).
 * Warn and return undefined so the exporter falls back to its default.
 */
function validateExporterTimeout(
  timeout: number | null | undefined
): number | undefined {
  if (timeout === null) {
    return undefined;
  } else if (timeout === 0) {
    diag.warn(
      'Exporter timeout of 0 (infinite) is not supported. Using default timeout.'
    );
    return undefined;
  }
  return timeout;
}

export function getHttpAgentOptionsFromTls(
  tls: HttpTlsConfigModel | undefined
): { ca?: Buffer; cert?: Buffer; key?: Buffer } | undefined {
  if (tls && (tls.ca_file || tls.cert_file || tls.key_file)) {
    return {
      ca: readFileOrWarn(tls.ca_file, 'TLS CA'),
      cert: readFileOrWarn(tls.cert_file, 'TLS cert'),
      key: readFileOrWarn(tls.key_file, 'TLS key'),
    };
  }
  return undefined;
}

function getGrpcCredentialsFromTls(tls?: GrpcTlsConfigModel) {
  if (tls?.insecure) {
    return createInsecureCredentials();
  }
  const rootCert = readFileOrWarn(tls?.ca_file, 'TLS CA');
  const privateKey = readFileOrWarn(tls?.key_file, 'TLS key');
  const certChain = readFileOrWarn(tls?.cert_file, 'TLS cert');
  if (rootCert || privateKey || certChain) {
    try {
      return createSslCredentials(rootCert, privateKey, certChain);
    } catch (e) {
      diag.warn(`Failed to create gRPC SSL credentials: ${e}`);
      return undefined;
    }
  }
  return undefined;
}

function getGrpcMetadataFromHeaders(
  headers: NameStringValuePairConfigModel[] | undefined
) {
  if (!headers || headers.length === 0) {
    return undefined;
  }
  const metadata = createEmptyMetadata();
  for (const header of headers) {
    if (header.value !== null) {
      metadata.set(header.name, header.value);
    }
  }
  return metadata;
}

function readFileOrWarn(
  filePath: string | null | undefined,
  label: string
): Buffer | undefined {
  if (!filePath) return undefined;
  try {
    return fs.readFileSync(filePath);
  } catch (e) {
    diag.warn(`Failed to read ${label} file at ${filePath}: ${e}`);
    return undefined;
  }
}

export function getSpanExporter(
  exporter: SpanExporterConfigModel
): SpanExporter | undefined {
  if (exporter.otlp_http !== undefined) {
    const encoding = exporter.otlp_http?.encoding ?? 'protobuf';
    if (encoding === 'json') {
      return new OTLPHttpTraceExporter({
        compression:
          exporter.otlp_http?.compression === 'gzip'
            ? CompressionAlgorithm.GZIP
            : CompressionAlgorithm.NONE,
        url: exporter.otlp_http?.endpoint ?? undefined,
        headers: getHeadersFromConfiguration(exporter.otlp_http?.headers),
        timeoutMillis: validateExporterTimeout(exporter.otlp_http?.timeout),
        httpAgentOptions: getHttpAgentOptionsFromTls(exporter.otlp_http?.tls),
      });
    } else {
      return new OTLPProtoTraceExporter({
        compression:
          exporter.otlp_http?.compression === 'gzip'
            ? CompressionAlgorithm.GZIP
            : CompressionAlgorithm.NONE,
        url: exporter.otlp_http?.endpoint ?? undefined,
        headers: getHeadersFromConfiguration(exporter.otlp_http?.headers),
        timeoutMillis: validateExporterTimeout(exporter.otlp_http?.timeout),
        httpAgentOptions: getHttpAgentOptionsFromTls(exporter.otlp_http?.tls),
      });
    }
  } else if (exporter.otlp_grpc !== undefined) {
    return new OTLPGrpcTraceExporter({
      compression:
        exporter.otlp_grpc?.compression === 'gzip'
          ? CompressionAlgorithm.GZIP
          : CompressionAlgorithm.NONE,
      url: exporter.otlp_grpc?.endpoint ?? undefined,
      timeoutMillis: validateExporterTimeout(exporter.otlp_grpc?.timeout),
      credentials: getGrpcCredentialsFromTls(exporter.otlp_grpc?.tls),
      metadata: getGrpcMetadataFromHeaders(exporter.otlp_grpc?.headers),
    });
  } else if (exporter.console !== undefined) {
    return new ConsoleSpanExporter();
  }
  diag.warn('Unsupported Exporter value. No Span Exporter registered');
  return undefined;
}

export function getSpanProcessorsFromConfiguration(
  config: ConfigurationModel
): SpanProcessor[] | undefined {
  const spanProcessors: SpanProcessor[] = [];
  config.tracer_provider?.processors?.forEach(processor => {
    if (processor.batch) {
      const exporter = getSpanExporter(processor.batch.exporter);
      if (exporter) {
        spanProcessors.push(
          new BatchSpanProcessor(exporter, {
            maxQueueSize: processor.batch.max_queue_size ?? undefined,
            maxExportBatchSize:
              processor.batch.max_export_batch_size ?? undefined,
            scheduledDelayMillis: processor.batch.schedule_delay ?? undefined,
            exportTimeoutMillis: processor.batch.export_timeout ?? undefined,
          })
        );
      }
    }
    if (processor.simple) {
      const exporter = getSpanExporter(processor.simple.exporter);
      if (exporter) {
        spanProcessors.push(new SimpleSpanProcessor(exporter));
      }
    }
  });
  if (spanProcessors.length > 0) {
    return spanProcessors;
  }
  return undefined;
}

export function getSpanLimitsFromConfiguration(
  config: ConfigurationModel
): SpanLimits | undefined {
  if (config.tracer_provider?.limits) {
    const limitsConfig = config.tracer_provider.limits;
    const spanLimits: SpanLimits = {};
    spanLimits.attributeCountLimit = limitsConfig.attribute_count_limit ?? 128;
    spanLimits.eventCountLimit = limitsConfig.event_count_limit ?? 128;
    spanLimits.linkCountLimit = limitsConfig.link_count_limit ?? 128;
    spanLimits.attributePerLinkCountLimit =
      limitsConfig.link_attribute_count_limit ?? 128;
    spanLimits.attributePerEventCountLimit =
      limitsConfig.event_attribute_count_limit ?? 128;

    if (limitsConfig.attribute_value_length_limit != null) {
      spanLimits.attributeValueLengthLimit =
        limitsConfig.attribute_value_length_limit;
    }

    return spanLimits;
  }
  return undefined;
}

export function getMeterReadersFromConfiguration(
  config: ConfigurationModel
): IMetricReader[] | undefined {
  const metricReaders: IMetricReader[] = [];
  config.meter_provider?.readers?.forEach(reader => {
    if (reader.periodic) {
      const periodicReader = getPeriodicMetricReaderFromConfiguration(
        reader.periodic
      );
      if (periodicReader) {
        metricReaders.push(periodicReader);
      }
    }
  });
  if (metricReaders.length > 0) {
    return metricReaders;
  }
  return undefined;
}

export function getInstrumentType(
  instrument: InstrumentTypeConfigModel
): InstrumentType | undefined {
  switch (instrument) {
    case 'counter':
      return InstrumentType.COUNTER;
    case 'gauge':
      return InstrumentType.GAUGE;
    case 'histogram':
      return InstrumentType.HISTOGRAM;
    case 'observable_counter':
      return InstrumentType.OBSERVABLE_COUNTER;
    case 'observable_gauge':
      return InstrumentType.OBSERVABLE_GAUGE;
    case 'observable_up_down_counter':
      return InstrumentType.OBSERVABLE_UP_DOWN_COUNTER;
    case 'up_down_counter':
      return InstrumentType.UP_DOWN_COUNTER;
    default:
      diag.warn(`Unsupported instrument type: ${instrument}`);
      return undefined;
  }
}

export function getAggregationType(
  aggregation: AggregationConfigModel
): AggregationOption | undefined {
  if (aggregation.default) {
    return {
      type: AggregationType.DEFAULT,
    };
  }
  if (aggregation.drop) {
    return {
      type: AggregationType.DROP,
    };
  }
  if (aggregation.explicit_bucket_histogram) {
    return {
      type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
      options: {
        recordMinMax:
          aggregation.explicit_bucket_histogram.record_min_max ?? true,
        boundaries: aggregation.explicit_bucket_histogram.boundaries ?? [
          0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500,
          10000,
        ],
      },
    };
  }

  if (aggregation.base2_exponential_bucket_histogram) {
    return {
      type: AggregationType.EXPONENTIAL_HISTOGRAM,
      options: {
        recordMinMax:
          aggregation.base2_exponential_bucket_histogram.record_min_max ??
          undefined,
        maxSize:
          aggregation.base2_exponential_bucket_histogram.max_size ?? undefined,
      },
    };
  }
  if (aggregation.last_value) {
    return {
      type: AggregationType.LAST_VALUE,
    };
  }
  if (aggregation.sum) {
    return {
      type: AggregationType.SUM,
    };
  }

  diag.warn('Unsupported aggregation type');
  return undefined;
}

export function getMeterViewsFromConfiguration(
  config: ConfigurationModel
): ViewOptions[] | undefined {
  const metricViews: ViewOptions[] = [];
  config.meter_provider?.views?.forEach(view => {
    const viewOption: ViewOptions = {};
    if (view.selector) {
      if (view.selector.instrument_name) {
        viewOption.instrumentName = view.selector.instrument_name;
      }
      if (view.selector.instrument_type) {
        const instrumentType = getInstrumentType(view.selector.instrument_type);
        if (instrumentType) {
          viewOption.instrumentType = instrumentType;
        }
      }
      if (view.selector.unit) {
        viewOption.instrumentUnit = view.selector.unit;
      }
      if (view.selector.meter_name) {
        viewOption.meterName = view.selector.meter_name;
      }
      if (view.selector.meter_version) {
        viewOption.meterVersion = view.selector.meter_version;
      }
      if (view.selector.meter_schema_url) {
        viewOption.meterSchemaUrl = view.selector.meter_schema_url;
      }
    }
    if (view.stream) {
      if (view.stream.name) {
        viewOption.name = view.stream.name;
      }
      viewOption.aggregationCardinalityLimit =
        view.stream.aggregation_cardinality_limit ?? 2_000;
      if (view.stream.description) {
        viewOption.description = view.stream.description;
      }
      if (view.stream.aggregation) {
        const aggregationType = getAggregationType(view.stream.aggregation);
        if (aggregationType) {
          viewOption.aggregation = aggregationType;
        }
      }
      if (view.stream.attribute_keys) {
        const processors: IAttributesProcessor[] = [];
        if (
          view.stream.attribute_keys.included &&
          view.stream.attribute_keys.included.length > 0
        ) {
          processors.push(
            createAllowListAttributesProcessor(
              view.stream.attribute_keys.included
            )
          );
        }
        if (
          view.stream.attribute_keys.excluded &&
          view.stream.attribute_keys.excluded.length > 0
        ) {
          processors.push(
            createDenyListAttributesProcessor(
              view.stream.attribute_keys.excluded
            )
          );
        }
        if (processors.length > 0) {
          viewOption.attributesProcessors = processors;
        }
      }
    }

    if (Object.keys(viewOption).length > 0) {
      metricViews.push(viewOption);
    }
  });
  if (metricViews.length > 0) {
    return metricViews;
  }
  return undefined;
}

export function getInstanceID(config: ConfigurationModel): string | undefined {
  if (config.resource?.attributes) {
    for (let i = 0; i < config.resource.attributes.length; i++) {
      const element = config.resource.attributes[i];
      if (element.name === 'service.instance.id') {
        return element.value?.toString();
      }
    }
  }
  return undefined;
}

const DEFAULT_RATIO = 1;

/**
 * Builds a {@link Sampler} from a {@link SamplerConfigModel} data model.
 * This allows sampler construction from declarative configuration.
 */
export function buildSamplerFromConfig(
  samplerConfig: SamplerConfigModel
): Sampler {
  if (samplerConfig.always_on !== undefined) {
    return new AlwaysOnSampler();
  }
  if (samplerConfig.always_off !== undefined) {
    return new AlwaysOffSampler();
  }
  if (samplerConfig.trace_id_ratio_based !== undefined) {
    return new TraceIdRatioBasedSampler(
      samplerConfig.trace_id_ratio_based?.ratio ?? DEFAULT_RATIO
    );
  }
  if (samplerConfig.parent_based !== undefined) {
    const pb = samplerConfig.parent_based ?? {};
    return new ParentBasedSampler({
      root: pb.root ? buildSamplerFromConfig(pb.root) : new AlwaysOnSampler(),
      remoteParentSampled: pb.remote_parent_sampled
        ? buildSamplerFromConfig(pb.remote_parent_sampled)
        : undefined,
      remoteParentNotSampled: pb.remote_parent_not_sampled
        ? buildSamplerFromConfig(pb.remote_parent_not_sampled)
        : undefined,
      localParentSampled: pb.local_parent_sampled
        ? buildSamplerFromConfig(pb.local_parent_sampled)
        : undefined,
      localParentNotSampled: pb.local_parent_not_sampled
        ? buildSamplerFromConfig(pb.local_parent_not_sampled)
        : undefined,
    });
  }
  diag.error('Unknown sampler config, defaulting to ParentBased(AlwaysOn).');
  return new ParentBasedSampler({ root: new AlwaysOnSampler() });
}

/**
 * Warn if some props from a declarative config object have not been handled.
 *
 * This is intended to be used by `create*FromConfig()` functions. It is a low
 * tech mechanism to add awareness when a given valid config is not being
 * completely handled. This could help when properties are added to the
 * configuration schema. (A higher tech mechanism that wraps the parsed
 * configuration during `create()` and watches for untouched properties
 * might be nice.)
 */
function checkConfigUse(
  name: string,
  props: object | undefined,
  handledProps: string[]
) {
  if (!props) return;
  // Dev note: I'd use Set#difference, but that requires Node.js v22.
  const unhandledProps = Object.keys(props).filter(
    k => !handledProps.includes(k)
  );

  if (unhandledProps.length > 0) {
    diag.warn(
      `Config warning: some specified ${name} configuration properties were not handled by SDK setup: ${JSON.stringify(unhandledProps)}`
    );
  }
}

/**
 * Return the single non-undefined entry in the given config object, or throw.
 *
 * It is common for Declarative Configuration to have config objects with
 * a single entry, e.g.
 *
 *    "LogRecordProcessor": {
 *      "type": "object",
 *      "additionalProperties": {
 *        "type": [
 *          "object",
 *          "null"
 *        ]
 *      },
 *      "minProperties": 1,
 *      "maxProperties": 1,
 *
 * The TypeScript types cannot express the minProperties/maxProperties from the
 * JSON schema. We guard against that here.
 */
function mustSingleEntry(
  configObj: Record<string, unknown>,
  configTypeName: string
): [string, unknown] {
  const entries = Object.entries(configObj).filter(
    ([_name, properties]) => properties !== undefined
  );

  if (entries.length !== 1) {
    const entryNames = entries.map(e => e[0]);
    throw Error(
      `invalid ${configTypeName} in configuration: must have exactly one entry: entries=${JSON.stringify(entryNames)}`
    );
  }

  return entries[0];
}

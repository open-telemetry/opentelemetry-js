/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Create SDK components from parsed declarative config.
 * https://opentelemetry.io/docs/specs/otel/configuration/sdk/#create
 *
 * Dev Notes:
 * This file exports `create<SDK Thing>FromConfig(...)` functions intended to
 * be used by the "create" step of `startNodeSDK()`.
 */

import { inspect } from 'util';
import { readFileSync } from 'fs';
import * as path from 'path';

import type { Attributes, TextMapPropagator } from '@opentelemetry/api';
import { diag } from '@opentelemetry/api';
import type {
  IdGenerator,
  Sampler,
  SpanExporter,
  SpanLimits,
  SpanProcessor,
} from '@opentelemetry/sdk-trace';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  BatchSpanProcessor,
  ConsoleSpanExporter,
  ParentBasedSampler,
  RandomIdGenerator,
  SimpleSpanProcessor,
  TraceIdRatioBasedSampler,
  TracerProvider,
} from '@opentelemetry/sdk-trace';
import type {
  Resource,
  DetectedResourceAttributes,
  ResourceDetector,
} from '@opentelemetry/resources';
import {
  defaultResource,
  detectResources,
  hostDetector,
  osDetector,
  processDetector,
  resourceFromAttributes,
  serviceInstanceIdDetector,
} from '@opentelemetry/resources';
import { OTLPLogExporter as OTLPHttpLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPLogExporter as OTLPGrpcLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPLogExporter as OTLPProtoLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { OTLPMetricExporter as OTLPGrpcMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPMetricExporter as OTLPHttpMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPMetricExporter as OTLPProtoMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter as OTLPProtoTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPTraceExporter as OTLPGrpcTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import {
  createEmptyMetadata,
  createInsecureCredentials,
  createSslCredentials,
} from '@opentelemetry/otlp-grpc-exporter-base';
import { AggregationTemporalityPreference } from '@opentelemetry/exporter-metrics-otlp-http';
import type {
  AggregationConfigModel,
  AttributeLimitsConfigModel,
  Base2ExponentialBucketHistogramAggregationConfigModel,
  BatchLogRecordProcessorConfigModel,
  BatchSpanProcessorConfigModel,
  ExperimentalPrometheusMetricExporterConfigModel,
  ExplicitBucketHistogramAggregationConfigModel,
  ExporterDefaultHistogramAggregationConfigModel,
  ExporterTemporalityPreferenceConfigModel,
  GrpcTlsConfigModel,
  HttpTlsConfigModel,
  IdGeneratorConfigModel,
  InstrumentTypeConfigModel,
  LoggerProviderConfigModel,
  LogRecordExporterConfigModel,
  LogRecordLimitsConfigModel,
  LogRecordProcessorConfigModel,
  MeterProviderConfigModel,
  MetricProducerConfigModel,
  MetricReaderConfigModel,
  NameStringValuePairConfigModel,
  OtlpGrpcExporterConfigModel,
  OtlpGrpcMetricExporterConfigModel,
  OtlpHttpExporterConfigModel,
  OtlpHttpMetricExporterConfigModel,
  ParentBasedSamplerConfigModel,
  PeriodicMetricReaderConfigModel,
  PropagatorConfigModel,
  PullMetricReaderConfigModel,
  PushMetricExporterConfigModel,
  ResourceConfigModel,
  SamplerConfigModel,
  SimpleLogRecordProcessorConfigModel,
  SimpleSpanProcessorConfigModel,
  SpanExporterConfigModel,
  SpanLimitsConfigModel,
  SpanProcessorConfigModel,
  TextMapPropagatorConfigModel,
  TraceIdRatioBasedSamplerConfigModel,
  TracerProviderConfigModel,
  ViewConfigModel,
} from '@opentelemetry/configuration';
import {
  mergeHeadersConfig,
  mergePropagatorCompositeConfig,
  mergeResourceAttributesConfig,
} from '@opentelemetry/configuration';
import type {
  LogRecordExporter,
  LogRecordProcessor,
  LogRecordLimits,
} from '@opentelemetry/sdk-logs';
import {
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
  SimpleLogRecordProcessor,
  LoggerProvider,
} from '@opentelemetry/sdk-logs';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import {
  CompositePropagator,
  getStringFromEnv,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import type {
  AggregationOption,
  AggregationSelector,
  IAttributesProcessor,
  MetricProducer,
  MetricReader,
  PushMetricExporter,
  ViewOptions,
} from '@opentelemetry/sdk-metrics';
import {
  AggregationType,
  ConsoleMetricExporter,
  createAllowListAttributesProcessor,
  createDenyListAttributesProcessor,
  InstrumentType,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

// ---- internal utilities

function getGrpcMetadataFromHeaders(
  headers: NameStringValuePairConfigModel[] | undefined,
  headersList?: string | null
) {
  const headerValues = mergeHeadersConfig(headers, headersList);
  if (!headerValues || Object.keys(headerValues).length === 0) {
    return undefined;
  }
  const metadata = createEmptyMetadata();
  for (const [name, value] of Object.entries(headerValues)) {
    metadata.set(name, value);
  }
  return metadata;
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
  configObj: object,
  configTypeName: string
): [string, unknown] {
  const entries = Object.entries(configObj).filter(
    ([_name, properties]) => properties !== undefined
  );

  if (entries.length !== 1) {
    const entryNames = entries.map(e => e[0]);
    throw new Error(
      `invalid ${configTypeName} in configuration: must have exactly one entry: entries=${JSON.stringify(entryNames)}`
    );
  }

  return entries[0];
}

function loadTlsConfigFile(absPath: string, propName: string) {
  try {
    if (!path.isAbsolute(absPath)) {
      throw new Error(`TLS config file "${absPath}" must be an absolute path`);
    }
    return readFileSync(absPath);
  } catch (err) {
    throw new Error(
      `could not load "tls.${propName}" from config: ${err.message}`,
      { cause: err }
    );
  }
}

/**
 * Get TLS-related HTTP client options from declarative configuration.
 * https://opentelemetry.io/docs/specs/otel-config/types/#type-httptls
 * https://nodejs.org/api/tls.html#tlscreatesecurecontextoptions
 */
function httpTlsOptionsFromConfig(
  tls?: HttpTlsConfigModel
): { ca?: Buffer; cert?: Buffer; key?: Buffer } | undefined {
  if (!tls) {
    return undefined;
  }

  checkConfigUse('HttpTls', tls, ['ca_file', 'cert_file', 'key_file']);
  const httpTlsOptions: { ca?: Buffer; cert?: Buffer; key?: Buffer } = {};
  if (tls.ca_file) {
    httpTlsOptions.ca = loadTlsConfigFile(tls.ca_file, 'ca_file');
  }
  if (tls.cert_file) {
    httpTlsOptions.cert = loadTlsConfigFile(tls.cert_file, 'cert_file');
  }
  if (tls.key_file) {
    httpTlsOptions.key = loadTlsConfigFile(tls.key_file, 'key_file');
  }
  return httpTlsOptions;
}

function grpcCredentialsFromConfig(tls?: GrpcTlsConfigModel) {
  if (!tls) {
    return undefined;
  }

  checkConfigUse('GrpcTls', tls, [
    'insecure',
    'ca_file',
    'cert_file',
    'key_file',
  ]);

  if (tls?.insecure) {
    return createInsecureCredentials();
  }

  const rootCert = tls.ca_file
    ? loadTlsConfigFile(tls.ca_file, 'ca_file')
    : undefined;
  const privateKey = tls.key_file
    ? loadTlsConfigFile(tls.key_file, 'key_file')
    : undefined;
  const certChain = tls.cert_file
    ? loadTlsConfigFile(tls.cert_file, 'cert_file')
    : undefined;
  if (rootCert || privateKey || certChain) {
    return createSslCredentials(rootCert, privateKey, certChain);
  }

  return undefined;
}

/**
 * Validate an export(er) timeout value.
 * "timeout" properties in the declarative config schema are typically
 * described with:
 *
 * 1. Value must be non-negative.
 * 2. A value of 0 indicates no limit (infinity).
 *
 * Search "timeout" at https://opentelemetry.io/docs/specs/otel-config/types/
 *
 * This function enforces (1), and guards against (2) because current OTel
 * JS SDK components do *not* handle a `0` timeout value.
 * See https://github.com/open-telemetry/opentelemetry-js/issues/6617
 */
function validateExportTimeoutConfig(
  timeout: number | null | undefined,
  errLabel: string
): number | undefined {
  if (timeout == null) {
    return undefined;
  } else if (timeout < 0) {
    throw new Error(`${errLabel} value must be non-negative: ${timeout}`);
  } else if (timeout === 0) {
    throw new Error(`${errLabel} of 0 (infinite) is not supported`);
  }
  return timeout;
}

// ---- create<SDKThing>FromConfig functions

export function createPropagatorFromConfig(
  propagatorConfig: PropagatorConfigModel
): TextMapPropagator | undefined {
  const configComposite = mergePropagatorCompositeConfig(
    propagatorConfig.composite,
    propagatorConfig.composite_list
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

  const propagators: TextMapPropagator[] = [];
  for (const [name] of kvs) {
    const propagator = propagatorsFactory.get(name)?.();
    if (!propagator) {
      throw new Error(`unknown TextMapPropagator in configuration: "${name}"`);
    }
    propagators.push(propagator);
  }

  if (propagators.length === 0) {
    return undefined;
  } else {
    // Always wrap in a composite propagator, even for the rare case of a single
    // propagator, because `/propagator/composite` in the configuration schema
    // says "Configure the propagators in the composite text map propagator".
    return new CompositePropagator({ propagators });
  }
}

class ServiceNameDetector implements ResourceDetector {
  detect() {
    const attributes: Attributes = {};
    const serviceName = getStringFromEnv('OTEL_SERVICE_NAME');

    if (serviceName) {
      attributes[ATTR_SERVICE_NAME] = serviceName;
    }

    return { attributes };
  }
}

export function createResourceFromConfig(
  resourceConfig?: ResourceConfigModel
): Resource {
  // Limitation: Resource#merge() is the only exported mechanism from the
  // resources package that supports *async* attributes, so we must use it.
  // However, if `schemaUrl` is being used by detectors and in the config, then
  // `.merge()` will potentially warn and drop the schema URL if there is a
  // conflict.  (See `mergeSchemaUrl` behaviour.) This is likely not the
  // intended behavior when a user specifies a `schema_url` in the declarative
  // config file.

  let resource = defaultResource();

  if (!resourceConfig) {
    return resource;
  }

  if (resourceConfig['detection/development']) {
    // TODO(6986): support attributes.{include,exclude}; `resources` package doesn't currently support this
    checkConfigUse(
      'ExperimentalResourceDetection',
      resourceConfig['detection/development'],
      ['detectors']
    );
    if (resourceConfig['detection/development'].detectors) {
      const detectors: ResourceDetector[] = [];
      for (const d of resourceConfig['detection/development'].detectors) {
        const [name] = mustSingleEntry(d, 'ExperimentalResourceDetector');
        // https://opentelemetry.io/docs/specs/otel-config/types/#type-experimentalresourcedetector
        switch (name) {
          // Note: The 'container' detector defined in the schema cannot yet
          // be supported because a container resource detector lives in the
          // separate opentelemetry-js-contrib.git repo. Supporting 'container'
          // will come as part of supporting PluginComponentProvider.
          case 'host':
            detectors.push(hostDetector);
            detectors.push(osDetector);
            break;
          case 'process':
            detectors.push(processDetector);
            break;
          case 'service':
            // Note: The declarative schema defines the 'service' detector to
            // handle `service.instance.id` and the `OTEL_SERVICE_NAME` envvar.
            // https://opentelemetry.io/docs/specs/otel-config/types/#type-experimentalresourcedetector
            // This is equivalent to the `serviceInstanceIdDetector` and
            // *part* of the `envDetector`.  Using this `envDetector` would
            // incorrectly read the `OTEL_RESOURCE_ATTRIBUTES` envvar.
            detectors.push(new ServiceNameDetector());
            detectors.push(serviceInstanceIdDetector);
            break;
          default:
            throw new Error(
              `unknown ExperimentalResourceDetector name in configuration: "${name}"`
            );
        }
      }

      if (detectors.length > 0) {
        resource = resource.merge(detectResources({ detectors }));
      }
    }
  }

  const configAttrs = mergeResourceAttributesConfig(
    resourceConfig.attributes,
    resourceConfig.attributes_list
  );
  if (configAttrs && configAttrs.length > 0) {
    const attrs: DetectedResourceAttributes = {};
    for (let i = 0; i < configAttrs.length; i++) {
      const a = configAttrs[i];
      if (a.value !== null) {
        attrs[a.name] = a.value;
      }
    }
    resource = resource.merge(resourceFromAttributes(attrs));
  }

  if (resourceConfig.schema_url) {
    resource = resource.merge(
      resourceFromAttributes({}, { schemaUrl: resourceConfig.schema_url })
    );
  }

  return resource;
}

export function createLogRecordLimitsFromConfig(
  limits?: LogRecordLimitsConfigModel,
  attribute_limits?: AttributeLimitsConfigModel
): LogRecordLimits | undefined {
  if (!limits && !attribute_limits) {
    return undefined;
  }
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

export function createLogRecordExporterFromConfig(
  exporter: LogRecordExporterConfigModel
): LogRecordExporter {
  const [name, properties] = mustSingleEntry(exporter, 'LogRecordExporter');

  switch (name) {
    case 'otlp_http': {
      checkConfigUse('OtlpHttpExporter', properties!, [
        'compression',
        'endpoint',
        'headers',
        'headers_list',
        'timeout',
        'tls',
        'encoding',
      ]);
      const props = properties as OtlpHttpExporterConfigModel;
      const commonOpts = {
        compression:
          props?.compression === 'gzip'
            ? CompressionAlgorithm.GZIP
            : CompressionAlgorithm.NONE,
        url: props?.endpoint ?? undefined,
        headers: mergeHeadersConfig(props?.headers, props?.headers_list),
        timeoutMillis: validateExportTimeoutConfig(
          props?.timeout,
          'OtlpHttpExporter.timeout'
        ),
        httpAgentOptions: httpTlsOptionsFromConfig(props?.tls),
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
      checkConfigUse('OtlpGrpcExporter', properties!, [
        'compression',
        'endpoint',
        'timeout',
        'tls',
        'headers',
        'headers_list',
      ]);
      const props = properties as OtlpGrpcExporterConfigModel;
      return new OTLPGrpcLogExporter({
        compression:
          props?.compression === 'gzip'
            ? CompressionAlgorithm.GZIP
            : CompressionAlgorithm.NONE,
        url: props?.endpoint ?? undefined,
        timeoutMillis: validateExportTimeoutConfig(
          props?.timeout,
          'OtlpGrpcExporter.timeout'
        ),
        credentials: grpcCredentialsFromConfig(props?.tls),
        metadata: getGrpcMetadataFromHeaders(
          props?.headers,
          props?.headers_list
        ),
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
      checkConfigUse('BatchLogRecordProcessor', properties!, [
        'exporter',
        'max_queue_size',
        'max_export_batch_size',
        'schedule_delay',
        'export_timeout',
      ]);
      const props = properties as BatchLogRecordProcessorConfigModel;
      const exporter = createLogRecordExporterFromConfig(props.exporter);
      return new BatchLogRecordProcessor({
        exporter,
        maxQueueSize: props.max_queue_size ?? undefined,
        maxExportBatchSize: props.max_export_batch_size ?? undefined,
        scheduledDelayMillis: props.schedule_delay ?? undefined,
        exportTimeoutMillis: validateExportTimeoutConfig(
          props.export_timeout,
          'BatchLogRecordProcessor.export_timeout'
        ),
      });
    }

    case 'simple': {
      const props = properties as SimpleLogRecordProcessorConfigModel;
      const exporter = createLogRecordExporterFromConfig(props.exporter);
      return new SimpleLogRecordProcessor({ exporter });
    }

    default:
      throw new Error(`unknown LogRecordProcessor name: "${name}"`);
  }
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

// Exported for testing.
export function createSpanLimitsFromConfig(
  limits?: SpanLimitsConfigModel,
  attribute_limits?: AttributeLimitsConfigModel
): SpanLimits | undefined {
  if (!limits && !attribute_limits) {
    return undefined;
  }
  return {
    attributeValueLengthLimit:
      limits?.attribute_value_length_limit ??
      attribute_limits?.attribute_value_length_limit ??
      undefined,
    attributeCountLimit:
      limits?.attribute_count_limit ??
      attribute_limits?.attribute_count_limit ??
      undefined,
    eventCountLimit: limits?.event_count_limit ?? undefined,
    linkCountLimit: limits?.link_count_limit ?? undefined,
    attributePerEventCountLimit:
      limits?.event_attribute_count_limit ?? undefined,
    attributePerLinkCountLimit: limits?.link_attribute_count_limit ?? undefined,
  };
}

/**
 * Map a declarative-config `temporality_preference` value to the enum the OTLP
 * metric exporters expect. Returns undefined for an unspecified preference so
 * the exporter falls back to its own default (cumulative).
 */
function aggregationTemporalityPreferenceFromConfig(
  temporality_preference: ExporterTemporalityPreferenceConfigModel | undefined
): AggregationTemporalityPreference | undefined {
  if (temporality_preference == null) {
    return undefined;
  }
  switch (temporality_preference) {
    case 'delta':
      return AggregationTemporalityPreference.DELTA;
    case 'low_memory':
      return AggregationTemporalityPreference.LOWMEMORY;
    case 'cumulative':
      return AggregationTemporalityPreference.CUMULATIVE;
    default:
      throw new Error(
        `unknown temporality_preference value in configuration: ${temporality_preference}`
      );
  }
}

/**
 * Map a declarative-config `default_histogram_aggregation` value to an
 * AggregationSelector that applies the requested aggregation to histogram
 * instruments and leaves all other instrument types at their default. Returns
 * undefined for an unspecified value so the exporter uses its own default.
 */
function aggregationSelectorFromConfig(
  default_histogram_aggregation:
    | ExporterDefaultHistogramAggregationConfigModel
    | undefined
): AggregationSelector | undefined {
  if (default_histogram_aggregation == null) {
    return undefined;
  }

  let histoAggOpt: AggregationOption;
  switch (default_histogram_aggregation) {
    case 'base2_exponential_bucket_histogram':
      histoAggOpt = { type: AggregationType.EXPONENTIAL_HISTOGRAM };
      break;
    case 'explicit_bucket_histogram':
      histoAggOpt = { type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM };
      break;
    default:
      throw new Error(
        `unknown default_histogram_aggregation value in configuration: ${default_histogram_aggregation}`
      );
  }
  return (instrumentType: InstrumentType): AggregationOption =>
    instrumentType === InstrumentType.HISTOGRAM
      ? histoAggOpt
      : { type: AggregationType.DEFAULT };
}

/** exported for testing */
export function createPushMetricExporterFromConfig(
  exporter: PushMetricExporterConfigModel
): PushMetricExporter {
  const [name, properties] = mustSingleEntry(exporter, 'PushMetricExporter');

  // TODO(6959): use non-envvar reading mechanism to create OTLP exporters, so an `undefined` option does NOT fallback to an envvar

  switch (name) {
    case 'otlp_http': {
      checkConfigUse('PushMetricExporter', properties!, [
        'compression',
        'endpoint',
        'headers',
        'headers_list',
        'timeout',
        'tls',
        'temporality_preference',
        'default_histogram_aggregation',
        'encoding',
      ]);
      const props = properties as OtlpHttpMetricExporterConfigModel;
      const commonOpts = {
        compression:
          props?.compression === 'gzip'
            ? CompressionAlgorithm.GZIP
            : CompressionAlgorithm.NONE,
        url: props?.endpoint ?? undefined,
        headers: mergeHeadersConfig(props?.headers, props?.headers_list),
        timeoutMillis: validateExportTimeoutConfig(
          props?.timeout,
          'PushMetricExporter.timeout'
        ),
        httpAgentOptions: httpTlsOptionsFromConfig(props?.tls),
        temporalityPreference: aggregationTemporalityPreferenceFromConfig(
          props?.temporality_preference
        ),
        aggregationPreference: aggregationSelectorFromConfig(
          props?.default_histogram_aggregation
        ),
      };
      const encoding = props?.encoding ?? 'protobuf';
      switch (encoding) {
        case 'json':
          return new OTLPHttpMetricExporter(commonOpts);
        case 'protobuf':
          return new OTLPProtoMetricExporter(commonOpts);
        default:
          throw new Error(
            `unknown OtlpHttpMetricExporter encoding in configuration: "${encoding}"`
          );
      }
    }

    case 'otlp_grpc': {
      checkConfigUse('PushMetricExporter', properties!, [
        'compression',
        'endpoint',
        'timeout',
        'tls',
        'headers',
        'headers_list',
        'temporality_preference',
        'default_histogram_aggregation',
      ]);
      const props = properties as OtlpGrpcMetricExporterConfigModel;
      return new OTLPGrpcMetricExporter({
        compression:
          props?.compression === 'gzip'
            ? CompressionAlgorithm.GZIP
            : CompressionAlgorithm.NONE,
        url: props?.endpoint ?? undefined,
        timeoutMillis: validateExportTimeoutConfig(
          props?.timeout,
          'PushMetricExporter.timeout'
        ),
        credentials: grpcCredentialsFromConfig(props?.tls),
        metadata: getGrpcMetadataFromHeaders(
          props?.headers,
          props?.headers_list
        ),
        temporalityPreference: aggregationTemporalityPreferenceFromConfig(
          props?.temporality_preference
        ),
        aggregationPreference: aggregationSelectorFromConfig(
          props?.default_histogram_aggregation
        ),
      });
    }

    case 'console': {
      // TODO(6957): temporality_preference
      // TODO(6957): default_histogram_aggregation
      checkConfigUse('PushMetricExporter', properties!, []);
      return new ConsoleMetricExporter();
    }

    default:
      throw new Error(
        `unknown PushMetricExporter name in configuration: "${name}"`
      );
  }
}

function createMetricProducerFromConfig(
  producer: MetricProducerConfigModel
): MetricProducer {
  const [name] = mustSingleEntry(producer, 'MetricProducer');

  switch (name) {
    case 'opencensus': {
      // Note: The "opencensus" MetricProducer is intentionally not supported.
      // It is deprecated in OpenTelemetry Configuration v1.2.0.
      throw new Error(
        'the "opencensus" MetricProducer is deprecated and not supported'
      );
    }

    default:
      throw new Error(`unknown MetricProducer name: "${name}"`);
  }
}

function createPeriodicMetricReaderFromConfig(
  periodic: PeriodicMetricReaderConfigModel
): MetricReader {
  const exporter = createPushMetricExporterFromConfig(periodic.exporter);

  const metricProducers = periodic.producers?.map(
    createMetricProducerFromConfig
  );

  checkConfigUse('PeriodicMetricReader', periodic, [
    'exporter',
    'producers',
    'interval',
    'timeout',
    'max_export_batch_size/development',
  ]);

  // TODO(6425): add cardinality_limits
  return new PeriodicExportingMetricReader({
    exportIntervalMillis: periodic.interval ?? 60_000,
    exportTimeoutMillis:
      validateExportTimeoutConfig(
        periodic?.timeout,
        'PeriodicExportingMetricReader.timeout'
      ) ?? 30_000,
    exporter,
    metricProducers,
    maxExportBatchSize:
      periodic['max_export_batch_size/development'] ?? undefined,
  });
}

function createPullMetricReaderFromConfig(
  pull: PullMetricReaderConfigModel
): MetricReader {
  // TODO(6425): add cardinality_limits
  checkConfigUse('PullMetricReader', pull, ['exporter', 'producers']);

  const metricProducers = pull.producers?.map(createMetricProducerFromConfig);

  // The declarative config models a `pull` MetricReader as an object that takes
  // an exporter, e.g.:
  //    meter_provider:
  //      readers:
  //        - pull:
  //            exporter:
  //              prometheus/development: ... # (A)
  //            # (B)
  //            producers: ...
  //            cardinality_limits: ...
  // but the exporter (or at least the only current one, PrometheusExporter)
  // *is* a MetricReader, and takes configuration from (A) and (B).
  //    export class PrometheusExporter extends MetricReader { ... }
  const [name, properties] = mustSingleEntry(
    pull.exporter,
    'PullMetricExporter'
  );

  switch (name) {
    case 'prometheus/development': {
      // TODO(6653): 'translation_strategy' with #6653 or separately
      // TODO(6605): 'resource_constant_labels' map to `withResourceConstantLabels` regex
      checkConfigUse(
        'ExperimentalPrometheusMetricExporterConfigModel',
        properties!,
        [
          'host',
          'port',
          'scope_info_enabled',
          'target_info_enabled/development',
        ]
      );

      const props =
        properties as ExperimentalPrometheusMetricExporterConfigModel;
      return new PrometheusExporter({
        // TODO(6605): default host to `undefined` when PrometheusExporter defaults to 'localhost'
        host: props?.host ?? 'localhost',
        // TODO(6958): default port and host to `undefined` when PrometheusExporter constructor no longer reads envvars for config
        port: props?.port ?? 9464,
        withoutScopeInfo:
          props?.scope_info_enabled != null
            ? !props.scope_info_enabled
            : undefined,
        withoutTargetInfo:
          props?.['target_info_enabled/development'] != null
            ? !props['target_info_enabled/development']
            : undefined,
        metricProducers,
        // Note: The following are not configurable via declarative config.
        // This isn't necessarily an issue.
        // - prefix
        // - appendTimestamp
        // - endpoint
        // - preventServerStart
        // - callback (second arg)
      });
    }

    default:
      throw new Error(
        `unknown PullMetricReader name in configuration: "${name}"`
      );
  }
}

function createMetricReaderFromConfig(
  reader: MetricReaderConfigModel
): MetricReader {
  const [name, properties] = mustSingleEntry(reader, 'MetricReader');

  switch (name) {
    case 'periodic':
      return createPeriodicMetricReaderFromConfig(
        properties as PeriodicMetricReaderConfigModel
      );
    case 'pull':
      return createPullMetricReaderFromConfig(
        properties as PullMetricReaderConfigModel
      );
    default:
      throw new Error(
        `unknown MetricReader type in configuration: "${Object.keys(reader)[0]}"`
      );
  }
}

function instrumentTypeFromConfig(
  instrument_type: InstrumentTypeConfigModel
): InstrumentType | undefined {
  switch (instrument_type) {
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
      throw new Error(`unknown InstrumentType: ${instrument_type}`);
  }
}

function createAggregationOptionFromConfig(
  aggregation: AggregationConfigModel
): AggregationOption | undefined {
  const [name, properties] = mustSingleEntry(aggregation, 'Aggregation');

  switch (name) {
    case 'default':
      return {
        type: AggregationType.DEFAULT,
      };
    case 'drop':
      return {
        type: AggregationType.DROP,
      };
    case 'explicit_bucket_histogram': {
      checkConfigUse('ExplicitBucketHistogramAggregation', properties!, [
        'record_min_max',
        'boundaries',
      ]);
      const props = properties as ExplicitBucketHistogramAggregationConfigModel;
      return {
        type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
        options: {
          recordMinMax: props?.record_min_max ?? true,
          boundaries: props?.boundaries ?? [
            0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500,
            10000,
          ],
        },
      };
    }
    case 'base2_exponential_bucket_histogram': {
      // TODO(3841): max_scale property
      checkConfigUse(
        'Base2ExponentialBucketHistogramAggregation',
        properties!,
        ['record_min_max', 'max_size']
      );
      const props =
        properties as Base2ExponentialBucketHistogramAggregationConfigModel;
      return {
        type: AggregationType.EXPONENTIAL_HISTOGRAM,
        options: {
          recordMinMax: props?.record_min_max ?? undefined,
          maxSize: props?.max_size ?? undefined,
        },
      };
    }
    case 'last_value':
      return {
        type: AggregationType.LAST_VALUE,
      };
    case 'sum':
      return {
        type: AggregationType.SUM,
      };
    default:
      throw new Error(`unknown Aggregation name in configuration: "${name}"`);
  }
}

function createViewOptionsFromConfig(view: ViewConfigModel): ViewOptions {
  const viewOptions: ViewOptions = {};
  checkConfigUse('View', view, ['selector', 'stream']);

  checkConfigUse('ViewSelector', view.selector, [
    'instrument_name',
    'instrument_type',
    'unit',
    'meter_name',
    'meter_version',
    'meter_schema_url',
  ]);
  if (view.selector.instrument_name) {
    viewOptions.instrumentName = view.selector.instrument_name;
  }
  if (view.selector.instrument_type) {
    viewOptions.instrumentType = instrumentTypeFromConfig(
      view.selector.instrument_type
    );
  }
  if (view.selector.unit) {
    viewOptions.instrumentUnit = view.selector.unit;
  }
  if (view.selector.meter_name) {
    viewOptions.meterName = view.selector.meter_name;
  }
  if (view.selector.meter_version) {
    viewOptions.meterVersion = view.selector.meter_version;
  }
  if (view.selector.meter_schema_url) {
    viewOptions.meterSchemaUrl = view.selector.meter_schema_url;
  }

  checkConfigUse('ViewStream', view.stream, [
    'name',
    'description',
    'aggregation',
    'aggregation_cardinality_limit',
    'attribute_keys',
  ]);
  if (view.stream.name) {
    viewOptions.name = view.stream.name;
  }
  if (view.stream.description) {
    viewOptions.description = view.stream.description;
  }
  if (view.stream.aggregation) {
    viewOptions.aggregation = createAggregationOptionFromConfig(
      view.stream.aggregation
    );
  }
  viewOptions.aggregationCardinalityLimit =
    view.stream.aggregation_cardinality_limit ?? undefined;
  if (view.stream.attribute_keys) {
    const processors: IAttributesProcessor[] = [];
    if (
      view.stream.attribute_keys.included &&
      view.stream.attribute_keys.included.length > 0
    ) {
      // TODO(6951): support wildcards
      // Current sdk-metrics does not support *patterns* via '*' and '?'
      // as defined by IncludeExclude type in declarative config.
      const unsupportedKeys = view.stream.attribute_keys.included.filter(
        k => k.includes('*') || k.includes('?')
      );
      if (unsupportedKeys.length > 0) {
        throw new Error(
          `invalid /meter_provider/views/?/stream/attribute_keys/included in configuration: do not support wildcards: "${unsupportedKeys.join('", "')}"`
        );
      }
      processors.push(
        createAllowListAttributesProcessor(view.stream.attribute_keys.included)
      );
    }
    if (
      view.stream.attribute_keys.excluded &&
      view.stream.attribute_keys.excluded.length > 0
    ) {
      // TODO(6951): support wildcards
      // Current sdk-metrics does not support *patterns* via '*' and '?'
      // as defined by IncludeExclude type in declarative config.
      const unsupportedKeys = view.stream.attribute_keys.excluded.filter(
        k => k.includes('*') || k.includes('?')
      );
      if (unsupportedKeys.length > 0) {
        throw new Error(
          `invalid /meter_provider/views/?/stream/attribute_keys/excluded in configuration: do not support wildcards: "${unsupportedKeys.join('", "')}"`
        );
      }
      processors.push(
        createDenyListAttributesProcessor(view.stream.attribute_keys.excluded)
      );
    }
    if (processors.length > 0) {
      viewOptions.attributesProcessors = processors;
    }
  }

  return viewOptions;
}

export function createMeterProviderFromConfig(
  resource: Resource,
  meter_provider: MeterProviderConfigModel
): MeterProvider {
  const readers = meter_provider.readers.map(createMetricReaderFromConfig);
  const views = meter_provider.views?.map(createViewOptionsFromConfig);

  // TODO(5147): exemplar_filter when sdk-metrics package supports it
  // TODO(6952): meter_configurator/development when sdk-metrics package supports it
  checkConfigUse('MeterProvider', meter_provider, ['readers', 'views']);

  return new MeterProvider({
    resource,
    readers,
    views,
    // Note: sdkMetricsEnabled not configurable via decl conf. Once SDK health metrics are stabilized, they will be on by default.
  });
}

function createSpanExporterFromConfig(
  exporter: SpanExporterConfigModel
): SpanExporter {
  const [name, properties] = mustSingleEntry(exporter, 'SpanExporter');

  switch (name) {
    case 'otlp_http': {
      checkConfigUse('OtlpHttpExporter', properties!, [
        'compression',
        'endpoint',
        'headers',
        'headers_list',
        'timeout',
        'tls',
        'encoding',
      ]);
      const props = properties as OtlpHttpExporterConfigModel;
      const commonOpts = {
        compression:
          props?.compression === 'gzip'
            ? CompressionAlgorithm.GZIP
            : CompressionAlgorithm.NONE,
        url: props?.endpoint ?? undefined,
        headers: mergeHeadersConfig(props?.headers, props?.headers_list),
        timeoutMillis: validateExportTimeoutConfig(
          props?.timeout,
          'OtlpHttpExporter.timeout'
        ),
        httpAgentOptions: httpTlsOptionsFromConfig(props?.tls),
      };
      const encoding = props?.encoding ?? 'protobuf';
      switch (encoding) {
        case 'json':
          return new OTLPHttpTraceExporter(commonOpts);
        case 'protobuf':
          return new OTLPProtoTraceExporter(commonOpts);
        default:
          throw new Error(
            `unknown OtlpHttpExporter encoding in configuration: "${encoding}"`
          );
      }
    }

    case 'otlp_grpc': {
      checkConfigUse('OtlpGrpcExporter', properties!, [
        'compression',
        'endpoint',
        'timeout',
        'tls',
        'headers',
        'headers_list',
      ]);
      const props = properties as OtlpGrpcExporterConfigModel;
      return new OTLPGrpcTraceExporter({
        compression:
          props?.compression === 'gzip'
            ? CompressionAlgorithm.GZIP
            : CompressionAlgorithm.NONE,
        url: props?.endpoint ?? undefined,
        timeoutMillis: validateExportTimeoutConfig(
          props?.timeout,
          'OtlpGrpcExporter.timeout'
        ),
        credentials: grpcCredentialsFromConfig(props?.tls),
        metadata: getGrpcMetadataFromHeaders(
          props?.headers,
          props?.headers_list
        ),
      });
    }

    case 'console':
      return new ConsoleSpanExporter();

    default:
      throw new Error(`unknown SpanExporter name in configuration: "${name}"`);
  }
}

function createSpanProcessorFromConfig(
  processor: SpanProcessorConfigModel
): SpanProcessor {
  const [name, properties] = mustSingleEntry(processor, 'SpanProcessor');

  switch (name) {
    case 'batch': {
      checkConfigUse('BatchSpanProcessor', properties!, [
        'exporter',
        'max_queue_size',
        'max_export_batch_size',
        'schedule_delay',
        'export_timeout',
      ]);
      const props = properties as BatchSpanProcessorConfigModel;
      const exporter = createSpanExporterFromConfig(props.exporter);
      return new BatchSpanProcessor({
        exporter,
        maxQueueSize: props.max_queue_size ?? undefined,
        maxExportBatchSize: props.max_export_batch_size ?? undefined,
        scheduledDelayMillis: props.schedule_delay ?? undefined,
        exportTimeoutMillis: validateExportTimeoutConfig(
          props.export_timeout,
          'BatchSpanProcessor.export_timeout'
        ),
      });
    }

    case 'simple': {
      const props = properties as SimpleSpanProcessorConfigModel;
      const exporter = createSpanExporterFromConfig(props.exporter);
      return new SimpleSpanProcessor({ exporter });
    }

    default:
      throw new Error(`unknown SpanProcessor name: "${name}"`);
  }
}

/**
 * Returns a Sampler for the `tracer_provider.sampler` in configuration,
 * or `undefined` if not set.
 *
 * Exported for testing.
 */
export function createSamplerFromConfig(
  samplerConfig?: SamplerConfigModel
): Sampler | undefined {
  if (!samplerConfig) {
    return undefined;
  }

  const [name, properties] = mustSingleEntry(samplerConfig, 'Sampler');

  switch (name) {
    case 'always_off':
      return new AlwaysOffSampler();
    case 'always_on':
      return new AlwaysOnSampler();
    case 'trace_id_ratio_based': {
      const DEFAULT_RATIO = 1.0;
      const props = properties as TraceIdRatioBasedSamplerConfigModel;
      return new TraceIdRatioBasedSampler(props?.ratio ?? DEFAULT_RATIO);
    }
    case 'parent_based': {
      const props = properties as ParentBasedSamplerConfigModel;
      return new ParentBasedSampler({
        root: createSamplerFromConfig(props?.root) ?? new AlwaysOnSampler(),
        remoteParentSampled: createSamplerFromConfig(
          props?.remote_parent_sampled
        ),
        remoteParentNotSampled: createSamplerFromConfig(
          props?.remote_parent_not_sampled
        ),
        localParentSampled: createSamplerFromConfig(
          props?.local_parent_sampled
        ),
        localParentNotSampled: createSamplerFromConfig(
          props?.local_parent_not_sampled
        ),
      });
    }

    // TODO: always_record, once there is a release of opentelemetry-configuration with https://github.com/open-telemetry/opentelemetry-configuration/pull/698
    // case 'always_record': {
    //   const props = properties as AlwaysRecordConfigModel;
    //   return createAlwaysRecordSampler(createSamplerFromConfig(props.root));
    // }
    // TODO(6961): composite/development
    // TODO(6541): probability/development (via composite support for?)
    // TODO(later): Consider supporting jaeger_remote/development if requested by a user. Only consider `sampler-jaeger-remote` package after axios dep is dropped in #6963.

    default:
      throw new Error(`unknown Sampler name: "${name}"`);
  }
}

export function createIdGeneratorFromConfig(
  id_generator?: IdGeneratorConfigModel
): IdGenerator | undefined {
  if (!id_generator) {
    return undefined;
  }

  const [name] = mustSingleEntry(id_generator, 'IdGenerator');
  switch (name) {
    case 'random':
      return new RandomIdGenerator();
    default:
      throw new Error(`unknown IdGenerator name: "${name}"`);
  }
}

export function createTracerProviderFromConfig(
  resource: Resource,
  tracer_provider: TracerProviderConfigModel,
  attribute_limits?: AttributeLimitsConfigModel
): TracerProvider {
  const spanProcessors = tracer_provider.processors.map(p =>
    createSpanProcessorFromConfig(p)
  );
  const spanLimits = createSpanLimitsFromConfig(
    tracer_provider.limits,
    attribute_limits
  );
  const sampler = createSamplerFromConfig(tracer_provider.sampler);
  const idGenerator = createIdGeneratorFromConfig(tracer_provider.id_generator);

  checkConfigUse('TracerProvider', tracer_provider, [
    'processors',
    'limits',
    'sampler',
    'id_generator',
  ]);

  // TODO(6960): 'tracer_configurator/development', TracerProvider doesn't currently support this
  // TODO(6624): meterProvider, if SDK health metrics enabled
  return new TracerProvider({
    resource,
    spanProcessors,
    spanLimits,
    sampler,
    idGenerator,
  });
}

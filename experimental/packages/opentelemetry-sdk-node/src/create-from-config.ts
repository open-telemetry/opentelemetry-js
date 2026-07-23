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

import type { TextMapPropagator } from '@opentelemetry/api';
import { diag } from '@opentelemetry/api';
import type { SpanLimits } from '@opentelemetry/sdk-trace';
import type { Resource } from '@opentelemetry/resources';
import { OTLPLogExporter as OTLPHttpLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPLogExporter as OTLPGrpcLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPLogExporter as OTLPProtoLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import type {
  AttributeLimitsConfigModel,
  BatchLogRecordProcessorConfigModel,
  LoggerProviderConfigModel,
  LogRecordExporterConfigModel,
  LogRecordLimitsConfigModel,
  LogRecordProcessorConfigModel,
  OtlpGrpcExporterConfigModel,
  OtlpHttpExporterConfigModel,
  PropagatorConfigModel,
  SimpleLogRecordProcessorConfigModel,
  SpanLimitsConfigModel,
  TextMapPropagatorConfigModel,
} from '@opentelemetry/configuration';
import { mergePropagatorCompositeConfig } from '@opentelemetry/configuration';
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
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';

import {
  getGrpcCredentialsFromTls,
  getGrpcMetadataFromHeaders,
  getHeadersFromConfiguration,
  getHttpAgentOptionsFromTls,
  validateExporterTimeout,
} from './utils';

// ---- internal utilities

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
      checkConfigUse('LogRecordExporter', properties!, [
        'compression',
        'endpoint',
        'headers',
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
      checkConfigUse('LogRecordExporter', properties!, [
        'compression',
        'endpoint',
        'timeout',
        'tls',
        'headers',
      ]);
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
        exportTimeoutMillis: props.export_timeout ?? undefined,
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

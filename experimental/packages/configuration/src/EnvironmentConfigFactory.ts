/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getBooleanFromEnv,
  getStringFromEnv,
  getStringListFromEnv,
  getNumberFromEnv,
} from '@opentelemetry/core';
import type { ConfigFactory } from './IConfigFactory';
import type { ConfigurationModel } from './generated/types';
import { ExemplarFilter, SeverityNumber } from './generated/types';
import { diag } from '@opentelemetry/api';
import { getGrpcTlsConfig, getHttpTlsConfig } from './utils';

type ExperimentalResourceDetector = NonNullable<
  NonNullable<
    NonNullable<ConfigurationModel['resource']>['detection/development']
  >['detectors']
>[number];

export function initializeDefaultConfiguration(): ConfigurationModel {
  return {
    disabled: false,
    log_level: SeverityNumber.Info,
    resource: {},
    attribute_limits: {
      attribute_count_limit: 128,
    },
  };
}

export function initializeDefaultTracerProviderConfiguration(): NonNullable<
  ConfigurationModel['tracer_provider']
> {
  return {
    processors: [],
    limits: {
      attribute_count_limit: 128,
      event_count_limit: 128,
      link_count_limit: 128,
      event_attribute_count_limit: 128,
      link_attribute_count_limit: 128,
    },
    sampler: {
      parent_based: {
        root: { always_on: undefined },
        remote_parent_sampled: { always_on: undefined },
        remote_parent_not_sampled: { always_off: undefined },
        local_parent_sampled: { always_on: undefined },
        local_parent_not_sampled: { always_off: undefined },
      },
    },
  };
}

export function initializeDefaultMeterProviderConfiguration(): NonNullable<
  ConfigurationModel['meter_provider']
> {
  return {
    readers: [],
    views: [],
    exemplar_filter: ExemplarFilter.TraceBased,
  };
}

export function initializeDefaultLoggerProviderConfiguration(): NonNullable<
  ConfigurationModel['logger_provider']
> {
  return {
    processors: [],
    limits: { attribute_count_limit: 128 },
    'logger_configurator/development': {},
  };
}

/**
 * EnvironmentConfigProvider provides a configuration based on environment variables.
 */
export class EnvironmentConfigFactory implements ConfigFactory {
  private _config: ConfigurationModel;

  constructor() {
    this._config = initializeDefaultConfiguration();

    const sdkDisabled = getBooleanFromEnv('OTEL_SDK_DISABLED');
    if (sdkDisabled !== undefined) {
      this._config.disabled = sdkDisabled;
    }

    const logLevelString = getStringFromEnv('OTEL_LOG_LEVEL');
    if (logLevelString) {
      // Store as lowercase; consumers convert to DiagLogLevel via diagLogLevelFromString
      (this._config as Record<string, unknown>).log_level =
        logLevelString.toLowerCase();
    }

    setResources(this._config);
    setAttributeLimits(this._config);
    setPropagators(this._config);
    setTracerProvider(this._config);
    setSampler(this._config);
    setMeterProvider(this._config);
    setLoggerProvider(this._config);
  }

  getConfigModel(): ConfigurationModel {
    return this._config;
  }
}

export function setResources(config: ConfigurationModel): void {
  if (config.resource == null) {
    config.resource = {};
  }

  const resourceAttrList = getStringFromEnv('OTEL_RESOURCE_ATTRIBUTES');
  const list = getStringListFromEnv('OTEL_RESOURCE_ATTRIBUTES');
  const serviceName = getStringFromEnv('OTEL_SERVICE_NAME');

  if (serviceName) {
    config.resource.attributes = [
      {
        name: 'service.name',
        value: serviceName,
        type: 'string',
      },
    ];
  }
  if (list && list.length > 0) {
    config.resource.attributes_list = resourceAttrList ?? undefined;
    if (config.resource.attributes == null) {
      config.resource.attributes = [];
    }

    for (let i = 0; i < list.length; i++) {
      const element = list[i].split('=');
      if (
        element[0] !== 'service.name' ||
        (element[0] === 'service.name' && serviceName === undefined)
      ) {
        config.resource.attributes.push({
          name: element[0],
          value: element[1],
          type: 'string',
        });
      }
    }
  }

  const nodeDetectors = getStringListFromEnv('OTEL_NODE_RESOURCE_DETECTORS');
  if (
    nodeDetectors &&
    nodeDetectors.length > 0 &&
    !nodeDetectors.includes('none')
  ) {
    const all = nodeDetectors.includes('all');
    const detectors: ExperimentalResourceDetector[] = [];
    if (all || nodeDetectors.includes('container'))
      detectors.push({ container: {} });
    if (all || nodeDetectors.includes('host')) detectors.push({ host: {} });
    if (all || nodeDetectors.includes('os')) detectors.push({ os: {} });
    if (all || nodeDetectors.includes('process'))
      detectors.push({ process: {} });
    if (all || nodeDetectors.includes('serviceinstance'))
      detectors.push({ service: {} });
    if (all || nodeDetectors.includes('env')) detectors.push({ env: {} });
    if (detectors.length > 0) {
      if (config.resource['detection/development'] == null) {
        config.resource['detection/development'] = {};
      }
      config.resource['detection/development'].detectors = detectors;
    }
  }
}

export function setAttributeLimits(config: ConfigurationModel): void {
  const attributeValueLengthLimit = getNumberFromEnv(
    'OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT'
  );
  if (attributeValueLengthLimit && attributeValueLengthLimit > 0) {
    if (config.attribute_limits == null) {
      config.attribute_limits = { attribute_count_limit: 128 };
    }
    config.attribute_limits.attribute_value_length_limit =
      attributeValueLengthLimit;
  }

  const attributeCountLimit = getNumberFromEnv('OTEL_ATTRIBUTE_COUNT_LIMIT');
  if (attributeCountLimit) {
    if (config.attribute_limits == null) {
      config.attribute_limits = { attribute_count_limit: attributeCountLimit };
    } else {
      config.attribute_limits.attribute_count_limit = attributeCountLimit;
    }
  }
}

export function setPropagators(config: ConfigurationModel): void {
  if (config.propagator == null) {
    config.propagator = {};
  }
  const composite = getStringListFromEnv('OTEL_PROPAGATORS');
  if (composite && composite.length > 0) {
    config.propagator.composite = [];
    for (let i = 0; i < composite.length; i++) {
      config.propagator.composite.push({ [composite[i]]: null } as never);
    }
  }
  const compositeList = getStringFromEnv('OTEL_PROPAGATORS');
  if (compositeList) {
    config.propagator.composite_list = compositeList;
  }
}

export function setSampler(config: ConfigurationModel): void {
  const sampler = getStringFromEnv('OTEL_TRACES_SAMPLER');
  const arg = getStringFromEnv('OTEL_TRACES_SAMPLER_ARG');

  if (!sampler || !config.tracer_provider) {
    return;
  }

  const ratio = arg ? parseFloat(arg) : 1.0;

  switch (sampler) {
    case 'always_on':
      config.tracer_provider.sampler = {
        always_on: {},
      } as unknown as NonNullable<
        NonNullable<ConfigurationModel['tracer_provider']>['sampler']
      >;
      break;

    case 'always_off':
      config.tracer_provider.sampler = {
        always_off: {},
      } as unknown as NonNullable<
        NonNullable<ConfigurationModel['tracer_provider']>['sampler']
      >;
      break;

    case 'traceidratio':
      config.tracer_provider.sampler = {
        trace_id_ratio_based: { ratio },
      } as unknown as NonNullable<
        NonNullable<ConfigurationModel['tracer_provider']>['sampler']
      >;
      break;

    case 'parentbased_always_on':
      config.tracer_provider.sampler = {
        parent_based: { root: { always_on: {} } },
      } as unknown as NonNullable<
        NonNullable<ConfigurationModel['tracer_provider']>['sampler']
      >;
      break;

    case 'parentbased_always_off':
      config.tracer_provider.sampler = {
        parent_based: { root: { always_off: {} } },
      } as unknown as NonNullable<
        NonNullable<ConfigurationModel['tracer_provider']>['sampler']
      >;
      break;

    case 'parentbased_traceidratio':
      config.tracer_provider.sampler = {
        parent_based: { root: { trace_id_ratio_based: { ratio } } },
      } as unknown as NonNullable<
        NonNullable<ConfigurationModel['tracer_provider']>['sampler']
      >;
      break;

    default:
      diag.warn(`Unknown sampler type: ${sampler}`);
      break;
  }
}

export function setTracerProvider(config: ConfigurationModel): void {
  const exportersType = Array.from(
    new Set(getStringListFromEnv('OTEL_TRACES_EXPORTER'))
  );
  if (exportersType.length === 0) {
    return;
  }
  if (exportersType.includes('none')) {
    diag.info(
      `OTEL_TRACES_EXPORTER contains "none". Tracer provider will not be initialized.`
    );
    return;
  }
  config.tracer_provider = initializeDefaultTracerProviderConfiguration();

  const attributeValueLengthLimit = getNumberFromEnv(
    'OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT'
  );
  if (attributeValueLengthLimit) {
    config.tracer_provider.limits!.attribute_value_length_limit =
      attributeValueLengthLimit;
  }

  const attributeCountLimit = getNumberFromEnv(
    'OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT'
  );
  if (attributeCountLimit) {
    config.tracer_provider.limits!.attribute_count_limit = attributeCountLimit;
  }

  const eventCountLimit = getNumberFromEnv('OTEL_SPAN_EVENT_COUNT_LIMIT');
  if (eventCountLimit) {
    config.tracer_provider.limits!.event_count_limit = eventCountLimit;
  }

  const linkCountLimit = getNumberFromEnv('OTEL_SPAN_LINK_COUNT_LIMIT');
  if (linkCountLimit) {
    config.tracer_provider.limits!.link_count_limit = linkCountLimit;
  }

  const eventAttributeCountLimit = getNumberFromEnv(
    'OTEL_EVENT_ATTRIBUTE_COUNT_LIMIT'
  );
  if (eventAttributeCountLimit) {
    config.tracer_provider.limits!.event_attribute_count_limit =
      eventAttributeCountLimit;
  }

  const linkAttributeCountLimit = getNumberFromEnv(
    'OTEL_LINK_ATTRIBUTE_COUNT_LIMIT'
  );
  if (linkAttributeCountLimit) {
    config.tracer_provider.limits!.link_attribute_count_limit =
      linkAttributeCountLimit;
  }

  const batch: Record<string, unknown> = { exporter: {} };
  const scheduleDelay = getNumberFromEnv('OTEL_BSP_SCHEDULE_DELAY') ?? 5000;
  if (scheduleDelay) {
    batch.schedule_delay = scheduleDelay;
  }

  const exportTimeout = getNumberFromEnv('OTEL_BSP_EXPORT_TIMEOUT') ?? 30000;
  if (exportTimeout) {
    batch.export_timeout = exportTimeout;
  }

  const maxQueueSize = getNumberFromEnv('OTEL_BSP_MAX_QUEUE_SIZE') ?? 2048;
  if (maxQueueSize) {
    batch.max_queue_size = maxQueueSize;
  }

  const maxExportBatchSize =
    getNumberFromEnv('OTEL_BSP_MAX_EXPORT_BATCH_SIZE') ?? 512;
  if (maxExportBatchSize) {
    batch.max_export_batch_size = maxExportBatchSize;
  }

  for (let i = 0; i < exportersType.length; i++) {
    const exporterType = exportersType[i];
    const batchInfo = { ...batch, exporter: {} as Record<string, unknown> };
    if (exporterType === 'console') {
      config.tracer_provider.processors!.push({
        simple: { exporter: { console: {} } },
      } as never);
    } else {
      const protocol =
        getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_PROTOCOL') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_PROTOCOL') ??
        'http/protobuf';
      const certificateFile =
        getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_CERTIFICATE');
      const clientKeyFile =
        getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_CLIENT_KEY');
      const clientCertificateFile =
        getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE');
      const compression =
        getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_COMPRESSION') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_COMPRESSION');
      const timeout =
        getNumberFromEnv('OTEL_EXPORTER_OTLP_TRACES_TIMEOUT') ??
        getNumberFromEnv('OTEL_EXPORTER_OTLP_TIMEOUT') ??
        10000;
      const headersList =
        getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_HEADERS') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_HEADERS');

      if (protocol === 'grpc') {
        const otlpGrpc: Record<string, unknown> = {};
        const endpoint =
          getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT') ??
          getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT') ??
          'http://localhost:4317';
        if (endpoint) otlpGrpc.endpoint = endpoint;
        const tls = getGrpcTlsConfig(
          certificateFile,
          clientKeyFile,
          clientCertificateFile
        );
        if (tls) otlpGrpc.tls = tls;
        if (compression) otlpGrpc.compression = compression;
        if (timeout) otlpGrpc.timeout = timeout;
        if (headersList) otlpGrpc.headers_list = headersList;
        batchInfo.exporter = { otlp_grpc: otlpGrpc };
      } else {
        const otlpHttp: Record<string, unknown> = {};
        const endpoint =
          getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT') ??
          (getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')
            ? `${getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')}/v1/traces`
            : 'http://localhost:4318/v1/traces');
        if (endpoint) otlpHttp.endpoint = endpoint;
        const tls = getHttpTlsConfig(
          certificateFile,
          clientKeyFile,
          clientCertificateFile
        );
        if (tls) otlpHttp.tls = tls;
        if (compression) otlpHttp.compression = compression;
        if (timeout) otlpHttp.timeout = timeout;
        if (headersList) otlpHttp.headers_list = headersList;
        if (protocol === 'http/json') otlpHttp.encoding = 'json';
        else if (protocol === 'http/protobuf') otlpHttp.encoding = 'protobuf';
        batchInfo.exporter = { otlp_http: otlpHttp };
      }

      config.tracer_provider.processors!.push({ batch: batchInfo } as never);
    }
  }
}

export function setMeterProvider(config: ConfigurationModel): void {
  const exportersType = Array.from(
    new Set(getStringListFromEnv('OTEL_METRICS_EXPORTER'))
  );
  if (exportersType.length === 0) {
    return;
  }
  if (exportersType.includes('none')) {
    diag.info(
      `OTEL_METRICS_EXPORTER contains "none". Meter provider will not be initialized.`
    );
    return;
  }
  config.meter_provider = initializeDefaultMeterProviderConfiguration();

  const readerPeriodic: Record<string, unknown> = { exporter: {} };
  const interval = getNumberFromEnv('OTEL_METRIC_EXPORT_INTERVAL') ?? 60000;
  if (interval) {
    readerPeriodic.interval = interval;
  }
  for (let i = 0; i < exportersType.length; i++) {
    const exporterType = exportersType[i];
    if (exporterType === 'prometheus') {
      const pullReader = {
        exporter: {
          'prometheus/development': {
            host:
              getStringFromEnv('OTEL_EXPORTER_PROMETHEUS_HOST') ?? 'localhost',
            port: getNumberFromEnv('OTEL_EXPORTER_PROMETHEUS_PORT') ?? 9464,
            without_scope_info: false,
            without_target_info: false,
          },
        },
      };
      config.meter_provider.readers!.push({ pull: pullReader } as never);
      continue;
    }

    const readerPeriodicInfo: Record<string, unknown> = {
      ...readerPeriodic,
      exporter: {} as Record<string, unknown>,
    };
    const timeout = getNumberFromEnv('OTEL_METRIC_EXPORT_TIMEOUT') ?? 30000;
    if (timeout) {
      readerPeriodicInfo.timeout = timeout;
    }

    if (exporterType === 'console') {
      readerPeriodicInfo.exporter = { console: {} };
    } else {
      const protocol =
        getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_PROTOCOL') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_PROTOCOL') ??
        'http/protobuf';
      const certificateFile =
        getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_CERTIFICATE');
      const clientKeyFile =
        getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_CLIENT_KEY');
      const clientCertificateFile =
        getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE');
      const compression =
        getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_COMPRESSION') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_COMPRESSION');
      const timeoutExporter =
        getNumberFromEnv('OTEL_EXPORTER_OTLP_METRICS_TIMEOUT') ??
        getNumberFromEnv('OTEL_EXPORTER_OTLP_TIMEOUT') ??
        10000;
      const headersList =
        getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_HEADERS') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_HEADERS');
      const rawTemporality =
        getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE') ??
        'cumulative';
      const validTemporalities = ['cumulative', 'delta', 'low_memory'];
      const temporalityPreference = validTemporalities.includes(rawTemporality)
        ? rawTemporality
        : 'cumulative';
      const rawHistogramAgg =
        getStringFromEnv(
          'OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION'
        ) ?? 'explicit_bucket_histogram';
      const validHistogramAggs = [
        'explicit_bucket_histogram',
        'base2_exponential_bucket_histogram',
      ];
      const defaultHistogramAggregation = validHistogramAggs.includes(
        rawHistogramAgg
      )
        ? rawHistogramAgg
        : 'explicit_bucket_histogram';

      if (protocol === 'grpc') {
        const otlpGrpc: Record<string, unknown> = {};
        const endpoint =
          getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_ENDPOINT') ??
          getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT') ??
          'http://localhost:4317';
        if (endpoint) otlpGrpc.endpoint = endpoint;
        const tls = getGrpcTlsConfig(
          certificateFile,
          clientKeyFile,
          clientCertificateFile
        );
        if (tls) otlpGrpc.tls = tls;
        if (compression) otlpGrpc.compression = compression;
        if (timeoutExporter) otlpGrpc.timeout = timeoutExporter;
        if (headersList) otlpGrpc.headers_list = headersList;
        if (temporalityPreference)
          otlpGrpc.temporality_preference = temporalityPreference;
        if (defaultHistogramAggregation)
          otlpGrpc.default_histogram_aggregation = defaultHistogramAggregation;
        readerPeriodicInfo.exporter = { otlp_grpc: otlpGrpc };
      } else {
        const otlpHttp: Record<string, unknown> = {};
        const endpoint =
          getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_ENDPOINT') ??
          (getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')
            ? `${getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')}/v1/metrics`
            : 'http://localhost:4318/v1/metrics');
        if (endpoint) otlpHttp.endpoint = endpoint;
        const tls = getHttpTlsConfig(
          certificateFile,
          clientKeyFile,
          clientCertificateFile
        );
        if (tls) otlpHttp.tls = tls;
        if (compression) otlpHttp.compression = compression;
        if (timeoutExporter) otlpHttp.timeout = timeoutExporter;
        if (headersList) otlpHttp.headers_list = headersList;
        if (temporalityPreference)
          otlpHttp.temporality_preference = temporalityPreference;
        if (defaultHistogramAggregation)
          otlpHttp.default_histogram_aggregation = defaultHistogramAggregation;
        if (protocol === 'http/json') otlpHttp.encoding = 'json';
        else if (protocol === 'http/protobuf') otlpHttp.encoding = 'protobuf';
        readerPeriodicInfo.exporter = { otlp_http: otlpHttp };
      }
    }
    config.meter_provider.readers!.push({
      periodic: readerPeriodicInfo,
    } as never);
  }

  const rawExemplarFilter =
    getStringFromEnv('OTEL_METRICS_EXEMPLAR_FILTER') ??
    ExemplarFilter.TraceBased;
  const exemplarFilter =
    rawExemplarFilter === 'default'
      ? ExemplarFilter.TraceBased
      : rawExemplarFilter;
  if (exemplarFilter) {
    config.meter_provider.exemplar_filter = exemplarFilter as never;
  }
}

export function setLoggerProvider(config: ConfigurationModel): void {
  const exportersType = Array.from(
    new Set(getStringListFromEnv('OTEL_LOGS_EXPORTER'))
  );
  if (exportersType.length === 0) {
    return;
  }
  if (exportersType.includes('none')) {
    diag.info(
      `OTEL_LOGS_EXPORTER contains "none". Logger provider will not be initialized.`
    );
    return;
  }
  config.logger_provider = initializeDefaultLoggerProviderConfiguration();

  const attributeValueLengthLimit = getNumberFromEnv(
    'OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT'
  );
  const attributeCountLimit = getNumberFromEnv(
    'OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT'
  );
  if (attributeValueLengthLimit || attributeCountLimit) {
    if (attributeValueLengthLimit) {
      config.logger_provider.limits!.attribute_value_length_limit =
        attributeValueLengthLimit;
    }

    if (attributeCountLimit) {
      config.logger_provider.limits!.attribute_count_limit =
        attributeCountLimit;
    }
  }

  const batch: Record<string, unknown> = { exporter: {} };
  const scheduleDelay = getNumberFromEnv('OTEL_BLRP_SCHEDULE_DELAY') ?? 1000;
  if (scheduleDelay) {
    batch.schedule_delay = scheduleDelay;
  }

  const exportTimeout = getNumberFromEnv('OTEL_BLRP_EXPORT_TIMEOUT') ?? 30000;
  if (exportTimeout) {
    batch.export_timeout = exportTimeout;
  }

  const maxQueueSize = getNumberFromEnv('OTEL_BLRP_MAX_QUEUE_SIZE') ?? 2048;
  if (maxQueueSize) {
    batch.max_queue_size = maxQueueSize;
  }

  const maxExportBatchSize =
    getNumberFromEnv('OTEL_BLRP_MAX_EXPORT_BATCH_SIZE') ?? 512;
  if (maxExportBatchSize) {
    batch.max_export_batch_size = maxExportBatchSize;
  }

  for (let i = 0; i < exportersType.length; i++) {
    const exporterType = exportersType[i];
    const batchInfo = { ...batch, exporter: {} as Record<string, unknown> };
    if (exporterType === 'console') {
      config.logger_provider.processors!.push({
        simple: { exporter: { console: {} } },
      } as never);
    } else {
      const protocol =
        getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_PROTOCOL') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_PROTOCOL') ??
        'http/protobuf';
      const certificateFile =
        getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_CERTIFICATE');
      const clientKeyFile =
        getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_CLIENT_KEY');
      const clientCertificateFile =
        getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE');
      const compression =
        getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_COMPRESSION') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_COMPRESSION');
      const timeout =
        getNumberFromEnv('OTEL_EXPORTER_OTLP_LOGS_TIMEOUT') ??
        getNumberFromEnv('OTEL_EXPORTER_OTLP_TIMEOUT') ??
        10000;
      const headersList =
        getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_HEADERS') ??
        getStringFromEnv('OTEL_EXPORTER_OTLP_HEADERS');

      if (protocol === 'grpc') {
        const otlpGrpc: Record<string, unknown> = {};
        const endpoint =
          getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_ENDPOINT') ??
          getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT') ??
          'http://localhost:4317';
        if (endpoint) otlpGrpc.endpoint = endpoint;
        const tls = getGrpcTlsConfig(
          certificateFile,
          clientKeyFile,
          clientCertificateFile
        );
        if (tls) otlpGrpc.tls = tls;
        if (compression) otlpGrpc.compression = compression;
        if (timeout) otlpGrpc.timeout = timeout;
        if (headersList) otlpGrpc.headers_list = headersList;
        batchInfo.exporter = { otlp_grpc: otlpGrpc };
      } else {
        const otlpHttp: Record<string, unknown> = {};
        const endpoint =
          getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_ENDPOINT') ??
          (getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')
            ? `${getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')}/v1/logs`
            : 'http://localhost:4318/v1/logs');
        if (endpoint) otlpHttp.endpoint = endpoint;
        const tls = getHttpTlsConfig(
          certificateFile,
          clientKeyFile,
          clientCertificateFile
        );
        if (tls) otlpHttp.tls = tls;
        if (compression) otlpHttp.compression = compression;
        if (timeout) otlpHttp.timeout = timeout;
        if (headersList) otlpHttp.headers_list = headersList;
        if (protocol === 'http/json') otlpHttp.encoding = 'json';
        else if (protocol === 'http/protobuf') otlpHttp.encoding = 'protobuf';
        batchInfo.exporter = { otlp_http: otlpHttp };
      }
      config.logger_provider.processors!.push({ batch: batchInfo } as never);
    }
  }
}

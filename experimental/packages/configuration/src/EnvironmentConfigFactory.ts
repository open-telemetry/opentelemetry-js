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
  ConfigurationModel,
  initializeDefaultConfiguration,
} from './models/configModel';
import {
  getBooleanFromEnv,
  getStringFromEnv,
  getStringListFromEnv,
  diagLogLevelFromString,
  getNumberFromEnv,
} from '@opentelemetry/core';
import { ConfigFactory } from './IConfigFactory';
import {
  ExemplarFilter,
  ExporterDefaultHistogramAggregation,
  ExporterTemporalityPreference,
  initializeDefaultMeterProviderConfiguration,
  PeriodicMetricReader,
  PullMetricReader,
} from './models/meterProviderModel';
import { OtlpHttpEncoding } from './models/commonModel';
import { diag } from '@opentelemetry/api';
import {
  BatchSpanProcessor,
  initializeDefaultTracerProviderConfiguration,
} from './models/tracerProviderModel';
import {
  BatchLogRecordProcessor,
  initializeDefaultLoggerProviderConfiguration,
} from './models/loggerProviderModel';
import { getGrpcTlsConfig, getHttpTlsConfig } from './utils';

/**
 * EnvironmentConfigProvider provides a configuration based on environment variables.
 */
export class EnvironmentConfigFactory implements ConfigFactory {
  private _config: ConfigurationModel;

  constructor() {
    this._config = initializeDefaultConfiguration();
    this._config.disabled = getBooleanFromEnv('OTEL_SDK_DISABLED');

    const logLevel = diagLogLevelFromString(getStringFromEnv('OTEL_LOG_LEVEL'));
    if (logLevel) {
      this._config.log_level = logLevel;
    }

    const nodeResourceDetectors = getStringListFromEnv(
      'OTEL_NODE_RESOURCE_DETECTORS'
    );
    if (nodeResourceDetectors) {
      this._config.node_resource_detectors = nodeResourceDetectors;
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
    config.resource.attributes_list = resourceAttrList;
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
      config.propagator.composite.push({ [composite[i]]: null });
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
      config.tracer_provider.sampler = { always_on: {} };
      break;

    case 'always_off':
      config.tracer_provider.sampler = { always_off: {} };
      break;

    case 'traceidratio':
      config.tracer_provider.sampler = {
        trace_id_ratio_based: { ratio },
      };
      break;

    case 'parentbased_always_on':
      config.tracer_provider.sampler = {
        parent_based: { root: { always_on: {} } },
      };
      break;

    case 'parentbased_always_off':
      config.tracer_provider.sampler = {
        parent_based: { root: { always_off: {} } },
      };
      break;

    case 'parentbased_traceidratio':
      config.tracer_provider.sampler = {
        parent_based: { root: { trace_id_ratio_based: { ratio } } },
      };
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

  const batch: BatchSpanProcessor = { exporter: {} };
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
    const batchInfo = { ...batch };
    if (exporterType === 'console') {
      config.tracer_provider.processors.push({
        simple: { exporter: { console: {} } },
      });
    } else {
      // 'otlp' and default
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
        delete batchInfo.exporter.otlp_http;
        batchInfo.exporter.otlp_grpc = {};
        const endpoint =
          getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT') ??
          getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT') ??
          'http://localhost:4317';
        if (endpoint) {
          batchInfo.exporter.otlp_grpc.endpoint = endpoint;
        }
        const tls = getGrpcTlsConfig(
          certificateFile,
          clientKeyFile,
          clientCertificateFile
        );
        if (tls) {
          batchInfo.exporter.otlp_grpc.tls = tls;
        }
        if (compression) {
          batchInfo.exporter.otlp_grpc.compression = compression;
        }
        if (timeout) {
          batchInfo.exporter.otlp_grpc.timeout = timeout;
        }
        if (headersList) {
          batchInfo.exporter.otlp_grpc.headers_list = headersList;
        }
      } else {
        if (batchInfo.exporter.otlp_http == null) {
          batchInfo.exporter.otlp_http = {};
        }
        const endpoint =
          getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT') ??
          (getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')
            ? `${getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')}/v1/traces`
            : 'http://localhost:4318/v1/traces');
        if (endpoint) {
          batchInfo.exporter.otlp_http.endpoint = endpoint;
        }
        const tls = getHttpTlsConfig(
          certificateFile,
          clientKeyFile,
          clientCertificateFile
        );
        if (tls) {
          batchInfo.exporter.otlp_http.tls = tls;
        }
        if (compression) {
          batchInfo.exporter.otlp_http.compression = compression;
        }
        if (timeout) {
          batchInfo.exporter.otlp_http.timeout = timeout;
        }
        if (headersList) {
          batchInfo.exporter.otlp_http.headers_list = headersList;
        }
        if (protocol === 'http/json') {
          batchInfo.exporter.otlp_http.encoding = OtlpHttpEncoding.JSON;
        } else if (protocol === 'http/protobuf') {
          batchInfo.exporter.otlp_http.encoding = OtlpHttpEncoding.Protobuf;
        }
      }

      config.tracer_provider.processors.push({ batch: batchInfo });
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

  const readerPeriodic: PeriodicMetricReader = { exporter: {} };
  const interval = getNumberFromEnv('OTEL_METRIC_EXPORT_INTERVAL') ?? 60000;
  if (interval) {
    readerPeriodic.interval = interval;
  }
  for (let i = 0; i < exportersType.length; i++) {
    const exporterType = exportersType[i];
    if (exporterType === 'prometheus') {
      // Prometheus uses a pull reader
      const pullReader: PullMetricReader = {
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
      config.meter_provider.readers.push({ pull: pullReader });
      continue;
    }

    const readerPeriodicInfo = { ...readerPeriodic };
    const timeout = getNumberFromEnv('OTEL_METRIC_EXPORT_TIMEOUT') ?? 30000;
    if (timeout) {
      readerPeriodicInfo.timeout = timeout;
    }

    if (exporterType === 'console') {
      readerPeriodicInfo.exporter = { console: {} };
    } else {
      // 'otlp' and default
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
      const temporalityPreference =
        getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE') ??
        'cumulative';
      const defaultHistogramAggregation =
        getStringFromEnv(
          'OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION'
        ) ?? 'explicit_bucket_histogram';

      if (protocol === 'grpc') {
        delete readerPeriodicInfo.exporter.otlp_http;
        readerPeriodicInfo.exporter.otlp_grpc = {};
        const endpoint =
          getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_ENDPOINT') ??
          getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT') ??
          'http://localhost:4317';
        if (endpoint) {
          readerPeriodicInfo.exporter.otlp_grpc.endpoint = endpoint;
        }
        const tls = getGrpcTlsConfig(
          certificateFile,
          clientKeyFile,
          clientCertificateFile
        );
        if (tls) {
          readerPeriodicInfo.exporter.otlp_grpc.tls = tls;
        }
        if (compression) {
          readerPeriodicInfo.exporter.otlp_grpc.compression = compression;
        }
        if (timeoutExporter) {
          readerPeriodicInfo.exporter.otlp_grpc.timeout = timeoutExporter;
        }
        if (headersList) {
          readerPeriodicInfo.exporter.otlp_grpc.headers_list = headersList;
        }
        if (temporalityPreference) {
          switch (temporalityPreference) {
            case 'cumulative':
              readerPeriodicInfo.exporter.otlp_grpc.temporality_preference =
                ExporterTemporalityPreference.Cumulative;
              break;
            case 'delta':
              readerPeriodicInfo.exporter.otlp_grpc.temporality_preference =
                ExporterTemporalityPreference.Delta;
              break;
            case 'low_memory':
              readerPeriodicInfo.exporter.otlp_grpc.temporality_preference =
                ExporterTemporalityPreference.LowMemory;
              break;
            default:
              readerPeriodicInfo.exporter.otlp_grpc.temporality_preference =
                ExporterTemporalityPreference.Cumulative;
              break;
          }
        }
        if (defaultHistogramAggregation) {
          switch (defaultHistogramAggregation) {
            case 'explicit_bucket_histogram':
              readerPeriodicInfo.exporter.otlp_grpc.default_histogram_aggregation =
                ExporterDefaultHistogramAggregation.ExplicitBucketHistogram;
              break;
            case 'base2_exponential_bucket_histogram':
              readerPeriodicInfo.exporter.otlp_grpc.default_histogram_aggregation =
                ExporterDefaultHistogramAggregation.Base2ExponentialBucketHistogram;
              break;
            default:
              readerPeriodicInfo.exporter.otlp_grpc.default_histogram_aggregation =
                ExporterDefaultHistogramAggregation.ExplicitBucketHistogram;
              break;
          }
        }
      } else {
        if (readerPeriodicInfo.exporter.otlp_http == null) {
          readerPeriodicInfo.exporter.otlp_http = {};
        }
        const endpoint =
          getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_ENDPOINT') ??
          (getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')
            ? `${getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')}/v1/metrics`
            : 'http://localhost:4318/v1/metrics');
        if (endpoint) {
          readerPeriodicInfo.exporter.otlp_http.endpoint = endpoint;
        }
        const tls = getHttpTlsConfig(
          certificateFile,
          clientKeyFile,
          clientCertificateFile
        );
        if (tls) {
          readerPeriodicInfo.exporter.otlp_http.tls = tls;
        }
        if (compression) {
          readerPeriodicInfo.exporter.otlp_http.compression = compression;
        }
        if (timeoutExporter) {
          readerPeriodicInfo.exporter.otlp_http.timeout = timeoutExporter;
        }
        if (headersList) {
          readerPeriodicInfo.exporter.otlp_http.headers_list = headersList;
        }
        if (temporalityPreference) {
          switch (temporalityPreference) {
            case 'cumulative':
              readerPeriodicInfo.exporter.otlp_http.temporality_preference =
                ExporterTemporalityPreference.Cumulative;
              break;
            case 'delta':
              readerPeriodicInfo.exporter.otlp_http.temporality_preference =
                ExporterTemporalityPreference.Delta;
              break;
            case 'low_memory':
              readerPeriodicInfo.exporter.otlp_http.temporality_preference =
                ExporterTemporalityPreference.LowMemory;
              break;
            default:
              readerPeriodicInfo.exporter.otlp_http.temporality_preference =
                ExporterTemporalityPreference.Cumulative;
              break;
          }
        }
        if (defaultHistogramAggregation) {
          switch (defaultHistogramAggregation) {
            case 'explicit_bucket_histogram':
              readerPeriodicInfo.exporter.otlp_http.default_histogram_aggregation =
                ExporterDefaultHistogramAggregation.ExplicitBucketHistogram;
              break;
            case 'base2_exponential_bucket_histogram':
              readerPeriodicInfo.exporter.otlp_http.default_histogram_aggregation =
                ExporterDefaultHistogramAggregation.Base2ExponentialBucketHistogram;
              break;
            default:
              readerPeriodicInfo.exporter.otlp_http.default_histogram_aggregation =
                ExporterDefaultHistogramAggregation.ExplicitBucketHistogram;
              break;
          }
        }
        if (protocol === 'http/json') {
          readerPeriodicInfo.exporter.otlp_http.encoding =
            OtlpHttpEncoding.JSON;
        } else if (protocol === 'http/protobuf') {
          readerPeriodicInfo.exporter.otlp_http.encoding =
            OtlpHttpEncoding.Protobuf;
        }
      }
    }
    config.meter_provider.readers.push({ periodic: readerPeriodicInfo });
  }

  const exemplarFilter =
    getStringFromEnv('OTEL_METRICS_EXEMPLAR_FILTER') ?? 'trace_based';
  if (exemplarFilter) {
    switch (exemplarFilter) {
      case 'trace_based':
        config.meter_provider.exemplar_filter = ExemplarFilter.TraceBased;
        break;
      case 'always_on':
        config.meter_provider.exemplar_filter = ExemplarFilter.AlwaysOn;
        break;
      case 'always_off':
        config.meter_provider.exemplar_filter = ExemplarFilter.AlwaysOff;
        break;
      default:
        config.meter_provider.exemplar_filter = ExemplarFilter.TraceBased;
        break;
    }
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

  const batch: BatchLogRecordProcessor = { exporter: {} };
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
    const batchInfo = { ...batch };
    if (exporterType === 'console') {
      config.logger_provider.processors.push({
        simple: { exporter: { console: {} } },
      });
    } else {
      // 'otlp' and default
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
        delete batchInfo.exporter.otlp_http;
        batchInfo.exporter.otlp_grpc = {};
        const endpoint =
          getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_ENDPOINT') ??
          getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT') ??
          'http://localhost:4317';
        if (endpoint) {
          batchInfo.exporter.otlp_grpc.endpoint = endpoint;
        }
        const tls = getGrpcTlsConfig(
          certificateFile,
          clientKeyFile,
          clientCertificateFile
        );
        if (tls) {
          batchInfo.exporter.otlp_grpc.tls = tls;
        }
        if (compression) {
          batchInfo.exporter.otlp_grpc.compression = compression;
        }
        if (timeout) {
          batchInfo.exporter.otlp_grpc.timeout = timeout;
        }
        if (headersList) {
          batchInfo.exporter.otlp_grpc.headers_list = headersList;
        }
      } else {
        if (batchInfo.exporter.otlp_http == null) {
          batchInfo.exporter.otlp_http = {};
        }
        const endpoint =
          getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_ENDPOINT') ??
          (getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')
            ? `${getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')}/v1/logs`
            : 'http://localhost:4318/v1/logs');
        if (endpoint) {
          batchInfo.exporter.otlp_http.endpoint = endpoint;
        }
        const tls = getHttpTlsConfig(
          certificateFile,
          clientKeyFile,
          clientCertificateFile
        );
        if (tls) {
          batchInfo.exporter.otlp_http.tls = tls;
        }
        if (compression) {
          batchInfo.exporter.otlp_http.compression = compression;
        }
        if (timeout) {
          batchInfo.exporter.otlp_http.timeout = timeout;
        }
        if (headersList) {
          batchInfo.exporter.otlp_http.headers_list = headersList;
        }

        if (protocol === 'http/json') {
          batchInfo.exporter.otlp_http.encoding = OtlpHttpEncoding.JSON;
        } else if (protocol === 'http/protobuf') {
          batchInfo.exporter.otlp_http.encoding = OtlpHttpEncoding.Protobuf;
        }
      }
      config.logger_provider.processors.push({ batch: batchInfo });
    }
  }
}

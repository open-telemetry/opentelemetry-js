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
} from './models/meterProviderModel';
import { diag } from '@opentelemetry/api';

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
  if (list && list.length > 0) {
    config.resource.attributes_list = resourceAttrList;
    config.resource.attributes = [];
    for (let i = 0; i < list.length; i++) {
      const element = list[i].split('=');
      config.resource.attributes.push({
        name: element[0],
        value: element[1],
        type: 'string',
      });
    }
  }

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

export function setTracerProvider(config: ConfigurationModel): void {
  if (config.tracer_provider == null) {
    config.tracer_provider = { processors: [] };
  }
  if (config.tracer_provider.limits == null) {
    config.tracer_provider.limits = {};
  }
  const attributeValueLengthLimit = getNumberFromEnv(
    'OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT'
  );
  if (attributeValueLengthLimit) {
    config.tracer_provider.limits.attribute_value_length_limit =
      attributeValueLengthLimit;
  }

  const attributeCountLimit = getNumberFromEnv(
    'OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT'
  );
  if (attributeCountLimit) {
    config.tracer_provider.limits.attribute_count_limit = attributeCountLimit;
  }

  const eventCountLimit = getNumberFromEnv('OTEL_SPAN_EVENT_COUNT_LIMIT');
  if (eventCountLimit) {
    config.tracer_provider.limits.event_count_limit = eventCountLimit;
  }

  const linkCountLimit = getNumberFromEnv('OTEL_SPAN_LINK_COUNT_LIMIT');
  if (linkCountLimit) {
    config.tracer_provider.limits.link_count_limit = linkCountLimit;
  }

  const eventAttributeCountLimit = getNumberFromEnv(
    'OTEL_EVENT_ATTRIBUTE_COUNT_LIMIT'
  );
  if (eventAttributeCountLimit) {
    config.tracer_provider.limits.event_attribute_count_limit =
      eventAttributeCountLimit;
  }

  const linkAttributeCountLimit = getNumberFromEnv(
    'OTEL_LINK_ATTRIBUTE_COUNT_LIMIT'
  );
  if (linkAttributeCountLimit) {
    config.tracer_provider.limits.link_attribute_count_limit =
      linkAttributeCountLimit;
  }

  const batch = config.tracer_provider.processors[0]?.batch;
  if (batch) {
    const scheduleDelay = getNumberFromEnv('OTEL_BSP_SCHEDULE_DELAY');
    if (scheduleDelay) {
      batch.schedule_delay = scheduleDelay;
    }

    const exportTimeout = getNumberFromEnv('OTEL_BSP_EXPORT_TIMEOUT');
    if (exportTimeout) {
      batch.export_timeout = exportTimeout;
    }

    const maxQueueSize = getNumberFromEnv('OTEL_BSP_MAX_QUEUE_SIZE');
    if (maxQueueSize) {
      batch.max_queue_size = maxQueueSize;
    }

    const maxExportBatchSize = getNumberFromEnv(
      'OTEL_BSP_MAX_EXPORT_BATCH_SIZE'
    );
    if (maxExportBatchSize) {
      batch.max_export_batch_size = maxExportBatchSize;
    }

    const exportersType = Array.from(
      new Set(getStringListFromEnv('OTEL_TRACES_EXPORTER'))
    );
    if (exportersType.length === 0) {
      exportersType.push('otlp');
    }
    if (exportersType.length > 0) {
      config.tracer_provider.processors = [];
      if (exportersType.includes('none')) {
        diag.info(
          `OTEL_TRACES_EXPORTER contains "none". Tracer provider will not be initialized.`
        );
        return;
      }
      for (let i = 0; i < exportersType.length; i++) {
        const exporterType = exportersType[i];
        const batchInfo = { ...batch };
        if (exporterType === 'console') {
          config.tracer_provider.processors.push({
            simple: { exporter: { console: {} } },
          });
        } else if (exporterType === 'zipkin') {
          batchInfo.exporter = {
            zipkin: {
              endpoint:
                getStringFromEnv('OTEL_EXPORTER_ZIPKIN_ENDPOINT') ??
                'http://localhost:9411/api/v2/spans',
              timeout:
                getNumberFromEnv('OTEL_EXPORTER_ZIPKIN_TIMEOUT') ?? 10000,
            },
          };
          config.tracer_provider.processors.push({ batch: batchInfo });
        } else {
          // 'otlp' and default
          const endpoint =
            getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT') ??
            (getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')
              ? `${getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')}/v1/traces`
              : null);
          if (endpoint && batchInfo.exporter.otlp_http) {
            batchInfo.exporter.otlp_http.endpoint = endpoint;
          }

          const certificateFile =
            getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE') ??
            getStringFromEnv('OTEL_EXPORTER_OTLP_CERTIFICATE');
          if (certificateFile && batchInfo.exporter.otlp_http) {
            batchInfo.exporter.otlp_http.certificate_file = certificateFile;
          }

          const clientKeyFile =
            getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY') ??
            getStringFromEnv('OTEL_EXPORTER_OTLP_CLIENT_KEY');
          if (clientKeyFile && batchInfo.exporter.otlp_http) {
            batchInfo.exporter.otlp_http.client_key_file = clientKeyFile;
          }

          const clientCertificateFile =
            getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE') ??
            getStringFromEnv('OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE');
          if (clientCertificateFile && batchInfo.exporter.otlp_http) {
            batchInfo.exporter.otlp_http.client_certificate_file =
              clientCertificateFile;
          }

          const compression =
            getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_COMPRESSION') ??
            getStringFromEnv('OTEL_EXPORTER_OTLP_COMPRESSION');
          if (compression && batchInfo.exporter.otlp_http) {
            batchInfo.exporter.otlp_http.compression = compression;
          }

          const timeout =
            getNumberFromEnv('OTEL_EXPORTER_OTLP_TRACES_TIMEOUT') ??
            getNumberFromEnv('OTEL_EXPORTER_OTLP_TIMEOUT');
          if (timeout && batchInfo.exporter.otlp_http) {
            batchInfo.exporter.otlp_http.timeout = timeout;
          }

          const headersList =
            getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_HEADERS') ??
            getStringFromEnv('OTEL_EXPORTER_OTLP_HEADERS');
          if (headersList && batchInfo.exporter.otlp_http) {
            batchInfo.exporter.otlp_http.headers_list = headersList;
          }
          config.tracer_provider.processors.push({ batch: batchInfo });
        }
      }
    }
  }
}

export function setMeterProvider(config: ConfigurationModel): void {
  const readerPeriodic =
    config.meter_provider?.readers && config.meter_provider?.readers.length > 0
      ? config.meter_provider?.readers[0].periodic
      : undefined;
  if (config.meter_provider == null) {
    config.meter_provider = { readers: [{}] };
  }
  if (readerPeriodic) {
    const interval = getNumberFromEnv('OTEL_METRIC_EXPORT_INTERVAL');
    if (interval) {
      readerPeriodic.interval = interval;
    }

    const timeout = getNumberFromEnv('OTEL_METRIC_EXPORT_TIMEOUT');
    if (timeout) {
      readerPeriodic.timeout = timeout;
    }
    if (readerPeriodic.exporter.otlp_http == null) {
      readerPeriodic.exporter.otlp_http = {};
    }

    const endpoint =
      getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_ENDPOINT') ??
      (getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')
        ? `${getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')}/v1/metrics`
        : null);
    if (endpoint) {
      readerPeriodic.exporter.otlp_http.endpoint = endpoint;
    }

    const certificateFile =
      getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE') ??
      getStringFromEnv('OTEL_EXPORTER_OTLP_CERTIFICATE');
    if (certificateFile) {
      readerPeriodic.exporter.otlp_http.certificate_file = certificateFile;
    }

    const clientKeyFile =
      getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY') ??
      getStringFromEnv('OTEL_EXPORTER_OTLP_CLIENT_KEY');
    if (clientKeyFile) {
      readerPeriodic.exporter.otlp_http.client_key_file = clientKeyFile;
    }

    const clientCertificateFile =
      getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE') ??
      getStringFromEnv('OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE');
    if (clientCertificateFile) {
      readerPeriodic.exporter.otlp_http.client_certificate_file =
        clientCertificateFile;
    }

    const compression =
      getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_COMPRESSION') ??
      getStringFromEnv('OTEL_EXPORTER_OTLP_COMPRESSION');
    if (compression) {
      readerPeriodic.exporter.otlp_http.compression = compression;
    }

    const timeoutEx =
      getNumberFromEnv('OTEL_EXPORTER_OTLP_METRICS_TIMEOUT') ??
      getNumberFromEnv('OTEL_EXPORTER_OTLP_TIMEOUT');
    if (timeoutEx) {
      readerPeriodic.exporter.otlp_http.timeout = timeoutEx;
    }

    const headersList =
      getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_HEADERS') ??
      getStringFromEnv('OTEL_EXPORTER_OTLP_HEADERS');
    if (headersList) {
      readerPeriodic.exporter.otlp_http.headers_list = headersList;
    }

    const temporalityPreference = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE'
    );
    if (temporalityPreference) {
      switch (temporalityPreference) {
        case 'cumulative':
          readerPeriodic.exporter.otlp_http.temporality_preference =
            ExporterTemporalityPreference.Cumulative;
          break;
        case 'delta':
          readerPeriodic.exporter.otlp_http.temporality_preference =
            ExporterTemporalityPreference.Delta;
          break;
        case 'low_memory':
          readerPeriodic.exporter.otlp_http.temporality_preference =
            ExporterTemporalityPreference.LowMemory;
          break;
        default:
          readerPeriodic.exporter.otlp_http.temporality_preference =
            ExporterTemporalityPreference.Cumulative;
          break;
      }
    }

    const defaultHistogramAggregation = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION'
    );
    if (defaultHistogramAggregation) {
      switch (defaultHistogramAggregation) {
        case 'explicit_bucket_histogram':
          readerPeriodic.exporter.otlp_http.default_histogram_aggregation =
            ExporterDefaultHistogramAggregation.ExplicitBucketHistogram;
          break;
        case 'base2_exponential_bucket_histogram':
          readerPeriodic.exporter.otlp_http.default_histogram_aggregation =
            ExporterDefaultHistogramAggregation.Base2ExponentialBucketHistogram;
          break;
        default:
          readerPeriodic.exporter.otlp_http.default_histogram_aggregation =
            ExporterDefaultHistogramAggregation.ExplicitBucketHistogram;
          break;
      }
    }

    config.meter_provider.readers[0].periodic = readerPeriodic;
  }
  const exemplarFilter = getStringFromEnv('OTEL_METRICS_EXEMPLAR_FILTER');
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
  if (config.logger_provider == null) {
    config.logger_provider = { processors: [] };
  }
  const attributeValueLengthLimit = getNumberFromEnv(
    'OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT'
  );
  const attributeCountLimit = getNumberFromEnv(
    'OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT'
  );
  if (attributeValueLengthLimit || attributeCountLimit) {
    if (config.logger_provider.limits == null) {
      config.logger_provider.limits = { attribute_count_limit: 128 };
    }
    if (attributeValueLengthLimit) {
      config.logger_provider.limits.attribute_value_length_limit =
        attributeValueLengthLimit;
    }

    if (attributeCountLimit) {
      config.logger_provider.limits.attribute_count_limit = attributeCountLimit;
    }
  }

  const batch =
    config.logger_provider?.processors &&
    config.logger_provider?.processors.length > 0
      ? config.logger_provider?.processors[0].batch
      : undefined;
  if (batch) {
    const scheduleDelay = getNumberFromEnv('OTEL_BLRP_SCHEDULE_DELAY');
    if (scheduleDelay) {
      batch.schedule_delay = scheduleDelay;
    }

    const exportTimeout = getNumberFromEnv('OTEL_BLRP_EXPORT_TIMEOUT');
    if (exportTimeout) {
      batch.export_timeout = exportTimeout;
    }

    const maxQueueSize = getNumberFromEnv('OTEL_BLRP_MAX_QUEUE_SIZE');
    if (maxQueueSize) {
      batch.max_queue_size = maxQueueSize;
    }

    const maxExportBatchSize = getNumberFromEnv(
      'OTEL_BLRP_MAX_EXPORT_BATCH_SIZE'
    );
    if (maxExportBatchSize) {
      batch.max_export_batch_size = maxExportBatchSize;
    }

    const endpoint =
      getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_ENDPOINT') ??
      (getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')
        ? `${getStringFromEnv('OTEL_EXPORTER_OTLP_ENDPOINT')}/v1/logs`
        : null);
    if (endpoint && batch.exporter.otlp_http) {
      batch.exporter.otlp_http.endpoint = endpoint;
    }

    const certificateFile =
      getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE') ??
      getStringFromEnv('OTEL_EXPORTER_OTLP_CERTIFICATE');
    if (certificateFile && batch.exporter.otlp_http) {
      batch.exporter.otlp_http.certificate_file = certificateFile;
    }

    const clientKeyFile =
      getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY') ??
      getStringFromEnv('OTEL_EXPORTER_OTLP_CLIENT_KEY');
    if (clientKeyFile && batch.exporter.otlp_http) {
      batch.exporter.otlp_http.client_key_file = clientKeyFile;
    }

    const clientCertificateFile =
      getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE') ??
      getStringFromEnv('OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE');
    if (clientCertificateFile && batch.exporter.otlp_http) {
      batch.exporter.otlp_http.client_certificate_file = clientCertificateFile;
    }

    const compression =
      getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_COMPRESSION') ??
      getStringFromEnv('OTEL_EXPORTER_OTLP_COMPRESSION');
    if (compression && batch.exporter.otlp_http) {
      batch.exporter.otlp_http.compression = compression;
    }

    const timeout =
      getNumberFromEnv('OTEL_EXPORTER_OTLP_LOGS_TIMEOUT') ??
      getNumberFromEnv('OTEL_EXPORTER_OTLP_TIMEOUT');
    if (timeout && batch.exporter.otlp_http) {
      batch.exporter.otlp_http.timeout = timeout;
    }

    const headersList =
      getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_HEADERS') ??
      getStringFromEnv('OTEL_EXPORTER_OTLP_HEADERS');
    if (headersList && batch.exporter.otlp_http) {
      batch.exporter.otlp_http.headers_list = headersList;
    }

    config.logger_provider.processors[0].batch = batch;
  }
}

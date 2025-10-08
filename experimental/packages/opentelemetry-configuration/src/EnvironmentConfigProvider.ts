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
} from './configModel';
import {
  getBooleanFromEnv,
  getStringFromEnv,
  getStringListFromEnv,
  diagLogLevelFromString,
  getNumberFromEnv,
} from '@opentelemetry/core';
import { ConfigProvider } from './IConfigProvider';

/**
 * EnvironmentConfigProvider provides a configuration based on environment variables.
 */
export class EnvironmentConfigProvider implements ConfigProvider {
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

  getInstrumentationConfig(): ConfigurationModel {
    return this._config;
  }
}

function setResources(config: ConfigurationModel): void {
  const resourceAttrList = getStringFromEnv('OTEL_RESOURCE_ATTRIBUTES');
  if (resourceAttrList) {
    config.resource.attributes_list = resourceAttrList;
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

function setAttributeLimits(config: ConfigurationModel): void {
  const attributeValueLengthLimit = getNumberFromEnv(
    'OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT'
  );
  if (attributeValueLengthLimit) {
    config.attribute_limits.attribute_value_length_limit =
      attributeValueLengthLimit;
  }

  const attributeCountLimit = getNumberFromEnv('OTEL_ATTRIBUTE_COUNT_LIMIT');
  if (attributeCountLimit) {
    config.attribute_limits.attribute_count_limit = attributeCountLimit;
  }
}

function setPropagators(config: ConfigurationModel): void {
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

function setTracerProvider(config: ConfigurationModel): void {
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

    const endpoint = getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT');
    if (endpoint) {
      batch.exporter.otlp_http.endpoint = endpoint;
    }

    const certificateFile = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE'
    );
    if (certificateFile) {
      batch.exporter.otlp_http.certificate_file = certificateFile;
    }

    const clientKeyFile = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY'
    );
    if (clientKeyFile) {
      batch.exporter.otlp_http.client_key_file = clientKeyFile;
    }

    const clientCertificateFile = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE'
    );
    if (clientCertificateFile) {
      batch.exporter.otlp_http.client_certificate_file = clientCertificateFile;
    }

    const compression = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_TRACES_COMPRESSION'
    );
    if (compression) {
      batch.exporter.otlp_http.compression = compression;
    }

    const timeout = getNumberFromEnv('OTEL_EXPORTER_OTLP_TRACES_TIMEOUT');
    if (timeout) {
      batch.exporter.otlp_http.timeout = timeout;
    }

    const headersList = getStringFromEnv('OTEL_EXPORTER_OTLP_TRACES_HEADERS');
    if (headersList) {
      batch.exporter.otlp_http.headers_list = headersList;
    }

    config.tracer_provider.processors[0].batch = batch;
  }
}

function setMeterProvider(config: ConfigurationModel): void {
  const readerPeriodic = config.meter_provider.readers[0]?.periodic;
  if (readerPeriodic) {
    const interval = getNumberFromEnv('OTEL_METRIC_EXPORT_INTERVAL');
    if (interval) {
      readerPeriodic.interval = interval;
    }

    const timeout = getNumberFromEnv('OTEL_METRIC_EXPORT_TIMEOUT');
    if (timeout) {
      readerPeriodic.timeout = timeout;
    }

    const endpoint = getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_ENDPOINT');
    if (endpoint) {
      readerPeriodic.exporter.otlp_http.endpoint = endpoint;
    }

    const certificateFile = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE'
    );
    if (certificateFile) {
      readerPeriodic.exporter.otlp_http.certificate_file = certificateFile;
    }

    const clientKeyFile = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY'
    );
    if (clientKeyFile) {
      readerPeriodic.exporter.otlp_http.client_key_file = clientKeyFile;
    }

    const clientCertificateFile = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE'
    );
    if (clientCertificateFile) {
      readerPeriodic.exporter.otlp_http.client_certificate_file =
        clientCertificateFile;
    }

    const compression = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_METRICS_COMPRESSION'
    );
    if (compression) {
      readerPeriodic.exporter.otlp_http.compression = compression;
    }

    const timeoutEx = getNumberFromEnv('OTEL_EXPORTER_OTLP_METRICS_TIMEOUT');
    if (timeoutEx) {
      readerPeriodic.exporter.otlp_http.timeout = timeoutEx;
    }

    const headersList = getStringFromEnv('OTEL_EXPORTER_OTLP_METRICS_HEADERS');
    if (headersList) {
      readerPeriodic.exporter.otlp_http.headers_list = headersList;
    }

    const temporalityPreference = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE'
    );
    if (
      temporalityPreference &&
      (temporalityPreference === 'cumulative' ||
        temporalityPreference === 'delta' ||
        temporalityPreference === 'low_memory')
    ) {
      readerPeriodic.exporter.otlp_http.temporality_preference =
        temporalityPreference;
    }

    const defaultHistogramAggregation = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION'
    );
    if (
      defaultHistogramAggregation &&
      (defaultHistogramAggregation === 'explicit_bucket_histogram' ||
        defaultHistogramAggregation === 'base2_exponential_bucket_histogram')
    ) {
      readerPeriodic.exporter.otlp_http.default_histogram_aggregation =
        defaultHistogramAggregation;
    }

    config.meter_provider.readers[0].periodic = readerPeriodic;
  }
  const exemplarFilter = getStringFromEnv('OTEL_METRICS_EXEMPLAR_FILTER');
  if (
    exemplarFilter &&
    (exemplarFilter === 'trace_based' ||
      exemplarFilter === 'always_on' ||
      exemplarFilter === 'always_off')
  ) {
    config.meter_provider.exemplar_filter = exemplarFilter;
  }
}

function setLoggerProvider(config: ConfigurationModel): void {
  const attributeValueLengthLimit = getNumberFromEnv(
    'OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT'
  );
  if (attributeValueLengthLimit) {
    config.logger_provider.limits.attribute_value_length_limit =
      attributeValueLengthLimit;
  }

  const attributeCountLimit = getNumberFromEnv(
    'OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT'
  );
  if (attributeCountLimit) {
    config.logger_provider.limits.attribute_count_limit = attributeCountLimit;
  }

  const batch = config.logger_provider.processors[0]?.batch;
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

    const endpoint = getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_ENDPOINT');
    if (endpoint) {
      batch.exporter.otlp_http.endpoint = endpoint;
    }

    const certificateFile = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE'
    );
    if (certificateFile) {
      batch.exporter.otlp_http.certificate_file = certificateFile;
    }

    const clientKeyFile = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY'
    );
    if (clientKeyFile) {
      batch.exporter.otlp_http.client_key_file = clientKeyFile;
    }

    const clientCertificateFile = getStringFromEnv(
      'OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE'
    );
    if (clientCertificateFile) {
      batch.exporter.otlp_http.client_certificate_file = clientCertificateFile;
    }

    const compression = getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_COMPRESSION');
    if (compression) {
      batch.exporter.otlp_http.compression = compression;
    }

    const timeout = getNumberFromEnv('OTEL_EXPORTER_OTLP_LOGS_TIMEOUT');
    if (timeout) {
      batch.exporter.otlp_http.timeout = timeout;
    }

    const headersList = getStringFromEnv('OTEL_EXPORTER_OTLP_LOGS_HEADERS');
    if (headersList) {
      batch.exporter.otlp_http.headers_list = headersList;
    }

    config.logger_provider.processors[0].batch = batch;
  }
}

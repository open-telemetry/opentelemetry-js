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

import * as assert from 'assert';
import { Configuration } from '../src';
import { DiagLogLevel } from '@opentelemetry/api';
import { createConfigProvider } from '../src/ConfigProvider';

const defaultConfig: Configuration = {
  disable: false,
  log_level: DiagLogLevel.INFO,
  node_resource_detectors: ['all'],
  resource: {},
  attribute_limits: {
    attribute_count_limit: 128,
  },
  propagator: {
    composite: ['tracecontext', 'baggage'],
    composite_list: 'tracecontext,baggage',
  },
  tracer_provider: {
    processors: [
      {
        batch: {
          schedule_delay: 5000,
          export_timeout: 30000,
          max_queue_size: 2048,
          max_export_batch_size: 512,
          exporter: {
            otlp_http: {
              endpoint: 'http://localhost:4318/v1/traces',
              timeout: 10000,
            },
          },
        },
      },
    ],
    limits: {
      attribute_count_limit: 128,
      event_count_limit: 128,
      link_count_limit: 128,
      event_attribute_count_limit: 128,
      link_attribute_count_limit: 128,
    },
    sampler: {
      parent_based: {
        root: 'always_on',
        remote_parent_sampled: 'always_on',
        remote_parent_not_sampled: 'always_off',
        local_parent_sampled: 'always_on',
        local_parent_not_sampled: 'always_off',
      },
    },
  },
  meter_provider: {
    readers: [
      {
        periodic: {
          interval: 60000,
          timeout: 30000,
          exporter: {
            otlp_http: {
              endpoint: 'http://localhost:4318/v1/metrics',
              timeout: 10000,
              temporality_preference: 'cumulative',
              default_histogram_aggregation: 'explicit_bucket_histogram',
            },
          },
        },
      },
    ],
    exemplar_filter: 'trace_based',
  },
  logger_provider: {
    processors: [
      {
        batch: {
          schedule_delay: 1000,
          export_timeout: 30000,
          max_queue_size: 2048,
          max_export_batch_size: 512,
          exporter: {
            otlp_http: {
              endpoint: 'http://localhost:4318/v1/logs',
              timeout: 10000,
            },
          },
        },
      },
    ],
    limits: {
      attribute_count_limit: 128,
    },
  },
};

describe('ConfigProvider', function () {
  describe('get values from environment variables', function () {
    afterEach(function () {
      delete process.env.OTEL_SDK_DISABLED;
      delete process.env.OTEL_LOG_LEVEL;
      delete process.env.OTEL_NODE_RESOURCE_DETECTORS;
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
      delete process.env.OTEL_SERVICE_NAME;
      delete process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT;
      delete process.env.OTEL_ATTRIBUTE_COUNT_LIMIT;
      delete process.env.OTEL_PROPAGATORS;
      delete process.env.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT;
      delete process.env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT;
      delete process.env.OTEL_SPAN_EVENT_COUNT_LIMIT;
      delete process.env.OTEL_SPAN_LINK_COUNT_LIMIT;
      delete process.env.OTEL_EVENT_ATTRIBUTE_COUNT_LIMIT;
      delete process.env.OTEL_LINK_ATTRIBUTE_COUNT_LIMIT;
      delete process.env.OTEL_BSP_SCHEDULE_DELAY;
      delete process.env.OTEL_BSP_EXPORT_TIMEOUT;
      delete process.env.OTEL_BSP_MAX_QUEUE_SIZE;
      delete process.env.OTEL_BSP_MAX_EXPORT_BATCH_SIZE;
      delete process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
      delete process.env.OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE;
      delete process.env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY;
      delete process.env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE;
      delete process.env.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION;
      delete process.env.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT;
      delete process.env.OTEL_EXPORTER_OTLP_TRACES_HEADERS;
      delete process.env.OTEL_METRIC_EXPORT_INTERVAL;
      delete process.env.OTEL_METRIC_EXPORT_TIMEOUT;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS;
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE;
      delete process.env
        .OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION;
      delete process.env.OTEL_METRICS_EXEMPLAR_FILTER;
      delete process.env.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT;
      delete process.env.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT;
      delete process.env.OTEL_BLRP_SCHEDULE_DELAY;
      delete process.env.OTEL_BLRP_EXPORT_TIMEOUT;
      delete process.env.OTEL_BLRP_MAX_QUEUE_SIZE;
      delete process.env.OTEL_BLRP_MAX_EXPORT_BATCH_SIZE;
      delete process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;
      delete process.env.OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE;
      delete process.env.OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY;
      delete process.env.OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE;
      delete process.env.OTEL_EXPORTER_OTLP_LOGS_COMPRESSION;
      delete process.env.OTEL_EXPORTER_OTLP_LOGS_TIMEOUT;
      delete process.env.OTEL_EXPORTER_OTLP_LOGS_HEADERS;
    });

    it('should initialize config with default values', function () {
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        defaultConfig
      );
    });

    it('should return config with disable true', function () {
      process.env.OTEL_SDK_DISABLED = 'true';
      const expectedConfig: Configuration = {
        ...defaultConfig,
        disable: true,
      };
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });

    it('should return config with log level as debug', function () {
      process.env.OTEL_LOG_LEVEL = 'DEBUG';
      const expectedConfig: Configuration = {
        ...defaultConfig,
        log_level: DiagLogLevel.DEBUG,
      };
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });

    it('should return config with a list of options for node resource detectors', function () {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'env,host, serviceinstance';
      const expectedConfig: Configuration = {
        ...defaultConfig,
        node_resource_detectors: ['env', 'host', 'serviceinstance'],
      };
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });

    it('should return config with a resource attribute list', function () {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.namespace=my-namespace,service.version=1.0.0';
      const expectedConfig: Configuration = {
        ...defaultConfig,
        resource: {
          attributes_list:
            'service.namespace=my-namespace,service.version=1.0.0',
        },
      };
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });

    it('should return config with custom service name', function () {
      process.env.OTEL_SERVICE_NAME = 'my service name';
      const expectedConfig: Configuration = {
        ...defaultConfig,
        resource: {
          attributes: [
            {
              name: 'service.name',
              value: 'my service name',
              type: 'string',
            },
          ],
        },
      };
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });

    it('should return config with custom attribute_limits', function () {
      process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = '100';
      process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = '200';
      const expectedConfig: Configuration = {
        ...defaultConfig,
        attribute_limits: {
          attribute_value_length_limit: 100,
          attribute_count_limit: 200,
        },
      };
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });

    it('should return config with custom propagator', function () {
      process.env.OTEL_PROPAGATORS = 'tracecontext,jaeger';
      const expectedConfig: Configuration = {
        ...defaultConfig,
        propagator: {
          composite: ['tracecontext', 'jaeger'],
          composite_list: 'tracecontext,jaeger',
        },
      };
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });

    it('should return config with custom tracer_provider', function () {
      process.env.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT = '100';
      process.env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT = '200';
      process.env.OTEL_SPAN_EVENT_COUNT_LIMIT = '300';
      process.env.OTEL_SPAN_LINK_COUNT_LIMIT = '400';
      process.env.OTEL_EVENT_ATTRIBUTE_COUNT_LIMIT = '500';
      process.env.OTEL_LINK_ATTRIBUTE_COUNT_LIMIT = '600';
      process.env.OTEL_BSP_SCHEDULE_DELAY = '700';
      process.env.OTEL_BSP_EXPORT_TIMEOUT = '800';
      process.env.OTEL_BSP_MAX_QUEUE_SIZE = '900';
      process.env.OTEL_BSP_MAX_EXPORT_BATCH_SIZE = '1000';
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
        'http://test.com:4318/v1/traces';
      process.env.OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE =
        'certificate_file.txt';
      process.env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY =
        'certificate_key_value';
      process.env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE =
        'client_certificate_file.txt';
      process.env.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION = 'gzip';
      process.env.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT = '2000';
      process.env.OTEL_EXPORTER_OTLP_TRACES_HEADERS = 'host=localhost';
      const expectedConfig: Configuration = {
        ...defaultConfig,
        tracer_provider: {
          limits: {
            attribute_value_length_limit: 100,
            attribute_count_limit: 200,
            event_count_limit: 300,
            link_count_limit: 400,
            event_attribute_count_limit: 500,
            link_attribute_count_limit: 600,
          },
          processors: [
            {
              batch: {
                schedule_delay: 700,
                export_timeout: 800,
                max_queue_size: 900,
                max_export_batch_size: 1000,
                exporter: {
                  otlp_http: {
                    endpoint: 'http://test.com:4318/v1/traces',
                    certificate_file: 'certificate_file.txt',
                    client_key_file: 'certificate_key_value',
                    client_certificate_file: 'client_certificate_file.txt',
                    compression: 'gzip',
                    timeout: 2000,
                    headers_list: 'host=localhost',
                  },
                },
              },
            },
          ],
          sampler: {
            parent_based: {
              root: 'always_on',
              remote_parent_sampled: 'always_on',
              remote_parent_not_sampled: 'always_off',
              local_parent_sampled: 'always_on',
              local_parent_not_sampled: 'always_off',
            },
          },
        },
      };
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });

    it('should return config with custom meter_provider', function () {
      process.env.OTEL_METRIC_EXPORT_INTERVAL = '100';
      process.env.OTEL_METRIC_EXPORT_TIMEOUT = '200';
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT =
        'http://test.com:4318/v1/metrics';
      process.env.OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE =
        'certificate_file.txt';
      process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY =
        'certificate_key_value';
      process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE =
        'client_certificate_file.txt';
      process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION = 'gzip';
      process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '300';
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS = 'host=localhost';
      process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE = 'delta';
      process.env.OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION =
        'base2_exponential_bucket_histogram';
      process.env.OTEL_METRICS_EXEMPLAR_FILTER = 'always_on';
      const expectedConfig: Configuration = {
        ...defaultConfig,
        meter_provider: {
          readers: [
            {
              periodic: {
                interval: 100,
                timeout: 200,
                exporter: {
                  otlp_http: {
                    endpoint: 'http://test.com:4318/v1/metrics',
                    certificate_file: 'certificate_file.txt',
                    client_key_file: 'certificate_key_value',
                    client_certificate_file: 'client_certificate_file.txt',
                    compression: 'gzip',
                    timeout: 300,
                    headers_list: 'host=localhost',
                    temporality_preference: 'delta',
                    default_histogram_aggregation:
                      'base2_exponential_bucket_histogram',
                  },
                },
              },
            },
          ],
          exemplar_filter: 'always_on',
        },
      };
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });

    it('should return config with custom logger_provider', function () {
      process.env.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT = '100';
      process.env.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT = '200';
      process.env.OTEL_BLRP_SCHEDULE_DELAY = '300';
      process.env.OTEL_BLRP_EXPORT_TIMEOUT = '400';
      process.env.OTEL_BLRP_MAX_QUEUE_SIZE = '500';
      process.env.OTEL_BLRP_MAX_EXPORT_BATCH_SIZE = '600';
      process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT =
        'http://test.com:4318/v1/logs';
      process.env.OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE = 'certificate_file.txt';
      process.env.OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY = 'certificate_key_value';
      process.env.OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE =
        'client_certificate_file.txt';
      process.env.OTEL_EXPORTER_OTLP_LOGS_COMPRESSION = 'gzip';
      process.env.OTEL_EXPORTER_OTLP_LOGS_TIMEOUT = '700';
      process.env.OTEL_EXPORTER_OTLP_LOGS_HEADERS = 'host=localhost';
      const expectedConfig: Configuration = {
        ...defaultConfig,
        logger_provider: {
          limits: {
            attribute_value_length_limit: 100,
            attribute_count_limit: 200,
          },
          processors: [
            {
              batch: {
                schedule_delay: 300,
                export_timeout: 400,
                max_queue_size: 500,
                max_export_batch_size: 600,
                exporter: {
                  otlp_http: {
                    endpoint: 'http://test.com:4318/v1/logs',
                    certificate_file: 'certificate_file.txt',
                    client_key_file: 'certificate_key_value',
                    client_certificate_file: 'client_certificate_file.txt',
                    compression: 'gzip',
                    timeout: 700,
                    headers_list: 'host=localhost',
                  },
                },
              },
            },
          ],
        },
      };
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });
  });
});

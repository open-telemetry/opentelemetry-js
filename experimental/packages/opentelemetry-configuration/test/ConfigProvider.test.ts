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
  disabled: false,
  log_level: DiagLogLevel.INFO,
  node_resource_detectors: ['all'],
  resource: {},
  attribute_limits: {
    attribute_count_limit: 128,
  },
  propagator: {
    composite: [{ tracecontext: null }, { baggage: null }],
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
              encoding: 'protobuf',
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
              encoding: 'protobuf',
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

const configFromFile: Configuration = {
  disabled: false,
  log_level: DiagLogLevel.DEBUG,
  node_resource_detectors: ['all'],
  resource: {
    schema_url: 'https://opentelemetry.io/schemas/1.16.0',
    attributes_list: 'service.namespace=my-namespace,service.version=1.0.0',
    attributes: [
      {
        name: 'service.name',
        value: 'unknown_service',
        type: 'string',
      },
      {
        name: 'string_key',
        value: 'value',
        type: 'string',
      },
      {
        name: 'bool_key',
        value: true,
        type: 'bool',
      },
      {
        name: 'int_key',
        value: 1,
        type: 'int',
      },
      {
        name: 'double_key',
        value: 1.1,
        type: 'double',
      },
      {
        name: 'string_array_key',
        value: ['value1', 'value2'],
        type: 'string_array',
      },
      {
        name: 'bool_array_key',
        value: [true, false],
        type: 'bool_array',
      },
      {
        name: 'int_array_key',
        value: [1, 2],
        type: 'int_array',
      },
      {
        name: 'double_array_key',
        value: [1.1, 2.2],
        type: 'double_array',
      },
    ],
  },
  attribute_limits: {
    attribute_count_limit: 128,
    attribute_value_length_limit: 4096,
  },
  propagator: {
    composite: [
      { tracecontext: null },
      { baggage: null },
      { b3: null },
      { b3multi: null },
      { jaeger: null },
      { ottrace: null },
      { xray: null },
    ],
    composite_list: 'tracecontext,baggage,b3,b3multi,jaeger,ottrace,xray',
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
              certificate_file: '/app/cert.pem',
              client_key_file: '/app/cert.pem',
              client_certificate_file: '/app/cert.pem',
              headers: [{ name: 'api-key', value: '1234' }],
              headers_list: 'api-key=1234',
              compression: 'gzip',
              encoding: 'protobuf',
            },
          },
        },
      },
      {
        batch: {
          schedule_delay: 5000,
          export_timeout: 30000,
          max_queue_size: 2048,
          max_export_batch_size: 512,
          exporter: {
            otlp_grpc: {
              endpoint: 'http://localhost:4317',
              timeout: 10000,
              certificate_file: '/app/cert.pem',
              client_key_file: '/app/cert.pem',
              client_certificate_file: '/app/cert.pem',
              headers: [{ name: 'api-key', value: '1234' }],
              headers_list: 'api-key=1234',
              compression: 'gzip',
              insecure: false,
            },
          },
        },
      },
      {
        batch: {
          schedule_delay: 5000,
          export_timeout: 30000,
          max_queue_size: 2048,
          max_export_batch_size: 512,
          exporter: {
            'otlp_file/development': {
              output_stream: 'file:///var/log/traces.jsonl',
            },
          },
        },
      },
      {
        batch: {
          schedule_delay: 5000,
          export_timeout: 30000,
          max_queue_size: 2048,
          max_export_batch_size: 512,
          exporter: {
            'otlp_file/development': {
              output_stream: 'stdout',
            },
          },
        },
      },
      {
        batch: {
          schedule_delay: 5000,
          export_timeout: 30000,
          max_queue_size: 2048,
          max_export_batch_size: 512,
          exporter: {
            zipkin: {
              endpoint: 'http://localhost:9411/api/v2/spans',
              timeout: 10000,
            },
          },
        },
      },
      {
        simple: {
          exporter: {
            console: {},
          },
        },
      },
    ],

    limits: {
      attribute_count_limit: 128,
      attribute_value_length_limit: 4096,
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
          schedule_delay: 5000,
          export_timeout: 30000,
          max_queue_size: 2048,
          max_export_batch_size: 512,
          exporter: {
            otlp_http: {
              endpoint: 'http://localhost:4318/v1/logs',
              timeout: 10000,
              encoding: 'protobuf',
              certificate_file: '/app/cert.pem',
              client_key_file: '/app/cert.pem',
              client_certificate_file: '/app/cert.pem',
              headers: [{ name: 'api-key', value: '1234' }],
              headers_list: 'api-key=1234',
              compression: 'gzip',
            },
          },
        },
      },
      {
        batch: {
          schedule_delay: 1000,
          export_timeout: 30000,
          max_queue_size: 2048,
          max_export_batch_size: 512,
          exporter: {
            otlp_grpc: {
              endpoint: 'http://localhost:4317',
              timeout: 10000,
              certificate_file: '/app/cert.pem',
              client_key_file: '/app/cert.pem',
              client_certificate_file: '/app/cert.pem',
              headers: [{ name: 'api-key', value: '1234' }],
              headers_list: 'api-key=1234',
              compression: 'gzip',
              insecure: false,
            },
          },
        },
      },
      {
        batch: {
          schedule_delay: 1000,
          export_timeout: 30000,
          max_queue_size: 2048,
          max_export_batch_size: 512,
          exporter: {
            'otlp_file/development': {
              output_stream: 'file:///var/log/logs.jsonl',
            },
          },
        },
      },
      {
        batch: {
          schedule_delay: 1000,
          export_timeout: 30000,
          max_queue_size: 2048,
          max_export_batch_size: 512,
          exporter: {
            'otlp_file/development': {
              output_stream: 'stdout',
            },
          },
        },
      },
      {
        simple: {
          exporter: {
            console: {},
          },
        },
      },
    ],
    limits: {
      attribute_count_limit: 128,
      attribute_value_length_limit: 4096,
    },
    'logger_configurator/development': {
      default_config: {
        disabled: true,
      },
      loggers: [
        {
          name: 'io.opentelemetry.contrib.*',
          config: {
            disabled: false,
          },
        },
      ],
    },
  },
};

const defaultConfigFromFileWithEnvVariables: Configuration = {
  disabled: false,
  log_level: DiagLogLevel.INFO,
  node_resource_detectors: ['all'],
  resource: {
    attributes: [
      {
        name: 'service.name',
        value: 'unknown_service',
        type: 'string',
      },
    ],
  },
  attribute_limits: {
    attribute_count_limit: 128,
  },
  propagator: {
    composite: [{ tracecontext: null }, { baggage: null }],
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
              encoding: 'protobuf',
              compression: 'gzip',
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
              encoding: 'protobuf',
              compression: 'gzip',
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
        disabled: true,
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
          composite: [{ tracecontext: null }, { jaeger: null }],
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
                    encoding: 'protobuf',
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
                    encoding: 'protobuf',
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

  describe('get values from config file', function () {
    afterEach(function () {
      delete process.env.OTEL_EXPERIMENTAL_CONFIG_FILE;
      delete process.env.OTEL_NODE_RESOURCE_DETECTORS;
      delete process.env.OTEL_SDK_DISABLED;
      delete process.env.OTEL_LOG_LEVEL;
      delete process.env.OTEL_SERVICE_NAME;
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
      delete process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT;
      delete process.env.OTEL_ATTRIBUTE_COUNT_LIMIT;
      delete process.env.OTEL_PROPAGATORS;
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
      delete process.env.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT;
      delete process.env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT;
      delete process.env.OTEL_SPAN_EVENT_COUNT_LIMIT;
      delete process.env.OTEL_SPAN_LINK_COUNT_LIMIT;
      delete process.env.OTEL_EVENT_ATTRIBUTE_COUNT_LIMIT;
      delete process.env.OTEL_LINK_ATTRIBUTE_COUNT_LIMIT;
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
      delete process.env.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT;
      delete process.env.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT;
    });

    it('should initialize config with default values from valid config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/kitchen-sink.yaml';
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        configFromFile
      );
    });

    it('should return error from invalid config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = './fixtures/kitchen-sink.txt';
      assert.throws(() => {
        createConfigProvider();
      });
    });

    it('should return error from invalid config file format', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = 'test/fixtures/invalid.yaml';
      assert.throws(() => {
        createConfigProvider();
      });
    });

    it('should initialize config with default values with empty string for config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = '';
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        defaultConfig
      );
    });

    it('should initialize config with default values with all whitespace for config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = '  ';
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        defaultConfig
      );
    });

    it('should initialize config with default values from valid short config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/short-config.yml';
      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        defaultConfig
      );
    });

    it('should initialize config with config file that contains environment variables', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/sdk-migration-config.yaml';
      process.env.OTEL_SDK_DISABLED = 'false';
      process.env.OTEL_LOG_LEVEL = 'debug';
      process.env.OTEL_SERVICE_NAME = 'custom-name';
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'attributes';
      process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = '23';
      process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = '7';
      process.env.OTEL_PROPAGATORS = 'prop';
      process.env.OTEL_BSP_SCHEDULE_DELAY = '123';
      process.env.OTEL_BSP_EXPORT_TIMEOUT = '456';
      process.env.OTEL_BSP_MAX_QUEUE_SIZE = '789';
      process.env.OTEL_BSP_MAX_EXPORT_BATCH_SIZE = '1011';
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
        'http://test.com:4318/v1/traces';
      process.env.OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE = 'trace-certificate';
      process.env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY = 'trace-client-key';
      process.env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE =
        'trace-client-certificate';
      process.env.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION = 'trace-compression';
      process.env.OTEL_EXPORTER_OTLP_TRACES_TIMEOUT = '1213';
      process.env.OTEL_EXPORTER_OTLP_TRACES_HEADERS = 'trace-headers';
      process.env.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT = '14';
      process.env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT = '15';
      process.env.OTEL_SPAN_EVENT_COUNT_LIMIT = '16';
      process.env.OTEL_SPAN_LINK_COUNT_LIMIT = '17';
      process.env.OTEL_EVENT_ATTRIBUTE_COUNT_LIMIT = '18';
      process.env.OTEL_LINK_ATTRIBUTE_COUNT_LIMIT = '19';
      process.env.OTEL_METRIC_EXPORT_INTERVAL = '20';
      process.env.OTEL_METRIC_EXPORT_TIMEOUT = '21';
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'metric-endpoint';
      process.env.OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE = 'metric-certificate';
      process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY = 'metric-client-key';
      process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE =
        'metric-client-certificate';
      process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION = 'metric-compression';
      process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '22';
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS = 'metric-header';
      process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE =
        'metric-temporality';
      process.env.OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION =
        'metric-hist-agg';
      process.env.OTEL_METRICS_EXEMPLAR_FILTER = 'always_off';
      process.env.OTEL_BLRP_SCHEDULE_DELAY = '23';
      process.env.OTEL_BLRP_EXPORT_TIMEOUT = '24';
      process.env.OTEL_BLRP_MAX_QUEUE_SIZE = '25';
      process.env.OTEL_BLRP_MAX_EXPORT_BATCH_SIZE = '26';
      process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT =
        'http://test.com:4318/v1/logs';
      process.env.OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE = 'logs-certificate';
      process.env.OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY = 'logs-client-key';
      process.env.OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE =
        'logs-client-certificate';
      process.env.OTEL_EXPORTER_OTLP_LOGS_COMPRESSION = 'logs-compression';
      process.env.OTEL_EXPORTER_OTLP_LOGS_TIMEOUT = '27';
      process.env.OTEL_EXPORTER_OTLP_LOGS_HEADERS = 'logs-header';
      process.env.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT = '28';
      process.env.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT = '29';
      const configProvider = createConfigProvider();
      const expectedConfig: Configuration = {
        ...defaultConfigFromFileWithEnvVariables,
        resource: {
          attributes_list: 'attributes',
          attributes: [
            {
              name: 'service.name',
              value: 'custom-name',
              type: 'string',
            },
          ],
        },
        attribute_limits: {
          attribute_count_limit: 7,
          attribute_value_length_limit: 23,
        },
        propagator: {
          composite: [{ prop: null }],
          composite_list: 'prop',
        },
        tracer_provider: {
          ...defaultConfigFromFileWithEnvVariables.tracer_provider,
          limits: {
            attribute_value_length_limit: 14,
            attribute_count_limit: 15,
            event_count_limit: 16,
            link_count_limit: 17,
            event_attribute_count_limit: 18,
            link_attribute_count_limit: 19,
          },
          processors: [
            {
              batch: {
                export_timeout: 456,
                max_export_batch_size: 1011,
                max_queue_size: 789,
                schedule_delay: 123,
                exporter: {
                  otlp_http: {
                    certificate_file: 'trace-certificate',
                    client_certificate_file: 'trace-client-certificate',
                    client_key_file: 'trace-client-key',
                    compression: 'trace-compression',
                    encoding: 'protobuf',
                    endpoint: 'http://test.com:4318/v1/traces',
                    headers_list: 'trace-headers',
                    timeout: 1213,
                  },
                },
              },
            },
          ],
        },
        meter_provider: {
          ...defaultConfigFromFileWithEnvVariables.meter_provider,
          exemplar_filter: 'always_off',
        },
        logger_provider: {
          ...defaultConfigFromFileWithEnvVariables.logger_provider,
          limits: {
            attribute_value_length_limit: 28,
            attribute_count_limit: 29,
          },
          processors: [
            {
              batch: {
                export_timeout: 24,
                max_export_batch_size: 26,
                max_queue_size: 25,
                schedule_delay: 23,
                exporter: {
                  otlp_http: {
                    certificate_file: 'logs-certificate',
                    client_certificate_file: 'logs-client-certificate',
                    client_key_file: 'logs-client-key',
                    compression: 'logs-compression',
                    encoding: 'protobuf',
                    endpoint: 'http://test.com:4318/v1/logs',
                    headers_list: 'logs-header',
                    timeout: 27,
                  },
                },
              },
            },
          ],
        },
      };

      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        expectedConfig
      );
    });

    it('should initialize config with fallbacks defined in config file when corresponding environment variables are not defined', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/sdk-migration-config.yaml';

      const configProvider = createConfigProvider();
      assert.deepStrictEqual(
        configProvider.getInstrumentationConfig(),
        defaultConfigFromFileWithEnvVariables
      );
    });
  });
});

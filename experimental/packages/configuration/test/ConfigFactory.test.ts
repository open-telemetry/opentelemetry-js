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
import { ConfigurationModel } from '../src';
import { DiagLogLevel } from '@opentelemetry/api';
import { createConfigFactory } from '../src/ConfigFactory';
import { OtlpHttpEncoding } from '../src/models/commonModel';
import {
  ExemplarFilter,
  ExporterDefaultHistogramAggregation,
  ExporterTemporalityPreference,
  InstrumentType,
} from '../src/models/meterProviderModel';
import {
  setAttributeLimits,
  setLoggerProvider,
  setMeterProvider,
  setPropagators,
  setResources,
  setTracerProvider,
} from '../src/EnvironmentConfigFactory';
import {
  parseConfigFile,
  setResourceAttributes,
  setAttributeLimits as setFileAttributeLimits,
  setPropagator,
  setTracerProvider as setFileTracerProvider,
  setLoggerProvider as setFileLoggerProvider,
  setMeterProvider as setFileMeterProvider,
  getTemporalityPreference,
} from '../src/FileConfigFactory';

const defaultConfig: ConfigurationModel = {
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
              encoding: OtlpHttpEncoding.Protobuf,
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
        root: { always_on: undefined },
        remote_parent_sampled: { always_on: undefined },
        remote_parent_not_sampled: { always_off: undefined },
        local_parent_sampled: { always_on: undefined },
        local_parent_not_sampled: { always_off: undefined },
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
              temporality_preference: ExporterTemporalityPreference.Cumulative,
              default_histogram_aggregation:
                ExporterDefaultHistogramAggregation.ExplicitBucketHistogram,
              encoding: OtlpHttpEncoding.Protobuf,
            },
          },
        },
      },
    ],
    exemplar_filter: ExemplarFilter.TraceBased,
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
              encoding: OtlpHttpEncoding.Protobuf,
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

const configFromFile: ConfigurationModel = {
  disabled: false,
  log_level: DiagLogLevel.INFO,
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
              encoding: OtlpHttpEncoding.Protobuf,
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
            console: undefined,
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
        root: { always_on: undefined },
        remote_parent_sampled: { always_on: undefined },
        remote_parent_not_sampled: { always_off: undefined },
        local_parent_sampled: { always_on: undefined },
        local_parent_not_sampled: { always_off: undefined },
      },
    },
  },
  meter_provider: {
    readers: [
      {
        pull: {
          exporter: {
            'prometheus/development': {
              host: 'localhost',
              port: 9464,
              without_scope_info: false,
              with_resource_constant_labels: {
                included: ['service*'],
                excluded: ['service.attr1'],
              },
            },
          },
          producers: [
            {
              opencensus: undefined,
            },
          ],
          cardinality_limits: {
            default: 2000,
            counter: 2000,
            gauge: 2000,
            histogram: 2000,
            observable_counter: 2000,
            observable_gauge: 2000,
            observable_up_down_counter: 2000,
            up_down_counter: 2000,
          },
        },
      },
      {
        periodic: {
          interval: 60000,
          timeout: 30000,
          exporter: {
            otlp_http: {
              endpoint: 'http://localhost:4318/v1/metrics',
              certificate_file: '/app/cert.pem',
              client_key_file: '/app/cert.pem',
              client_certificate_file: '/app/cert.pem',
              headers: [
                {
                  name: 'api-key',
                  value: '1234',
                },
              ],
              headers_list: 'api-key=1234',
              compression: 'gzip',
              timeout: 10000,
              encoding: OtlpHttpEncoding.Protobuf,
              temporality_preference: ExporterTemporalityPreference.Delta,
              default_histogram_aggregation:
                ExporterDefaultHistogramAggregation.Base2ExponentialBucketHistogram,
            },
          },
          producers: [
            {
              prometheus: undefined,
            },
          ],
          cardinality_limits: {
            default: 2000,
            counter: 2000,
            gauge: 2000,
            histogram: 2000,
            observable_counter: 2000,
            observable_gauge: 2000,
            observable_up_down_counter: 2000,
            up_down_counter: 2000,
          },
        },
      },
      {
        periodic: {
          interval: 60000,
          timeout: 30000,
          exporter: {
            otlp_grpc: {
              endpoint: 'http://localhost:4317',
              certificate_file: '/app/cert.pem',
              client_key_file: '/app/cert.pem',
              client_certificate_file: '/app/cert.pem',
              headers: [
                {
                  name: 'api-key',
                  value: '1234',
                },
              ],
              headers_list: 'api-key=1234',
              compression: 'gzip',
              timeout: 10000,
              insecure: false,
              temporality_preference: ExporterTemporalityPreference.Delta,
              default_histogram_aggregation:
                ExporterDefaultHistogramAggregation.Base2ExponentialBucketHistogram,
            },
          },
          cardinality_limits: {
            default: 2000,
            counter: 2000,
            gauge: 2000,
            histogram: 2000,
            observable_counter: 2000,
            observable_gauge: 2000,
            observable_up_down_counter: 2000,
            up_down_counter: 2000,
          },
        },
      },
      {
        periodic: {
          timeout: 30000,
          interval: 60000,
          exporter: {
            'otlp_file/development': {
              output_stream: 'file:///var/log/metrics.jsonl',
              temporality_preference: ExporterTemporalityPreference.Delta,
              default_histogram_aggregation:
                ExporterDefaultHistogramAggregation.Base2ExponentialBucketHistogram,
            },
          },
          cardinality_limits: {
            default: 2000,
            counter: 2000,
            gauge: 2000,
            histogram: 2000,
            observable_counter: 2000,
            observable_gauge: 2000,
            observable_up_down_counter: 2000,
            up_down_counter: 2000,
          },
        },
      },
      {
        periodic: {
          timeout: 30000,
          interval: 60000,
          exporter: {
            'otlp_file/development': {
              output_stream: 'stdout',
              temporality_preference: ExporterTemporalityPreference.Delta,
              default_histogram_aggregation:
                ExporterDefaultHistogramAggregation.Base2ExponentialBucketHistogram,
            },
          },
          cardinality_limits: {
            default: 2000,
            counter: 2000,
            gauge: 2000,
            histogram: 2000,
            observable_counter: 2000,
            observable_gauge: 2000,
            observable_up_down_counter: 2000,
            up_down_counter: 2000,
          },
        },
      },
      {
        periodic: {
          timeout: 30000,
          interval: 60000,
          exporter: {
            console: undefined,
          },
          cardinality_limits: {
            default: 2000,
            counter: 2000,
            gauge: 2000,
            histogram: 2000,
            observable_counter: 2000,
            observable_gauge: 2000,
            observable_up_down_counter: 2000,
            up_down_counter: 2000,
          },
        },
      },
    ],
    exemplar_filter: ExemplarFilter.TraceBased,
    views: [
      {
        selector: {
          instrument_name: 'my-instrument',
          instrument_type: InstrumentType.Histogram,
          unit: 'ms',
          meter_name: 'my-meter',
          meter_version: '1.0.0',
          meter_schema_url: 'https://opentelemetry.io/schemas/1.16.0',
        },
        stream: {
          name: 'new_instrument_name',
          description: 'new_description',
          aggregation: {
            explicit_bucket_histogram: {
              boundaries: [
                0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                7500, 10000,
              ],
              record_min_max: true,
            },
          },
          aggregation_cardinality_limit: 2000,
          attribute_keys: {
            included: ['key1', 'key2'],
            excluded: ['key3'],
          },
        },
      },
    ],
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
              encoding: OtlpHttpEncoding.Protobuf,
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
            console: undefined,
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

const defaultConfigFromFileWithEnvVariables: ConfigurationModel = {
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
              encoding: OtlpHttpEncoding.Protobuf,
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
        root: { always_on: undefined },
        remote_parent_sampled: { always_on: undefined },
        remote_parent_not_sampled: { always_off: undefined },
        local_parent_sampled: { always_on: undefined },
        local_parent_not_sampled: { always_off: undefined },
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
              encoding: OtlpHttpEncoding.Protobuf,
              compression: 'gzip',
              timeout: 10000,
              temporality_preference: ExporterTemporalityPreference.Cumulative,
              default_histogram_aggregation:
                ExporterDefaultHistogramAggregation.ExplicitBucketHistogram,
            },
          },
          cardinality_limits: {
            default: 2000,
            counter: 2000,
            gauge: 2000,
            histogram: 2000,
            observable_counter: 2000,
            observable_gauge: 2000,
            observable_up_down_counter: 2000,
            up_down_counter: 2000,
          },
        },
      },
    ],
    exemplar_filter: ExemplarFilter.TraceBased,
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
              encoding: OtlpHttpEncoding.Protobuf,
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

describe('ConfigFactory', function () {
  const _origEnvVariables = { ...process.env };

  afterEach(function () {
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }

    for (const [key, value] of Object.entries(_origEnvVariables)) {
      process.env[key] = value;
    }
  });

  describe('get values from environment variables', function () {
    it('should initialize config with default values', function () {
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), defaultConfig);
    });

    it('should return config with disable true', function () {
      process.env.OTEL_SDK_DISABLED = 'true';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        disabled: true,
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with log level as debug', function () {
      process.env.OTEL_LOG_LEVEL = 'DEBUG';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        log_level: DiagLogLevel.DEBUG,
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with a list of options for node resource detectors', function () {
      process.env.OTEL_NODE_RESOURCE_DETECTORS = 'env,host, serviceinstance';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        node_resource_detectors: ['env', 'host', 'serviceinstance'],
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with a resource attribute list', function () {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.namespace=my-namespace,service.version=1.0.0';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        resource: {
          attributes_list:
            'service.namespace=my-namespace,service.version=1.0.0',
          attributes: [
            {
              name: 'service.namespace',
              value: 'my-namespace',
              type: 'string',
            },
            {
              name: 'service.version',
              value: '1.0.0',
              type: 'string',
            },
          ],
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with custom service name', function () {
      process.env.OTEL_SERVICE_NAME = 'my service name';
      const expectedConfig: ConfigurationModel = {
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
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with custom attribute_limits', function () {
      process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = '100';
      process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = '200';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        attribute_limits: {
          attribute_value_length_limit: 100,
          attribute_count_limit: 200,
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with custom propagator', function () {
      process.env.OTEL_PROPAGATORS = 'tracecontext,jaeger';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        propagator: {
          composite: [{ tracecontext: null }, { jaeger: null }],
          composite_list: 'tracecontext,jaeger',
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
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
      const expectedConfig: ConfigurationModel = {
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
                    encoding: OtlpHttpEncoding.Protobuf,
                  },
                },
              },
            },
          ],
          sampler: {
            parent_based: {
              root: { always_on: undefined },
              remote_parent_sampled: { always_on: undefined },
              remote_parent_not_sampled: { always_off: undefined },
              local_parent_sampled: { always_on: undefined },
              local_parent_not_sampled: { always_off: undefined },
            },
          },
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
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
      const expectedConfig: ConfigurationModel = {
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
                    temporality_preference: ExporterTemporalityPreference.Delta,
                    default_histogram_aggregation:
                      ExporterDefaultHistogramAggregation.Base2ExponentialBucketHistogram,
                    encoding: OtlpHttpEncoding.Protobuf,
                  },
                },
              },
            },
          ],
          exemplar_filter: ExemplarFilter.AlwaysOn,
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with meter_provider with console exporter', function () {
      process.env.OTEL_METRICS_EXPORTER = 'console';

      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        meter_provider: {
          readers: [
            {
              periodic: {
                interval: 60000,
                timeout: 30000,
                exporter: {
                  console: {},
                },
              },
            },
          ],
          exemplar_filter: ExemplarFilter.TraceBased,
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with meter_provider with no exporter', function () {
      process.env.OTEL_METRICS_EXPORTER = 'none,console';

      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        meter_provider: {
          readers: [],
          exemplar_filter: ExemplarFilter.TraceBased,
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with meter_provider with list of exporters', function () {
      process.env.OTEL_METRICS_EXPORTER = 'otlp,console';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        meter_provider: {
          readers: [
            {
              periodic: {
                interval: 60000,
                timeout: 30000,
                exporter: {
                  otlp_http: {
                    default_histogram_aggregation:
                      ExporterDefaultHistogramAggregation.ExplicitBucketHistogram,
                    temporality_preference:
                      ExporterTemporalityPreference.Cumulative,
                    endpoint: 'http://localhost:4318/v1/metrics',
                    timeout: 10000,
                    encoding: OtlpHttpEncoding.Protobuf,
                  },
                },
              },
            },
            {
              periodic: {
                interval: 60000,
                timeout: 30000,
                exporter: {
                  console: {},
                },
              },
            },
          ],
          exemplar_filter: ExemplarFilter.TraceBased,
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with meter_provider with otlp grpc exporter', function () {
      process.env.OTEL_METRICS_EXPORTER = 'otlp';
      process.env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'grpc';
      process.env.OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE = 'metric-cert.pem';
      process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY = 'metric-key.pem';
      process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE =
        'metric-client-cert.pem';
      process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION = 'gzip';
      process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS = 'host=localhost';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        meter_provider: {
          readers: [
            {
              periodic: {
                interval: 60000,
                timeout: 30000,
                exporter: {
                  otlp_grpc: {
                    default_histogram_aggregation:
                      ExporterDefaultHistogramAggregation.ExplicitBucketHistogram,
                    temporality_preference:
                      ExporterTemporalityPreference.Cumulative,
                    endpoint: 'http://localhost:4317',
                    timeout: 10000,
                    certificate_file: 'metric-cert.pem',
                    client_key_file: 'metric-key.pem',
                    client_certificate_file: 'metric-client-cert.pem',
                    compression: 'gzip',
                    headers_list: 'host=localhost',
                  },
                },
              },
            },
          ],
          exemplar_filter: ExemplarFilter.TraceBased,
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with meter_provider with otlp grpc exporter, delta temporality and base2 aggr', function () {
      process.env.OTEL_METRICS_EXPORTER = 'otlp';
      process.env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'grpc';
      process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE = 'delta';
      process.env.OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION =
        'base2_exponential_bucket_histogram';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        meter_provider: {
          readers: [
            {
              periodic: {
                interval: 60000,
                timeout: 30000,
                exporter: {
                  otlp_grpc: {
                    default_histogram_aggregation:
                      ExporterDefaultHistogramAggregation.Base2ExponentialBucketHistogram,
                    temporality_preference: ExporterTemporalityPreference.Delta,
                    endpoint: 'http://localhost:4317',
                    timeout: 10000,
                  },
                },
              },
            },
          ],
          exemplar_filter: ExemplarFilter.TraceBased,
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with meter_provider with otlp grpc exporter and low memory temporality', function () {
      process.env.OTEL_METRICS_EXPORTER = 'otlp';
      process.env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'grpc';
      process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE =
        'low_memory';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        meter_provider: {
          readers: [
            {
              periodic: {
                interval: 60000,
                timeout: 30000,
                exporter: {
                  otlp_grpc: {
                    default_histogram_aggregation:
                      ExporterDefaultHistogramAggregation.ExplicitBucketHistogram,
                    temporality_preference:
                      ExporterTemporalityPreference.LowMemory,
                    endpoint: 'http://localhost:4317',
                    timeout: 10000,
                  },
                },
              },
            },
          ],
          exemplar_filter: ExemplarFilter.TraceBased,
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with meter_provider with otlp grpc exporter, invalid temporality and invalid aggr', function () {
      process.env.OTEL_METRICS_EXPORTER = 'otlp';
      process.env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'grpc';
      process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE = 'invalid';
      process.env.OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION =
        'invalid';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        meter_provider: {
          readers: [
            {
              periodic: {
                interval: 60000,
                timeout: 30000,
                exporter: {
                  otlp_grpc: {
                    default_histogram_aggregation:
                      ExporterDefaultHistogramAggregation.ExplicitBucketHistogram,
                    temporality_preference:
                      ExporterTemporalityPreference.Cumulative,
                    endpoint: 'http://localhost:4317',
                    timeout: 10000,
                  },
                },
              },
            },
          ],
          exemplar_filter: ExemplarFilter.TraceBased,
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with meter_provider with otlp http/json exporter', function () {
      process.env.OTEL_METRICS_EXPORTER = 'otlp';
      process.env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'http/json';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        meter_provider: {
          readers: [
            {
              periodic: {
                interval: 60000,
                timeout: 30000,
                exporter: {
                  otlp_http: {
                    default_histogram_aggregation:
                      ExporterDefaultHistogramAggregation.ExplicitBucketHistogram,
                    temporality_preference:
                      ExporterTemporalityPreference.Cumulative,
                    endpoint: 'http://localhost:4318/v1/metrics',
                    timeout: 10000,
                    encoding: OtlpHttpEncoding.JSON,
                  },
                },
              },
            },
          ],
          exemplar_filter: ExemplarFilter.TraceBased,
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
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
      const expectedConfig: ConfigurationModel = {
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
                    encoding: OtlpHttpEncoding.Protobuf,
                  },
                },
              },
            },
          ],
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with logger_provider with console exporter', function () {
      process.env.OTEL_LOGS_EXPORTER = 'console';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        logger_provider: {
          limits: {
            attribute_count_limit: 128,
          },
          processors: [
            {
              simple: {
                exporter: {
                  console: {},
                },
              },
            },
          ],
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with logger_provider with no exporter', function () {
      process.env.OTEL_LOGS_EXPORTER = 'none,console';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        logger_provider: {
          limits: {
            attribute_count_limit: 128,
          },
          processors: [],
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with logger_provider with exporter list', function () {
      process.env.OTEL_LOGS_EXPORTER = 'otlp,console';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        logger_provider: {
          limits: {
            attribute_count_limit: 128,
          },
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
                    encoding: OtlpHttpEncoding.Protobuf,
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
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with logger_provider with otlp grpc exporter', function () {
      process.env.OTEL_LOGS_EXPORTER = 'otlp';
      process.env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL = 'grpc';
      process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://localhost:4317';
      process.env.OTEL_EXPORTER_OTLP_TIMEOUT = '10000';
      process.env.OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE = 'log-cert.pem';
      process.env.OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY = 'log-key.pem';
      process.env.OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE =
        'log-client-cert.pem';
      process.env.OTEL_EXPORTER_OTLP_LOGS_HEADERS = 'host=localhost';
      process.env.OTEL_EXPORTER_OTLP_LOGS_COMPRESSION = 'gzip';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        logger_provider: {
          limits: {
            attribute_count_limit: 128,
          },
          processors: [
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
                    certificate_file: 'log-cert.pem',
                    client_key_file: 'log-key.pem',
                    client_certificate_file: 'log-client-cert.pem',
                    headers_list: 'host=localhost',
                    compression: 'gzip',
                  },
                },
              },
            },
          ],
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should return config with logger_provider with otlp http/json exporter', function () {
      process.env.OTEL_LOGS_EXPORTER = 'otlp';
      process.env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL = 'http/json';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        logger_provider: {
          limits: {
            attribute_count_limit: 128,
          },
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
                    encoding: OtlpHttpEncoding.JSON,
                  },
                },
              },
            },
          ],
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should use backup options for exporters', function () {
      process.env.OTEL_EXPORTER_OTLP_CERTIFICATE =
        'backup_certificate_file.pem';
      process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY = 'backup_client_key.pem';
      process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE =
        'backup_client_certificate.pem';
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://backup.com:4318';
      process.env.OTEL_EXPORTER_OTLP_COMPRESSION = 'backup_compression';
      process.env.OTEL_EXPORTER_OTLP_TIMEOUT = '12000';
      process.env.OTEL_EXPORTER_OTLP_HEADERS = 'backup_headers=123';
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        tracer_provider: {
          processors: [
            {
              batch: {
                ...defaultConfig.tracer_provider?.processors[0].batch,
                exporter: {
                  otlp_http: {
                    endpoint: 'http://backup.com:4318/v1/traces',
                    timeout: 12000,
                    compression: 'backup_compression',
                    encoding: OtlpHttpEncoding.Protobuf,
                    certificate_file: 'backup_certificate_file.pem',
                    client_certificate_file: 'backup_client_certificate.pem',
                    client_key_file: 'backup_client_key.pem',
                    headers_list: 'backup_headers=123',
                  },
                },
              },
            },
          ],
          limits: defaultConfig.tracer_provider?.limits,
          sampler: defaultConfig.tracer_provider?.sampler,
        },
        meter_provider: {
          ...defaultConfig.meter_provider,
          readers: [
            {
              periodic: {
                interval: 60000,
                timeout: 30000,
                exporter: {
                  otlp_http: {
                    endpoint: 'http://backup.com:4318/v1/metrics',
                    timeout: 12000,
                    compression: 'backup_compression',
                    temporality_preference:
                      ExporterTemporalityPreference.Cumulative,
                    default_histogram_aggregation:
                      ExporterDefaultHistogramAggregation.ExplicitBucketHistogram,
                    certificate_file: 'backup_certificate_file.pem',
                    client_certificate_file: 'backup_client_certificate.pem',
                    client_key_file: 'backup_client_key.pem',
                    headers_list: 'backup_headers=123',
                    encoding: OtlpHttpEncoding.Protobuf,
                  },
                },
              },
            },
          ],
        },
        logger_provider: {
          ...defaultConfig.logger_provider,
          processors: [
            {
              batch: {
                schedule_delay: 1000,
                export_timeout: 30000,
                max_queue_size: 2048,
                max_export_batch_size: 512,
                exporter: {
                  otlp_http: {
                    endpoint: 'http://backup.com:4318/v1/logs',
                    timeout: 12000,
                    compression: 'backup_compression',
                    encoding: OtlpHttpEncoding.Protobuf,
                    certificate_file: 'backup_certificate_file.pem',
                    client_certificate_file: 'backup_client_certificate.pem',
                    client_key_file: 'backup_client_key.pem',
                    headers_list: 'backup_headers=123',
                  },
                },
              },
            },
          ],
        },
      };
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('checks to keep good code coverage', function () {
      let config: ConfigurationModel = {};
      setResources(config);
      assert.deepStrictEqual(config, { resource: {} });

      config = {};
      process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = '5';
      setAttributeLimits(config);
      assert.deepStrictEqual(config, {
        attribute_limits: {
          attribute_count_limit: 128,
          attribute_value_length_limit: 5,
        },
      });

      config = {};
      delete process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT;
      process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = '7';
      setAttributeLimits(config);
      assert.deepStrictEqual(config, {
        attribute_limits: {
          attribute_count_limit: 7,
        },
      });

      config = {};
      setPropagators(config);
      assert.deepStrictEqual(config, { propagator: {} });

      config = {};
      setTracerProvider(config);
      assert.deepStrictEqual(config, {
        tracer_provider: { limits: {}, processors: [] },
      });

      config = {};
      process.env.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT = '3';
      setLoggerProvider(config);
      assert.deepStrictEqual(config, {
        logger_provider: {
          limits: {
            attribute_count_limit: 128,
            attribute_value_length_limit: 3,
          },
          processors: [],
        },
      });

      config = {
        meter_provider: {
          readers: [{ periodic: { exporter: { otlp_http: undefined } } }],
        },
      };
      process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE =
        'cumulative';
      setMeterProvider(config);
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [
            {
              periodic: {
                exporter: {
                  otlp_http: {
                    default_histogram_aggregation: 'explicit_bucket_histogram',
                    encoding: 'protobuf',
                    temporality_preference: 'cumulative',
                    timeout: 10000,
                  },
                },
                timeout: 30000,
              },
            },
          ],
        },
      });

      process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE =
        'low_memory';
      setMeterProvider(config);
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [
            {
              periodic: {
                exporter: {
                  otlp_http: {
                    default_histogram_aggregation: 'explicit_bucket_histogram',
                    encoding: 'protobuf',
                    temporality_preference: 'low_memory',
                    timeout: 10000,
                  },
                },
                timeout: 30000,
              },
            },
          ],
        },
      });

      process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE = 'default';
      setMeterProvider(config);
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [
            {
              periodic: {
                exporter: {
                  otlp_http: {
                    default_histogram_aggregation: 'explicit_bucket_histogram',
                    encoding: 'protobuf',
                    temporality_preference: 'cumulative',
                    timeout: 10000,
                  },
                },
                timeout: 30000,
              },
            },
          ],
        },
      });
      delete process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE;

      config = {
        meter_provider: {
          readers: [{ periodic: { exporter: { otlp_http: undefined } } }],
        },
      };
      process.env.OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION =
        'explicit_bucket_histogram';
      setMeterProvider(config);
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [
            {
              periodic: {
                exporter: {
                  otlp_http: {
                    default_histogram_aggregation: 'explicit_bucket_histogram',
                    encoding: 'protobuf',
                    temporality_preference: 'cumulative',
                    timeout: 10000,
                  },
                },
                timeout: 30000,
              },
            },
          ],
        },
      });

      process.env.OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION =
        'default';
      setMeterProvider(config);
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [
            {
              periodic: {
                exporter: {
                  otlp_http: {
                    default_histogram_aggregation: 'explicit_bucket_histogram',
                    encoding: 'protobuf',
                    temporality_preference: 'cumulative',
                    timeout: 10000,
                  },
                },
                timeout: 30000,
              },
            },
          ],
        },
      });

      config = {};
      setMeterProvider(config);
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [{}],
        },
      });

      process.env.OTEL_METRICS_EXEMPLAR_FILTER = 'trace_based';
      setMeterProvider(config);
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [{}],
          exemplar_filter: 'trace_based',
        },
      });

      config = {};
      process.env.OTEL_METRICS_EXEMPLAR_FILTER = 'always_off';
      setMeterProvider(config);
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [{}],
          exemplar_filter: 'always_off',
        },
      });

      config = {};
      process.env.OTEL_METRICS_EXEMPLAR_FILTER = 'default';
      setMeterProvider(config);
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [{}],
          exemplar_filter: 'trace_based',
        },
      });
    });
  });

  describe('get values from config file', function () {
    it('should initialize config with default values from valid config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/kitchen-sink.yaml';
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), configFromFile);
    });

    it('should return error from invalid config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = './fixtures/kitchen-sink.txt';
      assert.throws(() => {
        createConfigFactory();
      });
    });

    it('should return error from invalid config file format', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = 'test/fixtures/invalid.yaml';
      assert.throws(() => {
        createConfigFactory();
      });
    });

    it('should initialize config with default values with empty string for config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = '';
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), defaultConfig);
    });

    it('should initialize config with default values with all whitespace for config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = '  ';
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), defaultConfig);
    });

    it('should initialize config with default values from valid short config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/short-config.yml';
      const configFactory = createConfigFactory();
      const expectedConfig: ConfigurationModel = {
        ...defaultConfig,
        resource: {
          attributes_list: 'service.instance.id=123',
          attributes: [
            {
              name: 'service.instance.id',
              value: '123',
              type: 'string',
            },
          ],
        },
      };
      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
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
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT =
        'http://test:4318/v1/metrics';
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
      const configFactory = createConfigFactory();
      const expectedConfig: ConfigurationModel = {
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
                    encoding: OtlpHttpEncoding.Protobuf,
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
          exemplar_filter: ExemplarFilter.AlwaysOff,
          readers: [
            {
              periodic: {
                interval: 20,
                timeout: 21,
                exporter: {
                  otlp_http: {
                    endpoint: 'http://test:4318/v1/metrics',
                    timeout: 22,
                    temporality_preference:
                      ExporterTemporalityPreference.Cumulative,
                    default_histogram_aggregation:
                      ExporterDefaultHistogramAggregation.ExplicitBucketHistogram,
                    certificate_file: 'metric-certificate',
                    client_certificate_file: 'metric-client-certificate',
                    client_key_file: 'metric-client-key',
                    compression: 'metric-compression',
                    encoding: OtlpHttpEncoding.Protobuf,
                    headers_list: 'metric-header',
                  },
                },
                cardinality_limits: {
                  default: 2000,
                  counter: 2000,
                  gauge: 2000,
                  histogram: 2000,
                  observable_counter: 2000,
                  observable_gauge: 2000,
                  observable_up_down_counter: 2000,
                  up_down_counter: 2000,
                },
              },
            },
          ],
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
                    encoding: OtlpHttpEncoding.Protobuf,
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

      assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
    });

    it('should initialize config with fallbacks defined in config file when corresponding environment variables are not defined', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/sdk-migration-config.yaml';

      const configFactory = createConfigFactory();
      assert.deepStrictEqual(
        configFactory.getConfigModel(),
        defaultConfigFromFileWithEnvVariables
      );
    });

    it('checks to keep good code coverage', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/test-for-coverage.yaml';

      let config = {};
      parseConfigFile(config);
      assert.deepStrictEqual(config, { resource: {} });

      config = {};
      setResourceAttributes(config, []);
      assert.deepStrictEqual(config, { resource: { attributes: [] } });

      config = {};
      setFileAttributeLimits(config, { attribute_count_limit: 128 });
      assert.deepStrictEqual(config, {
        attribute_limits: { attribute_count_limit: 128 },
      });

      config = {};
      setPropagator(config, { composite: [{ tracecontext: null }] });
      assert.deepStrictEqual(config, {
        propagator: { composite: [{ tracecontext: null }] },
      });

      config = {};
      setFileTracerProvider(config, { processors: [] });
      assert.deepStrictEqual(config, {
        tracer_provider: { processors: [] },
      });

      config = {};
      setFileLoggerProvider(config, { processors: [] });
      assert.deepStrictEqual(config, {
        logger_provider: { processors: [] },
      });

      const res = getTemporalityPreference(
        ExporterTemporalityPreference.LowMemory
      );
      assert.deepStrictEqual(res, 'low_memory');

      config = {};
      setFileMeterProvider(config, { readers: [] });
      assert.deepStrictEqual(config, {
        meter_provider: { readers: [] },
      });

      config = {};
      setFileMeterProvider(config, {
        readers: [],
        exemplar_filter: ExemplarFilter.AlwaysOn,
      });
      assert.deepStrictEqual(config, {
        meter_provider: { readers: [], exemplar_filter: 'always_on' },
      });

      config = {};
      setFileMeterProvider(config, {
        readers: [],
        views: [{ selector: { instrument_type: InstrumentType.Counter } }],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [],
          views: [{ selector: { instrument_type: 'counter' } }],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        readers: [],
        views: [{ selector: { instrument_type: InstrumentType.Gauge } }],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [],
          views: [{ selector: { instrument_type: 'gauge' } }],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        readers: [],
        views: [
          { selector: { instrument_type: InstrumentType.ObservableCounter } },
        ],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [],
          views: [{ selector: { instrument_type: 'observable_counter' } }],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        readers: [],
        views: [
          { selector: { instrument_type: InstrumentType.ObservableGauge } },
        ],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [],
          views: [{ selector: { instrument_type: 'observable_gauge' } }],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        readers: [],
        views: [
          {
            selector: {
              instrument_type: InstrumentType.ObservableUpDownCounter,
            },
          },
        ],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [],
          views: [
            { selector: { instrument_type: 'observable_up_down_counter' } },
          ],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        readers: [],
        views: [
          { selector: { instrument_type: InstrumentType.UpDownCounter } },
        ],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          readers: [],
          views: [{ selector: { instrument_type: 'up_down_counter' } }],
        },
      });
    });
  });
});

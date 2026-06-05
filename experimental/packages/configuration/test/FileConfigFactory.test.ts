/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as Sinon from 'sinon';
import { diag } from '@opentelemetry/api';
import type { ConfigurationModel } from '../src';
import { createConfigFactory } from '../src/ConfigFactory';
import { parseConfigFile } from '../src/FileConfigFactory';

const defaultConfig: ConfigurationModel = {
  disabled: false,
  resource: {},
  attribute_limits: {
    attribute_count_limit: 128,
  },
  propagator: {},
};

const configFromFile = {
  disabled: false,
  log_level: 'info',
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
    attribute_value_length_limit: null,
    attribute_count_limit: 128,
  },
  propagator: {
    composite: [{ tracecontext: null }, { baggage: null }],
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
              tls: {
                ca_file: null,
                cert_file: null,
                key_file: null,
              },
              timeout: 10000,
              compression: 'gzip',
              encoding: 'protobuf',
            },
          },
        },
      },
    ],
    limits: {
      attribute_value_length_limit: null,
      attribute_count_limit: 128,
      event_count_limit: 128,
      link_count_limit: 128,
      event_attribute_count_limit: 128,
      link_attribute_count_limit: 128,
    },
    sampler: {
      parent_based: {
        root: { always_on: null },
        remote_parent_sampled: { always_on: null },
        remote_parent_not_sampled: { always_off: null },
        local_parent_sampled: { always_on: null },
        local_parent_not_sampled: { always_off: null },
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
              tls: {
                ca_file: null,
                cert_file: null,
                key_file: null,
              },
              compression: 'gzip',
              timeout: 10000,
              temporality_preference: 'cumulative',
              default_histogram_aggregation: 'explicit_bucket_histogram',
              encoding: 'protobuf',
            },
          },
          cardinality_limits: { default: 2000 },
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
              tls: {
                ca_file: null,
                cert_file: null,
                key_file: null,
              },
              timeout: 10000,
              compression: 'gzip',
              encoding: 'protobuf',
            },
          },
        },
      },
    ],
    limits: {
      attribute_value_length_limit: null,
      attribute_count_limit: 128,
    },
  },
};

const ksCardinality = {
  default: 2000,
  counter: 2000,
  gauge: 2000,
  histogram: 2000,
  observable_counter: 2000,
  observable_gauge: 2000,
  observable_up_down_counter: 2000,
  up_down_counter: 2000,
};

const ksPromExporter = (strategy: string) => ({
  host: 'localhost',
  port: 9464,
  without_scope_info: false,
  'without_target_info/development': false,
  with_resource_constant_labels: {
    included: ['service*'],
    excluded: ['service.attr1'],
  },
  translation_strategy: strategy,
});

const configFromKitchenSinkFile = {
  disabled: false,
  log_level: 'info',
  resource: {
    attributes: [
      { name: 'service.name', value: 'unknown_service', type: 'string' },
      { name: 'string_key', value: 'value', type: 'string' },
      { name: 'bool_key', value: true, type: 'bool' },
      { name: 'int_key', value: 1, type: 'int' },
      { name: 'double_key', value: 1.1, type: 'double' },
      {
        name: 'string_array_key',
        value: ['value1', 'value2'],
        type: 'string_array',
      },
      { name: 'bool_array_key', value: [true, false], type: 'bool_array' },
      { name: 'int_array_key', value: [1, 2], type: 'int_array' },
      { name: 'double_array_key', value: [1.1, 2.2], type: 'double_array' },
      { name: 'service.namespace', value: 'my-namespace', type: 'string' },
      { name: 'service.version', value: '1.0.0', type: 'string' },
    ],
    'detection/development': {
      attributes: {
        included: ['process.*'],
        excluded: ['process.command_args'],
      },
      detectors: [
        { container: null },
        { env: null },
        { host: null },
        { os: null },
        { process: null },
        { service: null },
      ],
    },
    schema_url: 'https://opentelemetry.io/schemas/1.16.0',
    attributes_list: 'service.namespace=my-namespace,service.version=1.0.0',
  },
  attribute_limits: {
    attribute_value_length_limit: 4096,
    attribute_count_limit: 128,
  },
  propagator: {
    composite: [
      { tracecontext: null },
      { baggage: null },
      { b3: null },
      { b3multi: null },
      { jaeger: null },
      { ottrace: null },
      { xray: {} },
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
              tls: {
                ca_file: '/app/cert.pem',
                key_file: '/app/cert.pem',
                cert_file: '/app/cert.pem',
              },
              headers: [{ name: 'api-key', value: '1234' }],
              headers_list: 'api-key=1234',
              compression: 'gzip',
              timeout: 10000,
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
              tls: {
                ca_file: '/app/cert.pem',
                key_file: '/app/cert.pem',
                cert_file: '/app/cert.pem',
                insecure: false,
              },
              headers: [{ name: 'api-key', value: '1234' }],
              headers_list: 'api-key=1234',
              compression: 'gzip',
              timeout: 10000,
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
          exporter: { 'otlp_file/development': { output_stream: 'stdout' } },
        },
      },
      {
        simple: { exporter: { console: null } },
      },
    ],
    limits: {
      attribute_value_length_limit: 4096,
      attribute_count_limit: 128,
      event_count_limit: 128,
      link_count_limit: 128,
      event_attribute_count_limit: 128,
      link_attribute_count_limit: 128,
    },
    sampler: {
      parent_based: {
        root: { always_on: null },
        remote_parent_sampled: { always_on: null },
        remote_parent_not_sampled: {
          'probability/development': { ratio: 0.01 },
        },
        local_parent_sampled: {
          'composite/development': {
            rule_based: {
              rules: [
                {
                  attribute_values: {
                    key: 'http.route',
                    values: ['/healthz', '/livez'],
                  },
                  sampler: { always_off: null },
                },
                {
                  attribute_patterns: {
                    key: 'http.path',
                    included: ['/internal/*'],
                    excluded: ['/internal/special/*'],
                  },
                  sampler: { always_on: null },
                },
                {
                  parent: ['none'],
                  span_kinds: ['client'],
                  sampler: { probability: { ratio: 0.05 } },
                },
                {
                  sampler: { probability: { ratio: 0.001 } },
                },
              ],
            },
          },
        },
        local_parent_not_sampled: { always_off: null },
      },
    },
  },
  meter_provider: {
    readers: [
      {
        pull: {
          exporter: {
            'prometheus/development': ksPromExporter(
              'underscore_escaping_with_suffixes'
            ),
          },
          producers: [{ opencensus: null }],
          cardinality_limits: ksCardinality,
        },
      },
      {
        pull: {
          exporter: {
            'prometheus/development': ksPromExporter(
              'underscore_escaping_without_suffixes/development'
            ),
          },
          producers: [{ opencensus: null }],
          cardinality_limits: ksCardinality,
        },
      },
      {
        pull: {
          exporter: {
            'prometheus/development': ksPromExporter(
              'no_utf8_escaping_with_suffixes/development'
            ),
          },
          producers: [{ opencensus: null }],
          cardinality_limits: ksCardinality,
        },
      },
      {
        pull: {
          exporter: {
            'prometheus/development': ksPromExporter(
              'no_translation/development'
            ),
          },
          producers: [{ opencensus: null }],
          cardinality_limits: ksCardinality,
        },
      },
      {
        periodic: {
          interval: 60000,
          timeout: 30000,
          exporter: {
            otlp_http: {
              endpoint: 'http://localhost:4318/v1/metrics',
              tls: {
                ca_file: '/app/cert.pem',
                key_file: '/app/cert.pem',
                cert_file: '/app/cert.pem',
              },
              headers: [{ name: 'api-key', value: '1234' }],
              headers_list: 'api-key=1234',
              compression: 'gzip',
              timeout: 10000,
              encoding: 'protobuf',
              temporality_preference: 'delta',
              default_histogram_aggregation:
                'base2_exponential_bucket_histogram',
            },
          },
          producers: [{ opencensus: null }],
          cardinality_limits: ksCardinality,
        },
      },
      {
        periodic: {
          interval: 60000,
          timeout: 30000,
          exporter: {
            otlp_grpc: {
              endpoint: 'http://localhost:4317',
              tls: {
                ca_file: '/app/cert.pem',
                key_file: '/app/cert.pem',
                cert_file: '/app/cert.pem',
                insecure: false,
              },
              headers: [{ name: 'api-key', value: '1234' }],
              headers_list: 'api-key=1234',
              compression: 'gzip',
              timeout: 10000,
              temporality_preference: 'delta',
              default_histogram_aggregation:
                'base2_exponential_bucket_histogram',
            },
          },
          cardinality_limits: { default: 2000 },
        },
      },
      {
        periodic: {
          interval: 60000,
          timeout: 30000,
          exporter: {
            'otlp_file/development': {
              output_stream: 'file:///var/log/metrics.jsonl',
              temporality_preference: 'delta',
              default_histogram_aggregation:
                'base2_exponential_bucket_histogram',
            },
          },
          cardinality_limits: { default: 2000 },
        },
      },
      {
        periodic: {
          interval: 60000,
          timeout: 30000,
          exporter: {
            'otlp_file/development': {
              output_stream: 'stdout',
              temporality_preference: 'delta',
              default_histogram_aggregation:
                'base2_exponential_bucket_histogram',
            },
          },
          cardinality_limits: { default: 2000 },
        },
      },
      {
        periodic: {
          interval: 60000,
          timeout: 30000,
          exporter: {
            console: {
              temporality_preference: 'delta',
              default_histogram_aggregation:
                'base2_exponential_bucket_histogram',
            },
          },
          cardinality_limits: { default: 2000 },
        },
      },
    ],
    exemplar_filter: 'trace_based',
    views: [
      {
        selector: {
          instrument_name: 'my-instrument',
          instrument_type: 'histogram',
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
          attribute_keys: { included: ['key1', 'key2'], excluded: ['key3'] },
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
              tls: {
                ca_file: '/app/cert.pem',
                key_file: '/app/cert.pem',
                cert_file: '/app/cert.pem',
              },
              headers: [{ name: 'api-key', value: '1234' }],
              headers_list: 'api-key=1234',
              compression: 'gzip',
              timeout: 10000,
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
              tls: {
                ca_file: '/app/cert.pem',
                key_file: '/app/cert.pem',
                cert_file: '/app/cert.pem',
                insecure: false,
              },
              headers: [{ name: 'api-key', value: '1234' }],
              headers_list: 'api-key=1234',
              compression: 'gzip',
              timeout: 10000,
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
              output_stream: 'file:///var/log/logs.jsonl',
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
          exporter: { 'otlp_file/development': { output_stream: 'stdout' } },
        },
      },
      {
        simple: { exporter: { console: null } },
      },
    ],
    limits: {
      attribute_value_length_limit: 4096,
      attribute_count_limit: 128,
    },
    'logger_configurator/development': {
      default_config: { enabled: true },
      loggers: [
        {
          name: 'io.opentelemetry.contrib.*',
          config: {
            enabled: false,
            minimum_severity: 'info',
            trace_based: true,
          },
        },
      ],
    },
  },
};

const defaultConfigFromFileWithEnvVariables: ConfigurationModel = {
  disabled: false,
  log_level: 'info',
  resource: {
    attributes_list: null,
    attributes: [
      {
        name: 'service.name',
        value: 'unknown_service',
        type: 'string',
      },
    ],
  },
  attribute_limits: {
    attribute_value_length_limit: null,
    attribute_count_limit: 128,
  },
  propagator: {
    composite: [{ tracecontext: {} }, { baggage: {} }],
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
              compression: 'gzip',
              encoding: 'protobuf',
              headers_list: null,
              tls: {
                ca_file: null,
                cert_file: null,
                key_file: null,
              },
            },
          },
        },
      },
    ],
    limits: {
      attribute_value_length_limit: null,
      attribute_count_limit: 128,
      event_count_limit: 128,
      link_count_limit: 128,
      event_attribute_count_limit: 128,
      link_attribute_count_limit: 128,
    },
    sampler: {
      parent_based: {
        root: { always_on: null },
        remote_parent_sampled: { always_on: null },
        remote_parent_not_sampled: { always_off: null },
        local_parent_sampled: { always_on: null },
        local_parent_not_sampled: { always_off: null },
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
              compression: 'gzip',
              timeout: 10000,
              temporality_preference: 'cumulative',
              default_histogram_aggregation: 'explicit_bucket_histogram',
              tls: {
                ca_file: null,
                cert_file: null,
                key_file: null,
              },
              headers_list: null,
              encoding: 'protobuf',
            },
          },
          cardinality_limits: { default: 2000 },
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
              compression: 'gzip',
              tls: {
                ca_file: null,
                cert_file: null,
                key_file: null,
              },
              headers_list: null,
              encoding: 'protobuf',
            },
          },
        },
      },
    ],
    limits: {
      attribute_value_length_limit: null,
      attribute_count_limit: 128,
    },
  },
};

describe('FileConfigFactory', function () {
  const _origEnvVariables = { ...process.env };

  beforeEach(function () {
    // Clear all OTEL_ env vars so tests run in a hermetic environment,
    // regardless of what the user's shell has set.
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('OTEL_')) {
        delete process.env[key];
      }
    }
  });

  afterEach(function () {
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }

    for (const [key, value] of Object.entries(_origEnvVariables)) {
      process.env[key] = value;
    }
    Sinon.restore();
  });

  it('should initialize config with default values from valid config file', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/sdk-config.yaml';
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), configFromFile);
  });

  it('should initialize config with default values from longer valid config file', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/kitchen-sink.yaml';
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(
      configFactory.getConfigModel(),
      configFromKitchenSinkFile
    );
  });

  it('should parse samplers from config file', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/samplers.yaml';
    const configFactory = createConfigFactory();
    const config = configFactory.getConfigModel();
    assert.deepStrictEqual(config.tracer_provider?.sampler, {
      parent_based: {
        root: {
          trace_id_ratio_based: { ratio: 0.5 },
        },
        remote_parent_not_sampled: {
          'probability/development': { ratio: 0.1 },
        },
      },
    });
  });

  it('should parse composite sampler with rule_based rules from config file', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/composite-sampler-array.yaml';
    const configFactory = createConfigFactory();
    const config = configFactory.getConfigModel();
    assert.deepStrictEqual(config.tracer_provider?.sampler, {
      'composite/development': {
        rule_based: {
          rules: [
            { sampler: { always_on: null } },
            { sampler: { probability: { ratio: 0.5 } } },
          ],
        },
      },
    });
  });

  it('should parse composite sampler with rule_based attribute matching from config file', function () {
    process.env.OTEL_CONFIG_FILE =
      'test/fixtures/composite-sampler-rulebased-full.yaml';
    const configFactory = createConfigFactory();
    const config = configFactory.getConfigModel();
    assert.deepStrictEqual(config.tracer_provider?.sampler, {
      'composite/development': {
        rule_based: {
          rules: [
            {
              attribute_values: {
                key: 'http.method',
                values: ['GET'],
              },
              sampler: { always_on: null },
            },
          ],
        },
      },
    });
  });

  it('should throw on non-existant config file', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/no-such-file.txt';
    try {
      createConfigFactory();
    } catch (err) {
      assert.ok(err);
      assert.equal(err.code, 'ENOENT');
    }
  });

  it('should throw from invalid config file format', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/invalid.yaml';
    assert.throws(() => createConfigFactory(), /Unsupported file_format/);
  });

  it('should show multiple validation errors for invalid config', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/invalid-multiple-errors.yaml';
    assert.throws(
      () => createConfigFactory(),
      /Invalid OpenTelemetry config file: .*?:.*must be string.*must be number/s
    );
  });

  it('should initialize config with default values with empty string for config file', function () {
    process.env.OTEL_CONFIG_FILE = '';
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), defaultConfig);
  });

  it('should initialize config with default values with all whitespace for config file', function () {
    process.env.OTEL_CONFIG_FILE = '  ';
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), defaultConfig);
  });

  it('should initialize config with default values from valid short config file', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/short-config.yml';
    const configFactory = createConfigFactory();
    const expectedConfig: ConfigurationModel = {
      disabled: false,
      log_level: 'info',
      attribute_limits: {
        attribute_count_limit: 128,
      },
      resource: {
        attributes_list: 'service.instance.id=123',
        attributes: [
          { name: 'service.instance.id', value: '123', type: 'string' },
        ],
      },
    };
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should initialize config with config file that contains environment variables', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/sdk-migration-config.yaml';
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://test.com:4318';
    process.env.OTEL_SDK_DISABLED = 'false';
    process.env.OTEL_LOG_LEVEL = 'debug';
    process.env.OTEL_SERVICE_NAME = 'custom-name';
    process.env.OTEL_RESOURCE_ATTRIBUTES = 'att=1';
    process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = '23';
    process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = '7';
    process.env.OTEL_PROPAGATORS = 'b3multi';
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
      'http://test.com:4318/v1/metrics';
    process.env.OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE = 'metric-certificate';
    process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY = 'metric-client-key';
    process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE =
      'metric-client-certificate';
    process.env.OTEL_EXPORTER_OTLP_METRICS_COMPRESSION = 'metric-compression';
    process.env.OTEL_EXPORTER_OTLP_METRICS_TIMEOUT = '22';
    process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS = 'metric-header';
    process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE = 'delta';
    process.env.OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION =
      'base2_exponential_bucket_histogram';
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
        attributes_list: 'att=1',
        attributes: [
          {
            name: 'service.name',
            value: 'custom-name',
            type: 'string',
          },
          {
            name: 'att',
            value: '1',
            type: 'string',
          },
        ],
      },
      attribute_limits: {
        attribute_count_limit: 7,
        attribute_value_length_limit: 23,
      },
      propagator: {
        composite: [{ b3multi: {} }],
        composite_list: 'b3multi',
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
                  tls: {
                    ca_file: 'trace-certificate',
                    key_file: 'trace-client-key',
                    cert_file: 'trace-client-certificate',
                  },
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
        exemplar_filter: 'always_off',
        readers: [
          {
            periodic: {
              interval: 20,
              timeout: 21,
              exporter: {
                otlp_http: {
                  endpoint: 'http://test.com:4318/v1/metrics',
                  timeout: 22,
                  temporality_preference: 'delta',
                  default_histogram_aggregation:
                    'base2_exponential_bucket_histogram',
                  tls: {
                    ca_file: 'metric-certificate',
                    key_file: 'metric-client-key',
                    cert_file: 'metric-client-certificate',
                  },
                  compression: 'metric-compression',
                  encoding: 'protobuf',
                  headers_list: 'metric-header',
                },
              },
              cardinality_limits: { default: 2000 },
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
                  tls: {
                    ca_file: 'logs-certificate',
                    key_file: 'logs-client-key',
                    cert_file: 'logs-client-certificate',
                  },
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

    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should initialize config with fallbacks defined in config file when corresponding environment variables are not defined', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/sdk-migration-config.yaml';

    const configFactory = createConfigFactory();
    assert.deepStrictEqual(
      configFactory.getConfigModel(),
      defaultConfigFromFileWithEnvVariables
    );
  });

  it('should throw for empty processors (minItems)', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/invalid-providers.yaml';
    assert.throws(
      () => createConfigFactory(),
      /Invalid OpenTelemetry config file: .*?: \/logger_provider\/processors must be array/
    );
  });

  it('check resources priority', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/resources.yaml';
    const configFactory = createConfigFactory();
    const expectedConfig: ConfigurationModel = {
      disabled: false,
      log_level: 'info',
      attribute_limits: {
        attribute_count_limit: 128,
      },
      resource: {
        schema_url: 'https://opentelemetry.io/schemas/1.16.0',
        attributes_list:
          'service.namespace=config-namespace,service.version=1.0.0',
        attributes: [
          {
            name: 'service.name',
            value: 'config-name',
          },
          {
            name: 'service.namespace',
            value: 'priority-config-namespace',
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
          {
            name: 'service.version',
            value: '1.0.0',
            type: 'string',
          },
        ],
      },
    };
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('decodes percent-encoded keys and values in attributes_list', function () {
    process.env.OTEL_CONFIG_FILE =
      'test/fixtures/attributes-list-percent-encoded.yaml';
    const configFactory = createConfigFactory();
    const config = configFactory.getConfigModel();
    assert.deepStrictEqual(config.resource?.attributes, [
      { name: 'my,key', value: 'value=with=equals', type: 'string' },
      { name: 'unicode', value: 'café', type: 'string' },
    ]);
  });

  it('discards all entries when attributes_list has invalid percent-encoding', function () {
    const warnStub = Sinon.stub(diag, 'warn');
    process.env.OTEL_CONFIG_FILE =
      'test/fixtures/attributes-list-invalid-encoding.yaml';
    const configFactory = createConfigFactory();
    const config = configFactory.getConfigModel();
    assert.strictEqual(config.resource?.attributes, undefined);
    assert.ok(
      warnStub.args.some(args =>
        String(args[0]).includes('Failed to percent-decode')
      )
    );
    warnStub.restore();
  });

  it('discards all entries when attributes_list has unencoded `=` in value', function () {
    const warnStub = Sinon.stub(diag, 'warn');
    process.env.OTEL_CONFIG_FILE =
      'test/fixtures/attributes-list-unencoded-equals.yaml';
    const configFactory = createConfigFactory();
    const config = configFactory.getConfigModel();
    assert.strictEqual(config.resource?.attributes, undefined);
    assert.ok(
      warnStub.args.some(args => String(args[0]).includes('Invalid format'))
    );
    warnStub.restore();
  });

  it('leaves attribute type undefined when omitted in YAML', function () {
    // The spec says "if omitted, string is used" for attribute type, but we intentionally
    // do NOT apply this default in the config parser. The consumer (SDK init code) is
    // responsible for interpreting undefined type as string. This matches the Java/Python
    // pattern where the model faithfully mirrors the config file and semantic defaults
    // are applied at the point of use.
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/attribute-type-omitted.yaml';
    const config = parseConfigFile();
    const attrs = (config as Record<string, unknown>).resource as {
      attributes: { name: string; value: string; type?: string }[];
    };
    const noTypeAttr = attrs.attributes.find(a => a.name === 'no-type-key');
    const explicitAttr = attrs.attributes.find(
      a => a.name === 'explicit-string-key'
    );
    assert.strictEqual(noTypeAttr?.type, undefined);
    assert.strictEqual(explicitAttr?.type, 'string');
  });

  it('checks to keep good code coverage', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/test-for-coverage.yaml';

    const config = parseConfigFile();
    assert.deepStrictEqual(config, {
      disabled: false,
      log_level: 'info',
      attribute_limits: {
        attribute_count_limit: 128,
      },
      resource: {
        attributes_list: null,
      },
      propagator: {
        composite: [{ tracecontext: {} }],
        composite_list: 'tracecontext',
      },
      logger_provider: {
        processors: [
          {
            simple: {
              exporter: {
                console: null,
              },
            },
          },
        ],
        'logger_configurator/development': {
          loggers: [
            {
              config: {
                enabled: false,
                minimum_severity: 'info',
                trace_based: true,
              },
              name: 'io.opentelemetry.contrib.*',
            },
          ],
        },
      },
    });
  });
});

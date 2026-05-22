/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as Sinon from 'sinon';
import type { ConfigurationModel } from '../src';
import { diag } from '@opentelemetry/api';
import { createConfigFactory } from '../src/ConfigFactory';
import {
  setAttributeLimits,
  setMeterProvider,
  setPropagators,
  setResources,
} from '../src/EnvironmentConfigFactory';

const defaultConfig: ConfigurationModel = {
  disabled: false,
  resource: {},
  attribute_limits: {
    attribute_count_limit: 128,
  },
  propagator: {},
};

const defaultTracerProvider: NonNullable<
  ConfigurationModel['tracer_provider']
> = {
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

describe('EnvironmentConfigFactory', function () {
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

  it('should warn and fall back to false when OTEL_SDK_DISABLED is set to an invalid value', function () {
    const warnSpy = Sinon.spy(diag, 'warn');
    process.env.OTEL_SDK_DISABLED = 'not_a_boolean_value';
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), defaultConfig);
    Sinon.assert.calledOnce(warnSpy);
    Sinon.assert.calledWith(
      warnSpy,
      'Invalid value "not_a_boolean_value" for Disable the SDK (env: OTEL_SDK_DISABLED). Expected \'true\' or \'false\'. Falling back to "false".'
    );
  });

  it('should return config with log level as debug', function () {
    process.env.OTEL_LOG_LEVEL = 'DEBUG';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      log_level: 'debug',
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should return config with a list of options for node resource detectors', function () {
    process.env.OTEL_NODE_RESOURCE_DETECTORS = 'env,host, serviceinstance';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      resource: {
        'detection/development': {
          detectors: [{ host: {} }, { service: {} }, { env: {} }],
        },
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should map OTEL_NODE_RESOURCE_DETECTORS=all to all detectors', function () {
    process.env.OTEL_NODE_RESOURCE_DETECTORS = 'all';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      resource: {
        'detection/development': {
          detectors: [
            { container: {} },
            { host: {} },
            { os: {} },
            { process: {} },
            { service: {} },
            { env: {} },
          ],
        },
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should not set detection/development for OTEL_NODE_RESOURCE_DETECTORS=none', function () {
    process.env.OTEL_NODE_RESOURCE_DETECTORS = 'none';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should map OTEL_NODE_RESOURCE_DETECTORS=os to os detector', function () {
    process.env.OTEL_NODE_RESOURCE_DETECTORS = 'os';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      resource: {
        'detection/development': {
          detectors: [{ os: {} }],
        },
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should map OTEL_NODE_RESOURCE_DETECTORS=env to env detector', function () {
    process.env.OTEL_NODE_RESOURCE_DETECTORS = 'env';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      resource: {
        'detection/development': {
          detectors: [{ env: {} }],
        },
      },
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
        attributes_list: 'service.namespace=my-namespace,service.version=1.0.0',
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

  it('OTEL_SERVICE_NAME takes precedence over service name value in OTEL_RESOURCE_ATTRIBUTES', function () {
    process.env.OTEL_SERVICE_NAME = 'name-from-service-name';
    process.env.OTEL_RESOURCE_ATTRIBUTES = 'service.name=name-from-attributes';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      resource: {
        attributes: [
          {
            name: 'service.name',
            value: 'name-from-service-name',
            type: 'string',
          },
        ],
        attributes_list: 'service.name=name-from-attributes',
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should configure service name via OTEL_SERVICE_NAME env var', function () {
    process.env.OTEL_SERVICE_NAME = 'name-from-service-name';
    process.env.OTEL_RESOURCE_ATTRIBUTES = 'service.instance.id=my-instance-id';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      resource: {
        attributes: [
          {
            name: 'service.name',
            value: 'name-from-service-name',
            type: 'string',
          },
          {
            name: 'service.instance.id',
            value: 'my-instance-id',
            type: 'string',
          },
        ],
        attributes_list: 'service.instance.id=my-instance-id',
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

  it('should not set propagators by default', function () {
    const configFactory = createConfigFactory();
    const config = configFactory.getConfigModel();
    assert.deepStrictEqual(config, defaultConfig);
    const p = config.propagator;
    assert.strictEqual(p?.composite, undefined);
    assert.strictEqual(p?.composite_list, undefined);
  });

  it('should return config with custom propagator', function () {
    process.env.OTEL_PROPAGATORS = 'tracecontext,jaeger';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      propagator: {
        composite: [{ tracecontext: {} }, { jaeger: {} }],
        composite_list: 'tracecontext,jaeger',
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should return config with sampler always_on', function () {
    process.env.OTEL_TRACES_EXPORTER = 'otlp';
    process.env.OTEL_TRACES_SAMPLER = 'always_on';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      tracer_provider: {
        limits: {
          attribute_count_limit: 128,
          event_count_limit: 128,
          link_count_limit: 128,
          event_attribute_count_limit: 128,
          link_attribute_count_limit: 128,
        },
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
        sampler: { always_on: {} },
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should return config with sampler always_off', function () {
    process.env.OTEL_TRACES_EXPORTER = 'otlp';
    process.env.OTEL_TRACES_SAMPLER = 'always_off';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      tracer_provider: {
        limits: {
          attribute_count_limit: 128,
          event_count_limit: 128,
          link_count_limit: 128,
          event_attribute_count_limit: 128,
          link_attribute_count_limit: 128,
        },
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
        sampler: { always_off: {} },
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should return config with sampler traceidratio', function () {
    process.env.OTEL_TRACES_EXPORTER = 'otlp';
    process.env.OTEL_TRACES_SAMPLER = 'traceidratio';
    process.env.OTEL_TRACES_SAMPLER_ARG = '0.5';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      tracer_provider: {
        limits: {
          attribute_count_limit: 128,
          event_count_limit: 128,
          link_count_limit: 128,
          event_attribute_count_limit: 128,
          link_attribute_count_limit: 128,
        },
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
        sampler: { trace_id_ratio_based: { ratio: 0.5 } },
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should return config with sampler parentbased_always_on', function () {
    process.env.OTEL_TRACES_EXPORTER = 'otlp';
    process.env.OTEL_TRACES_SAMPLER = 'parentbased_always_on';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      tracer_provider: {
        limits: {
          attribute_count_limit: 128,
          event_count_limit: 128,
          link_count_limit: 128,
          event_attribute_count_limit: 128,
          link_attribute_count_limit: 128,
        },
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
        sampler: { parent_based: { root: { always_on: {} } } },
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should return config with sampler parentbased_always_off', function () {
    process.env.OTEL_TRACES_EXPORTER = 'otlp';
    process.env.OTEL_TRACES_SAMPLER = 'parentbased_always_off';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      tracer_provider: {
        limits: {
          attribute_count_limit: 128,
          event_count_limit: 128,
          link_count_limit: 128,
          event_attribute_count_limit: 128,
          link_attribute_count_limit: 128,
        },
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
        sampler: { parent_based: { root: { always_off: {} } } },
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should return config with sampler parentbased_traceidratio', function () {
    process.env.OTEL_TRACES_EXPORTER = 'otlp';
    process.env.OTEL_TRACES_SAMPLER = 'parentbased_traceidratio';
    process.env.OTEL_TRACES_SAMPLER_ARG = '0.25';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      tracer_provider: {
        limits: {
          attribute_count_limit: 128,
          event_count_limit: 128,
          link_count_limit: 128,
          event_attribute_count_limit: 128,
          link_attribute_count_limit: 128,
        },
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
        sampler: {
          parent_based: { root: { trace_id_ratio_based: { ratio: 0.25 } } },
        },
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should warn on unknown sampler type', function () {
    const warnSpy = Sinon.spy(diag, 'warn');
    process.env.OTEL_TRACES_EXPORTER = 'otlp';
    process.env.OTEL_TRACES_SAMPLER = 'unknown_sampler';
    createConfigFactory();
    Sinon.assert.calledWith(
      warnSpy,
      'Invalid value "unknown_sampler" for Traces sampler (env: OTEL_TRACES_SAMPLER). Expected one of: always_on, always_off, traceidratio, parentbased_always_on, parentbased_always_off, parentbased_traceidratio. Value will be ignored.'
    );
  });

  it('should return config with custom tracer_provider', function () {
    process.env.OTEL_TRACES_EXPORTER = 'otlp';
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
    process.env.OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE = 'certificate_file.txt';
    process.env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY = 'certificate_key_value';
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
                  tls: {
                    ca_file: 'certificate_file.txt',
                    key_file: 'certificate_key_value',
                    cert_file: 'client_certificate_file.txt',
                  },
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

  it('should return config with tracer_provider otlp and json protocol', function () {
    process.env.OTEL_TRACES_EXPORTER = 'otlp';
    process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'http/json';

    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      tracer_provider: {
        ...defaultTracerProvider,
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
                  encoding: 'json',
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

  it('should return config with tracer_provider with console exporter', function () {
    process.env.OTEL_TRACES_EXPORTER = 'console';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      tracer_provider: {
        ...defaultTracerProvider,
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
    const configProvider = createConfigFactory();
    assert.deepStrictEqual(configProvider.getConfigModel(), expectedConfig);
  });

  it('should return config with tracer_provider with exporter list', function () {
    process.env.OTEL_TRACES_EXPORTER = 'otlp,console';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      tracer_provider: {
        ...defaultTracerProvider,
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
    const configProvider = createConfigFactory();
    assert.deepStrictEqual(configProvider.getConfigModel(), expectedConfig);
  });

  it('should return config with tracer_provider with no exporter', function () {
    process.env.OTEL_TRACES_EXPORTER = 'none,console';
    const configProvider = createConfigFactory();
    assert.deepStrictEqual(configProvider.getConfigModel(), defaultConfig);
  });

  it('should return config with tracer_provider with otlp grpc exporter', function () {
    process.env.OTEL_TRACES_EXPORTER = 'otlp';
    process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
    process.env.OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE = 'traces-cert.pem';
    process.env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY = 'traces-key.pem';
    process.env.OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE =
      'traces-client-cert.pem';
    process.env.OTEL_EXPORTER_OTLP_TRACES_COMPRESSION = 'gzip';
    process.env.OTEL_EXPORTER_OTLP_TRACES_HEADERS = 'host=localhost';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      tracer_provider: {
        ...defaultTracerProvider,
        processors: [
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
                  tls: {
                    ca_file: 'traces-cert.pem',
                    key_file: 'traces-key.pem',
                    cert_file: 'traces-client-cert.pem',
                  },
                  compression: 'gzip',
                  headers_list: 'host=localhost',
                },
              },
            },
          },
        ],
      },
    };
    const configProvider = createConfigFactory();
    assert.deepStrictEqual(configProvider.getConfigModel(), expectedConfig);
  });

  it('should return config with custom meter_provider', function () {
    process.env.OTEL_METRIC_EXPORT_INTERVAL = '100';
    process.env.OTEL_METRIC_EXPORT_TIMEOUT = '200';
    process.env.OTEL_METRICS_EXPORTER = 'otlp';
    process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT =
      'http://test.com:4318/v1/metrics';
    process.env.OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE = 'certificate_file.txt';
    process.env.OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY = 'certificate_key_value';
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
                  tls: {
                    ca_file: 'certificate_file.txt',
                    key_file: 'certificate_key_value',
                    cert_file: 'client_certificate_file.txt',
                  },
                  compression: 'gzip',
                  timeout: 300,
                  headers_list: 'host=localhost',
                  temporality_preference: 'delta',
                  default_histogram_aggregation:
                    'base2_exponential_bucket_histogram',
                  encoding: 'protobuf',
                },
              },
            },
          },
        ],
        exemplar_filter: 'always_on',
        views: [],
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
        exemplar_filter: 'trace_based',
        views: [],
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should return config with meter_provider with prometheus exporter', function () {
    process.env.OTEL_METRICS_EXPORTER = 'prometheus';

    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      meter_provider: {
        readers: [
          {
            pull: {
              exporter: {
                'prometheus/development': {
                  host: 'localhost',
                  port: 9464,
                  without_scope_info: false,
                  'without_target_info/development': false,
                },
              },
            },
          },
        ],
        exemplar_filter: 'trace_based',
        views: [],
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should return config with meter_provider with prometheus exporter and custom port', function () {
    process.env.OTEL_METRICS_EXPORTER = 'prometheus';
    process.env.OTEL_EXPORTER_PROMETHEUS_HOST = '0.0.0.0';
    process.env.OTEL_EXPORTER_PROMETHEUS_PORT = '8080';

    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      meter_provider: {
        readers: [
          {
            pull: {
              exporter: {
                'prometheus/development': {
                  host: '0.0.0.0',
                  port: 8080,
                  without_scope_info: false,
                  'without_target_info/development': false,
                },
              },
            },
          },
        ],
        exemplar_filter: 'trace_based',
        views: [],
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should return config with meter_provider with no exporter', function () {
    process.env.OTEL_METRICS_EXPORTER = 'none,console';
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), defaultConfig);
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
                  default_histogram_aggregation: 'explicit_bucket_histogram',
                  temporality_preference: 'cumulative',
                  endpoint: 'http://localhost:4318/v1/metrics',
                  timeout: 10000,
                  encoding: 'protobuf',
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
        exemplar_filter: 'trace_based',
        views: [],
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
                  default_histogram_aggregation: 'explicit_bucket_histogram',
                  temporality_preference: 'cumulative',
                  endpoint: 'http://localhost:4317',
                  timeout: 10000,
                  tls: {
                    ca_file: 'metric-cert.pem',
                    key_file: 'metric-key.pem',
                    cert_file: 'metric-client-cert.pem',
                  },
                  compression: 'gzip',
                  headers_list: 'host=localhost',
                },
              },
            },
          },
        ],
        exemplar_filter: 'trace_based',
        views: [],
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
                    'base2_exponential_bucket_histogram',
                  temporality_preference: 'delta',
                  endpoint: 'http://localhost:4317',
                  timeout: 10000,
                },
              },
            },
          },
        ],
        exemplar_filter: 'trace_based',
        views: [],
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
                  default_histogram_aggregation: 'explicit_bucket_histogram',
                  temporality_preference: 'low_memory',
                  endpoint: 'http://localhost:4317',
                  timeout: 10000,
                },
              },
            },
          },
        ],
        exemplar_filter: 'trace_based',
        views: [],
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
                  default_histogram_aggregation: 'explicit_bucket_histogram',
                  temporality_preference: 'cumulative',
                  endpoint: 'http://localhost:4317',
                  timeout: 10000,
                },
              },
            },
          },
        ],
        exemplar_filter: 'trace_based',
        views: [],
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
                  default_histogram_aggregation: 'explicit_bucket_histogram',
                  temporality_preference: 'cumulative',
                  endpoint: 'http://localhost:4318/v1/metrics',
                  timeout: 10000,
                  encoding: 'json',
                },
              },
            },
          },
        ],
        exemplar_filter: 'trace_based',
        views: [],
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
    process.env.OTEL_LOGS_EXPORTER = 'otlp';
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
                  tls: {
                    ca_file: 'certificate_file.txt',
                    key_file: 'certificate_key_value',
                    cert_file: 'client_certificate_file.txt',
                  },
                  compression: 'gzip',
                  timeout: 700,
                  headers_list: 'host=localhost',
                  encoding: 'protobuf',
                },
              },
            },
          },
        ],
        'logger_configurator/development': {},
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
        'logger_configurator/development': {},
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should return config with logger_provider with no exporter', function () {
    process.env.OTEL_LOGS_EXPORTER = 'none,console';
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), defaultConfig);
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
                  encoding: 'protobuf',
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
        'logger_configurator/development': {},
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
                  tls: {
                    ca_file: 'log-cert.pem',
                    key_file: 'log-key.pem',
                    cert_file: 'log-client-cert.pem',
                  },
                  headers_list: 'host=localhost',
                  compression: 'gzip',
                },
              },
            },
          },
        ],
        'logger_configurator/development': {},
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
                  encoding: 'json',
                },
              },
            },
          },
        ],
        'logger_configurator/development': {},
      },
    };
    const configFactory = createConfigFactory();
    assert.deepStrictEqual(configFactory.getConfigModel(), expectedConfig);
  });

  it('should use backup options for exporters', function () {
    process.env.OTEL_EXPORTER_OTLP_CERTIFICATE = 'backup_certificate_file.pem';
    process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY = 'backup_client_key.pem';
    process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE =
      'backup_client_certificate.pem';
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://backup.com:4318';
    process.env.OTEL_EXPORTER_OTLP_COMPRESSION = 'backup_compression';
    process.env.OTEL_EXPORTER_OTLP_TIMEOUT = '12000';
    process.env.OTEL_EXPORTER_OTLP_HEADERS = 'backup_headers=123';
    process.env.OTEL_TRACES_EXPORTER = 'otlp';
    process.env.OTEL_METRICS_EXPORTER = 'otlp';
    process.env.OTEL_LOGS_EXPORTER = 'otlp';
    const expectedConfig: ConfigurationModel = {
      ...defaultConfig,
      tracer_provider: {
        ...defaultTracerProvider,
        processors: [
          {
            batch: {
              export_timeout: 30000,
              max_export_batch_size: 512,
              max_queue_size: 2048,
              schedule_delay: 5000,
              exporter: {
                otlp_http: {
                  endpoint: 'http://backup.com:4318/v1/traces',
                  timeout: 12000,
                  compression: 'backup_compression',
                  encoding: 'protobuf',
                  tls: {
                    ca_file: 'backup_certificate_file.pem',
                    key_file: 'backup_client_key.pem',
                    cert_file: 'backup_client_certificate.pem',
                  },
                  headers_list: 'backup_headers=123',
                },
              },
            },
          },
        ],
      },
      meter_provider: {
        exemplar_filter: 'trace_based',
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
                  temporality_preference: 'cumulative',
                  default_histogram_aggregation: 'explicit_bucket_histogram',
                  tls: {
                    ca_file: 'backup_certificate_file.pem',
                    key_file: 'backup_client_key.pem',
                    cert_file: 'backup_client_certificate.pem',
                  },
                  headers_list: 'backup_headers=123',
                  encoding: 'protobuf',
                },
              },
            },
          },
        ],
        views: [],
      },
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
                  endpoint: 'http://backup.com:4318/v1/logs',
                  timeout: 12000,
                  compression: 'backup_compression',
                  encoding: 'protobuf',
                  tls: {
                    ca_file: 'backup_certificate_file.pem',
                    key_file: 'backup_client_key.pem',
                    cert_file: 'backup_client_certificate.pem',
                  },
                  headers_list: 'backup_headers=123',
                },
              },
            },
          },
        ],
        'logger_configurator/development': {},
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
    process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE =
      'low_memory';
    process.env.OTEL_METRICS_EXEMPLAR_FILTER = 'always_off';
    process.env.OTEL_METRICS_EXPORTER = 'otlp';
    setMeterProvider(config);

    let expectedMeterProvider: ConfigurationModel['meter_provider'] = {
      exemplar_filter: 'always_off',
      readers: [
        {
          periodic: {
            exporter: {
              otlp_http: {
                default_histogram_aggregation: 'explicit_bucket_histogram',
                encoding: 'protobuf',
                endpoint: 'http://localhost:4318/v1/metrics',
                temporality_preference: 'low_memory',
                timeout: 10000,
              },
            },
            interval: 60000,
            timeout: 30000,
          },
        },
      ],
      views: [],
    };
    assert.deepStrictEqual(config.meter_provider, expectedMeterProvider);

    config = {};
    process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE = 'default';
    process.env.OTEL_EXPORTER_OTLP_METRICS_DEFAULT_HISTOGRAM_AGGREGATION =
      'default';
    process.env.OTEL_METRICS_EXEMPLAR_FILTER = 'default';
    setMeterProvider(config);
    expectedMeterProvider = {
      exemplar_filter: 'trace_based',
      readers: [
        {
          periodic: {
            exporter: {
              otlp_http: {
                default_histogram_aggregation: 'explicit_bucket_histogram',
                encoding: 'protobuf',
                endpoint: 'http://localhost:4318/v1/metrics',
                temporality_preference: 'cumulative',
                timeout: 10000,
              },
            },
            interval: 60000,
            timeout: 30000,
          },
        },
      ],
      views: [],
    };
    assert.deepStrictEqual(config.meter_provider, expectedMeterProvider);
  });
});

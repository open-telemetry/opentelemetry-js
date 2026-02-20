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
import * as Sinon from 'sinon';
import { ConfigurationModel } from '../src';
import { diag, DiagLogLevel } from '@opentelemetry/api';
import { createConfigFactory } from '../src/ConfigFactory';
import { OtlpHttpEncoding, SeverityNumber } from '../src/models/commonModel';
import {
  ExemplarFilter,
  ExperimentalPrometheusTranslationStrategy,
  ExporterDefaultHistogramAggregation,
  ExporterTemporalityPreference,
  InstrumentType,
  MeterProvider,
  MetricReader,
} from '../src/models/meterProviderModel';
import {
  setAttributeLimits,
  setMeterProvider,
  setPropagators,
  setResources,
} from '../src/EnvironmentConfigFactory';
import {
  parseConfigFile,
  setResourceAttributes,
  setAttributeLimits as setFileAttributeLimits,
  setPropagator,
  setMeterProvider as setFileMeterProvider,
  getTemporalityPreference,
  getSeverity,
} from '../src/FileConfigFactory';
import { TracerProvider } from '../src/models/tracerProviderModel';

const defaultConfig: ConfigurationModel = {
  disabled: false,
  log_level: DiagLogLevel.INFO,
  resource: {},
  attribute_limits: {
    attribute_count_limit: 128,
  },
  propagator: {},
};

const defaultTracerProvider: TracerProvider = {
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

const configFromFile: ConfigurationModel = {
  disabled: false,
  log_level: DiagLogLevel.INFO,
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
              compression: 'gzip',
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
              compression: 'gzip',
              timeout: 10000,
              encoding: OtlpHttpEncoding.Protobuf,
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
    views: [],
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
    'logger_configurator/development': {},
  },
};

const configFromKitchenSinkFile: ConfigurationModel = {
  disabled: false,
  log_level: DiagLogLevel.INFO,
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
      {
        name: 'service.namespace',
        type: 'string',
        value: 'my-namespace',
      },
      {
        name: 'service.version',
        type: 'string',
        value: '1.0.0',
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
              tls: {
                ca_file: '/app/cert.pem',
                key_file: '/app/cert.pem',
                cert_file: '/app/cert.pem',
              },
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
              tls: {
                ca_file: '/app/cert.pem',
                key_file: '/app/cert.pem',
                cert_file: '/app/cert.pem',
                insecure: false,
              },
              headers: [{ name: 'api-key', value: '1234' }],
              headers_list: 'api-key=1234',
              compression: 'gzip',
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
        root: { always_on: undefined },
        remote_parent_sampled: { always_on: undefined },
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
                  sampler: { always_off: undefined },
                },
                {
                  attribute_patterns: {
                    key: 'http.path',
                    included: ['/internal/*'],
                    excluded: ['/internal/special/*'],
                  },
                  sampler: { always_on: undefined },
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
              without_target_info: false,
              with_resource_constant_labels: {
                included: ['service*'],
                excluded: ['service.attr1'],
              },
              translation_strategy:
                ExperimentalPrometheusTranslationStrategy.UnderscoreEscapingWithSuffixes,
            },
          },
          producers: [
            {
              opencensus: {},
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
        pull: {
          exporter: {
            'prometheus/development': {
              host: 'localhost',
              port: 9464,
              without_scope_info: false,
              without_target_info: false,
              with_resource_constant_labels: {
                included: ['service*'],
                excluded: ['service.attr1'],
              },
              translation_strategy:
                ExperimentalPrometheusTranslationStrategy.UnderscoreEscapingWithoutSuffixes,
            },
          },
          producers: [
            {
              opencensus: {},
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
        pull: {
          exporter: {
            'prometheus/development': {
              host: 'localhost',
              port: 9464,
              without_scope_info: false,
              without_target_info: false,
              with_resource_constant_labels: {
                included: ['service*'],
                excluded: ['service.attr1'],
              },
              translation_strategy:
                ExperimentalPrometheusTranslationStrategy.NoUtf8EscapingWithSuffixes,
            },
          },
          producers: [
            {
              opencensus: {},
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
        pull: {
          exporter: {
            'prometheus/development': {
              host: 'localhost',
              port: 9464,
              without_scope_info: false,
              without_target_info: false,
              with_resource_constant_labels: {
                included: ['service*'],
                excluded: ['service.attr1'],
              },
              translation_strategy:
                ExperimentalPrometheusTranslationStrategy.NoTranslation,
            },
          },
          producers: [
            {
              opencensus: {},
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
              tls: {
                ca_file: '/app/cert.pem',
                key_file: '/app/cert.pem',
                cert_file: '/app/cert.pem',
              },
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
              opencensus: {},
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
              tls: {
                ca_file: '/app/cert.pem',
                key_file: '/app/cert.pem',
                cert_file: '/app/cert.pem',
                insecure: false,
              },
              headers: [
                {
                  name: 'api-key',
                  value: '1234',
                },
              ],
              headers_list: 'api-key=1234',
              compression: 'gzip',
              timeout: 10000,
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
            console: {
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
              tls: {
                ca_file: '/app/cert.pem',
                key_file: '/app/cert.pem',
                cert_file: '/app/cert.pem',
              },
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
              tls: {
                ca_file: '/app/cert.pem',
                key_file: '/app/cert.pem',
                cert_file: '/app/cert.pem',
                insecure: false,
              },
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
        enabled: true,
      },
      loggers: [
        {
          name: 'io.opentelemetry.contrib.*',
          config: {
            enabled: false,
            minimum_severity: SeverityNumber.INFO,
            trace_based: true,
          },
        },
      ],
    },
  },
};

const defaultConfigFromFileWithEnvVariables: ConfigurationModel = {
  disabled: false,
  log_level: DiagLogLevel.INFO,
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
    views: [],
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
    'logger_configurator/development': {},
  },
};

const readerExample: MetricReader = {
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
        opencensus: {},
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
    Sinon.restore();
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

    it('OTEL_SERVICE_NAME takes precedence over service name value in OTEL_RESOURCE_ATTRIBUTES', function () {
      process.env.OTEL_SERVICE_NAME = 'name-from-service-name';
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.name=name-from-attributes';
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
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.instance.id=my-instance-id';
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
      assert.strictEqual(config.propagator?.composite, undefined);
      assert.strictEqual(config.propagator?.composite_list, undefined);
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
                    encoding: OtlpHttpEncoding.Protobuf,
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
                    encoding: OtlpHttpEncoding.Protobuf,
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
                    encoding: OtlpHttpEncoding.Protobuf,
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
                    encoding: OtlpHttpEncoding.Protobuf,
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
                    encoding: OtlpHttpEncoding.Protobuf,
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
                    encoding: OtlpHttpEncoding.Protobuf,
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
      Sinon.assert.calledWith(warnSpy, 'Unknown sampler type: unknown_sampler');
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
                    tls: {
                      ca_file: 'certificate_file.txt',
                      key_file: 'certificate_key_value',
                      cert_file: 'client_certificate_file.txt',
                    },
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
                    tls: {
                      ca_file: 'certificate_file.txt',
                      key_file: 'certificate_key_value',
                      cert_file: 'client_certificate_file.txt',
                    },
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
          exemplar_filter: ExemplarFilter.TraceBased,
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
                    without_target_info: false,
                  },
                },
              },
            },
          ],
          exemplar_filter: ExemplarFilter.TraceBased,
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
                    without_target_info: false,
                  },
                },
              },
            },
          ],
          exemplar_filter: ExemplarFilter.TraceBased,
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
                    default_histogram_aggregation:
                      ExporterDefaultHistogramAggregation.ExplicitBucketHistogram,
                    temporality_preference:
                      ExporterTemporalityPreference.Cumulative,
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
          exemplar_filter: ExemplarFilter.TraceBased,
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
                    encoding: OtlpHttpEncoding.Protobuf,
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
                    encoding: OtlpHttpEncoding.JSON,
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
      process.env.OTEL_EXPORTER_OTLP_CERTIFICATE =
        'backup_certificate_file.pem';
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
                    encoding: OtlpHttpEncoding.Protobuf,
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
          exemplar_filter: ExemplarFilter.TraceBased,
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
                    tls: {
                      ca_file: 'backup_certificate_file.pem',
                      key_file: 'backup_client_key.pem',
                      cert_file: 'backup_client_certificate.pem',
                    },
                    headers_list: 'backup_headers=123',
                    encoding: OtlpHttpEncoding.Protobuf,
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
                    encoding: OtlpHttpEncoding.Protobuf,
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

      let expectedMeterProvider: MeterProvider = {
        exemplar_filter: ExemplarFilter.AlwaysOff,
        readers: [
          {
            periodic: {
              exporter: {
                otlp_http: {
                  default_histogram_aggregation:
                    ExporterDefaultHistogramAggregation.ExplicitBucketHistogram,
                  encoding: OtlpHttpEncoding.Protobuf,
                  endpoint: 'http://localhost:4318/v1/metrics',
                  temporality_preference:
                    ExporterTemporalityPreference.LowMemory,
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
        exemplar_filter: ExemplarFilter.TraceBased,
        readers: [
          {
            periodic: {
              exporter: {
                otlp_http: {
                  default_histogram_aggregation:
                    ExporterDefaultHistogramAggregation.ExplicitBucketHistogram,
                  encoding: OtlpHttpEncoding.Protobuf,
                  endpoint: 'http://localhost:4318/v1/metrics',
                  temporality_preference:
                    ExporterTemporalityPreference.Cumulative,
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

  describe('get values from config file', function () {
    it('should initialize config with default values from valid config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/sdk-config.yaml';
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(configFactory.getConfigModel(), configFromFile);
    });

    it('should initialize config with default values from longer valid config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/kitchen-sink.yaml';
      const configFactory = createConfigFactory();
      assert.deepStrictEqual(
        configFactory.getConfigModel(),
        configFromKitchenSinkFile
      );
    });

    it('should parse samplers from config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = 'test/fixtures/samplers.yaml';
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

    it('should parse composite sampler with samplers array from config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/composite-sampler-array.yaml';
      const configFactory = createConfigFactory();
      const config = configFactory.getConfigModel();
      assert.deepStrictEqual(config.tracer_provider?.sampler, {
        'composite/development': {
          samplers: [
            { always_on: undefined },
            { trace_id_ratio_based: { ratio: 0.5 } },
          ],
        },
      });
    });

    it('should parse composite sampler with rule_based fallback and span_kind from config file', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/composite-sampler-rulebased-full.yaml';
      const configFactory = createConfigFactory();
      const config = configFactory.getConfigModel();
      assert.deepStrictEqual(config.tracer_provider?.sampler, {
        'composite/development': {
          composite: 'rule_based',
          rule_based: {
            span_kind: 'client',
            fallback_sampler: { always_off: undefined },
            rules: [
              {
                attribute_values: {
                  key: 'http.method',
                  values: ['GET'],
                },
                sampler: { always_on: undefined },
              },
            ],
          },
        },
      });
    });

    it('should return error from invalid config file', function () {
      const warnSpy = Sinon.spy(diag, 'warn');
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = './fixtures/invalid.txt';
      createConfigFactory();
      Sinon.assert.calledWith(
        warnSpy,
        'Config file ./fixtures/invalid.txt set on OTEL_EXPERIMENTAL_CONFIG_FILE is not valid'
      );
    });

    it('should return error from invalid config file format', function () {
      const warnSpy = Sinon.spy(diag, 'warn');
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = 'test/fixtures/invalid.yaml';
      createConfigFactory();
      Sinon.assert.calledWith(
        warnSpy,
        'Unsupported File Format: invalid. It must be one of the following: 1.0-rc.3'
      );
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
        disabled: false,
        log_level: DiagLogLevel.INFO,
        attribute_limits: {
          attribute_count_limit: 128,
        },
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
          composite: [{ b3multi: null }],
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
                    endpoint: 'http://test.com:4318/v1/metrics',
                    timeout: 22,
                    temporality_preference:
                      ExporterTemporalityPreference.Cumulative,
                    default_histogram_aggregation:
                      ExporterDefaultHistogramAggregation.ExplicitBucketHistogram,
                    tls: {
                      ca_file: 'metric-certificate',
                      key_file: 'metric-client-key',
                      cert_file: 'metric-client-certificate',
                    },
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
          views: [],
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

    it('checks for incomplete providers', function () {
      const warnSpy = Sinon.spy(diag, 'warn');
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/invalid-providers.yaml';
      createConfigFactory();
      Sinon.assert.calledWith(
        warnSpy.firstCall,
        'TracerProvider must have at least one processor configured'
      );
      Sinon.assert.calledWith(
        warnSpy.secondCall,
        'MeterProvider must have at least one reader configured'
      );
      Sinon.assert.calledWith(
        warnSpy.thirdCall,
        'LoggerProvider must have at least one processor configured'
      );
    });

    it('check resources priority', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/resources.yaml';
      const configFactory = createConfigFactory();
      const expectedConfig: ConfigurationModel = {
        disabled: false,
        log_level: DiagLogLevel.INFO,
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
              type: 'string',
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

    it('checks to keep good code coverage', function () {
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
        'test/fixtures/test-for-coverage.yaml';

      let config = {};
      parseConfigFile(config);
      assert.deepStrictEqual(config, {
        resource: {},
        propagator: {
          composite: [{ tracecontext: null }],
          composite_list: 'tracecontext',
        },
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

      config = {};
      setResourceAttributes(config, [], '');
      assert.deepStrictEqual(config, { resource: {} });

      config = {};
      setFileAttributeLimits(config, { attribute_count_limit: 128 });
      assert.deepStrictEqual(config, {
        attribute_limits: { attribute_count_limit: 128 },
      });

      config = {};
      setPropagator(config, { composite: [{ tracecontext: null }] });
      assert.deepStrictEqual(config, {
        propagator: {
          composite: [{ tracecontext: null }],
          composite_list: 'tracecontext',
        },
      });

      const res = getTemporalityPreference(
        ExporterTemporalityPreference.LowMemory
      );
      assert.deepStrictEqual(res, 'low_memory');

      config = {};
      setFileMeterProvider(config, {
        readers: [readerExample],
        exemplar_filter: ExemplarFilter.AlwaysOn,
        views: [{ selector: { instrument_type: InstrumentType.Counter } }],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          exemplar_filter: 'always_on',
          readers: [readerExample],
          views: [{ selector: { instrument_type: 'counter' } }],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        readers: [readerExample],
        views: [{ selector: { instrument_type: InstrumentType.Gauge } }],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          exemplar_filter: 'trace_based',
          readers: [readerExample],
          views: [{ selector: { instrument_type: 'gauge' } }],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        readers: [readerExample],
        views: [
          { selector: { instrument_type: InstrumentType.ObservableCounter } },
        ],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          exemplar_filter: 'trace_based',
          readers: [readerExample],
          views: [{ selector: { instrument_type: 'observable_counter' } }],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        readers: [readerExample],
        views: [
          { selector: { instrument_type: InstrumentType.ObservableGauge } },
        ],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          exemplar_filter: 'trace_based',
          readers: [readerExample],
          views: [{ selector: { instrument_type: 'observable_gauge' } }],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        readers: [readerExample],
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
          exemplar_filter: 'trace_based',
          readers: [readerExample],
          views: [
            { selector: { instrument_type: 'observable_up_down_counter' } },
          ],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        readers: [readerExample],
        views: [
          { selector: { instrument_type: InstrumentType.UpDownCounter } },
        ],
        exemplar_filter: 'default' as ExemplarFilter,
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          exemplar_filter: 'trace_based',
          readers: [readerExample],
          views: [{ selector: { instrument_type: 'up_down_counter' } }],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        views: [{ stream: { aggregation: { default: {} } } }],
        readers: [readerExample],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          exemplar_filter: 'trace_based',
          readers: [readerExample],
          views: [
            {
              stream: {
                aggregation: {
                  default: {},
                },
              },
            },
          ],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        views: [{ stream: { aggregation: { drop: {} } } }],
        readers: [readerExample],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          exemplar_filter: 'trace_based',
          readers: [readerExample],
          views: [
            {
              stream: {
                aggregation: {
                  drop: {},
                },
              },
            },
          ],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        views: [{ stream: { aggregation: { last_value: {} } } }],
        readers: [readerExample],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          exemplar_filter: 'trace_based',
          readers: [readerExample],
          views: [
            {
              stream: {
                aggregation: {
                  last_value: {},
                },
              },
            },
          ],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        views: [{ stream: { aggregation: { sum: {} } } }],
        readers: [readerExample],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          exemplar_filter: 'trace_based',
          readers: [readerExample],
          views: [
            {
              stream: {
                aggregation: {
                  sum: {},
                },
              },
            },
          ],
        },
      });

      config = {};
      setFileMeterProvider(config, {
        views: [
          {
            stream: {
              aggregation: {
                base2_exponential_bucket_histogram: {
                  record_min_max: false,
                  max_scale: 20,
                  max_size: 160,
                },
              },
            },
          },
        ],
        readers: [readerExample],
      });
      assert.deepStrictEqual(config, {
        meter_provider: {
          exemplar_filter: 'trace_based',
          readers: [readerExample],
          views: [
            {
              stream: {
                aggregation: {
                  base2_exponential_bucket_histogram: {
                    record_min_max: false,
                    max_scale: 20,
                    max_size: 160,
                  },
                },
              },
            },
          ],
        },
      });

      assert.deepStrictEqual(
        getSeverity(SeverityNumber.DEBUG),
        SeverityNumber.DEBUG
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.DEBUG2),
        SeverityNumber.DEBUG2
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.DEBUG3),
        SeverityNumber.DEBUG3
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.DEBUG4),
        SeverityNumber.DEBUG4
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.INFO),
        SeverityNumber.INFO
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.INFO2),
        SeverityNumber.INFO2
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.INFO3),
        SeverityNumber.INFO3
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.INFO4),
        SeverityNumber.INFO4
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.WARN),
        SeverityNumber.WARN
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.WARN2),
        SeverityNumber.WARN2
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.WARN3),
        SeverityNumber.WARN3
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.WARN4),
        SeverityNumber.WARN4
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.ERROR),
        SeverityNumber.ERROR
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.ERROR2),
        SeverityNumber.ERROR2
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.ERROR3),
        SeverityNumber.ERROR3
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.ERROR4),
        SeverityNumber.ERROR4
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.FATAL),
        SeverityNumber.FATAL
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.FATAL2),
        SeverityNumber.FATAL2
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.FATAL3),
        SeverityNumber.FATAL3
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.FATAL4),
        SeverityNumber.FATAL4
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.TRACE),
        SeverityNumber.TRACE
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.TRACE2),
        SeverityNumber.TRACE2
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.TRACE3),
        SeverityNumber.TRACE3
      );
      assert.deepStrictEqual(
        getSeverity(SeverityNumber.TRACE4),
        SeverityNumber.TRACE4
      );
      assert.deepStrictEqual(getSeverity(undefined), undefined);
    });
  });
});

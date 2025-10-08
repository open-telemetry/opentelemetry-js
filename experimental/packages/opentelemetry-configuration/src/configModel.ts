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
'use strict';

import { DiagLogLevel } from '@opentelemetry/api';
export interface ConfigurationModel {
  /**
   * Configure if the SDK is disabled or not.
   * If omitted or null, false is used.
   */
  disabled: boolean;

  /**
   * Configure the log level of the internal logger used by the SDK.
   * If omitted, info is used.
   */
  log_level: number;

  /**
   * Node resource detectors
   * If omitted, all is used.
   */
  node_resource_detectors: string[];

  /**
   * Configure resource for all signals.
   * If omitted, the default resource is used.
   */
  resource: ConfigResources;

  /**
   * Configure general attribute limits.
   * See also tracer_provider.limits, logger_provider.limits.
   */
  attribute_limits: AttributeLimits;

  /**
   * Configure text map context propagators.
   */
  propagator: ConfigPropagator;

  /**
   * Configure tracer provider.
   */
  tracer_provider: ConfigTracerProvider;

  /**
   * Configure meter provider.
   */
  meter_provider: ConfigMeterProvider;

  /**
   * Configure logger provider.
   */
  logger_provider: ConfigLoggerProvider;
}

export function initializeDefaultConfiguration(): ConfigurationModel {
  const config: ConfigurationModel = {
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

  return config;
}

export interface ConfigAttributes {
  name: string;
  value:
    | string
    | boolean
    | number
    | string[]
    | boolean[]
    | number[]
    | undefined;
  type:
    | 'string'
    | 'bool'
    | 'int'
    | 'double'
    | 'string_array'
    | 'bool_array'
    | 'int_array'
    | 'double_array';
}

export interface ConfigResources {
  /**
   * Configure resource attributes. Entries have higher priority than entries from .resource.attributes_list.
   * Entries must contain .name and .value, and may optionally include .type. If an entry's .type omitted or null, string is used.
   * The .value's type must match the .type. Values for .type include: string, bool, int, double, string_array, bool_array, int_array, double_array.
   */
  attributes?: ConfigAttributes[];

  /**
   * Configure resource attributes. Entries have lower priority than entries from .resource.attributes.
   * The value is a list of comma separated key-value pairs matching the format of OTEL_RESOURCE_ATTRIBUTES.
   * If omitted or null, no resource attributes are added.
   */
  attributes_list?: string;

  /**
   * Configure resource schema URL.
   * If omitted or null, no schema URL is used.
   */
  schema_url?: string;
}

export interface AttributeLimits {
  /**
   * Configure max attribute value size.
   * Value must be non-negative.
   * If omitted or null, there is no limit.
   */
  attribute_value_length_limit?: number;

  /**
   * Configure max attribute count.
   * Value must be non-negative.
   * If omitted or null, 128 is used.
   */
  attribute_count_limit: number;
}

export interface ConfigPropagator {
  /**
   * Configure the propagators in the composite text map propagator.
   * Entries from .composite_list are appended to the list here with duplicates filtered out.
   * Built-in propagator keys include: tracecontext, baggage, b3, b3multi, jaeger, ottrace.
   * Known third party keys include: xray.
   * If the resolved list of propagators (from .composite and .composite_list) is empty, a noop propagator is used.
   */
  composite: object[];

  /**
   * Configure the propagators in the composite text map propagator.
   * Entries are appended to .composite with duplicates filtered out.
   * The value is a comma separated list of propagator identifiers matching the format of OTEL_PROPAGATORS.
   * Built-in propagator identifiers include: tracecontext, baggage, b3, b3multi, jaeger, ottrace.
   * Known third party identifiers include: xray.
   * If the resolved list of propagators (from .composite and .composite_list) is empty, a noop propagator is used.
   */
  composite_list: string;
}

export interface ConfigSimpleProcessor {
  /**
   * Configure exporter.
   */
  exporter: ConfigExporter;
}
export interface ConfigBatchProcessor {
  /**
   * Configure delay interval (in milliseconds) between two consecutive exports.
   * Value must be non-negative.
   * If omitted or null, 5000 is used for traces and 1000 for logs.
   */
  schedule_delay: number;

  /**
   * Configure maximum allowed time (in milliseconds) to export data.
   * Value must be non-negative. A value of 0 indicates no limit (infinity).
   * If omitted or null, 30000 is used.
   */
  export_timeout: number;

  /**
   * Configure maximum queue size. Value must be positive.
   * If omitted or null, 2048 is used.
   */
  max_queue_size: number;

  /**
   * Configure maximum batch size. Value must be positive.
   * If omitted or null, 512 is used.
   */
  max_export_batch_size: number;

  /**
   * Configure exporter.
   */
  exporter: ConfigExporter;
}

export interface ConfigExporter {
  /**
   * Configure exporter to be OTLP with HTTP transport.
   */
  otlp_http?: ConfigOTLPHttp;

  /**
   * Configure exporter to be OTLP with gRPC transport.
   */
  otlp_grpc?: ConfigOTLPGRPC;

  /**
   * Configure exporter to be OTLP with file transport.
   * This type is in development and subject to breaking changes in minor versions.
   */
  'otlp_file/development'?: ConfigOTLPFile;

  /**
   * Configure exporter to be console.
   */
  console?: object;

  /**
   * Configure exporter to be zipkin.
   */
  zipkin?: ConfigZipkin;
}

export interface ConfigMeterExporter {
  /**
   * Configure exporter to be OTLP with HTTP transport.
   */
  otlp_http: ConfigMeterOTLPHttp;
}

export interface ConfigOTLPHttp {
  /**
   * Configure endpoint, including the trace or log specific path.
   * If omitted or null, http://localhost:4318/v1/traces is used for trace
   * and http://localhost:4318/v1/logs is used for logs.
   */
  endpoint: string;

  /**
   * Configure certificate used to verify a server's TLS credentials.
   * Absolute path to certificate file in PEM format.
   * If omitted or null, system default certificate verification is used for secure connections.
   */
  certificate_file?: string;

  /**
   * Configure mTLS private client key.
   * Absolute path to client key file in PEM format. If set, .client_certificate must also be set.
   * If omitted or null, mTLS is not used.
   */
  client_key_file?: string;

  /**
   * Configure mTLS client certificate.
   * Absolute path to client certificate file in PEM format. If set, .client_key must also be set.
   * If omitted or null, mTLS is not used.
   */
  client_certificate_file?: string;

  /**
   * Configure compression.
   * Values include: gzip, none. Implementations may support other compression algorithms.
   * If omitted or null, none is used.
   */
  compression?: string;

  /**
   * Configure max time (in milliseconds) to wait for each export.
   * Value must be non-negative. A value of 0 indicates no limit (infinity).
   * If omitted or null, 10000 is used.
   */
  timeout: number;

  /**
   * Configure headers. Entries have higher priority than entries from .headers_list.
   * If an entry's .value is null, the entry is ignored.
   */
  headers?: ConfigHeader[];

  /**
   * Configure headers. Entries have lower priority than entries from .headers.
   * The value is a list of comma separated key-value pairs matching the format of OTEL_EXPORTER_OTLP_HEADERS.
   * If omitted or null, no headers are added.
   */
  headers_list?: string;

  /**
   * Configure the encoding used for messages.
   * Values include: protobuf, json. Implementations may not support json.
   * If omitted or null, protobuf is used.
   */
  encoding: 'protobuf' | 'json';
}

export interface ConfigOTLPGRPC {
  /**
   * Configure endpoint.
   * If omitted or null, http://localhost:4317 is used.
   */
  endpoint: string;

  /**
   * Configure certificate used to verify a server's TLS credentials.
   * Absolute path to certificate file in PEM format.
   * If omitted or null, system default certificate verification is used for secure connections.
   */
  certificate_file?: string;

  /**
   * Configure mTLS private client key.
   * Absolute path to client key file in PEM format. If set, .client_certificate must also be set.
   * If omitted or null, mTLS is not used.
   */
  client_key_file?: string;

  /**
   * Configure mTLS client certificate.
   * Absolute path to client certificate file in PEM format. If set, .client_key must also be set.
   * If omitted or null, mTLS is not used.
   */
  client_certificate_file?: string;

  /**
   * Configure headers. Entries have higher priority than entries from .headers_list.
   * If an entry's .value is null, the entry is ignored.
   */
  headers?: ConfigHeader[];

  /**
   * Configure headers. Entries have lower priority than entries from .headers.
   * The value is a list of comma separated key-value pairs matching the format of OTEL_EXPORTER_OTLP_HEADERS.
   * If omitted or null, no headers are added.
   */
  headers_list?: string;

  /**
   * Configure compression.
   * Values include: gzip, none. Implementations may support other compression algorithms.
   * If omitted or null, none is used.
   */
  compression?: string;

  /**
   * Configure max time (in milliseconds) to wait for each export.
   * Value must be non-negative. A value of 0 indicates no limit (infinity).
   * If omitted or null, 10000 is used.
   */
  timeout: number;

  /**
   * Configure client transport security for the exporter's connection.
   * Only applicable when .endpoint is provided without http or https scheme. Implementations may choose to ignore .insecure.
   * If omitted or null, false is used.
   */
  insecure?: boolean;
}
export interface ConfigOTLPFile {
  /**
   * Configure output stream.
   * Values include stdout, or scheme+destination. For example: file:///path/to/file.jsonl.
   * If omitted or null, stdout is used.
   */
  output_stream: string;
}

export interface ConfigZipkin {
  /**
   * Configure endpoint.
   * If omitted or null, http://localhost:9411/api/v2/spans is used.
   */
  endpoint: string;

  /**
   * Configure max time (in milliseconds) to wait for each export.
   * Value must be non-negative. A value of 0 indicates indefinite.
   * If omitted or null, 10000 is used.
   */
  timeout: number;
}

export interface ConfigProcessor {
  /**
   * Configure a batch span processor.
   */
  batch?: ConfigBatchProcessor;

  /**
   * Configure a simple span processor.
   */
  simple?: ConfigSimpleProcessor;
}

export interface ConfigHeader {
  name: string;
  value: string;
}

export interface ConfigTracerLimits {
  /**
   * Configure max attribute value size. Overrides .attribute_limits.attribute_value_length_limit.
   * Value must be non-negative.
   * If omitted or null, there is no limit.
   */
  attribute_value_length_limit?: number;

  /**
   * Configure max attribute count. Overrides .attribute_limits.attribute_count_limit.
   * Value must be non-negative.
   * If omitted or null, 128 is used.
   */
  attribute_count_limit: number;

  /**
   * Configure max span event count.
   * Value must be non-negative.
   * If omitted or null, 128 is used.
   */
  event_count_limit: number;

  /**
   * Configure max span link count.
   * Value must be non-negative.
   * If omitted or null, 128 is used.
   */
  link_count_limit: number;

  /**
   * Configure max attributes per span event.
   * Value must be non-negative.
   * If omitted or null, 128 is used.
   */
  event_attribute_count_limit: number;

  /**
   * Configure max attributes per span link.
   * Value must be non-negative.
   * If omitted or null, 128 is used.
   */
  link_attribute_count_limit: number;
}

export interface ConfigParentBase {
  /**
   * Configure root sampler.
   * If omitted or null, always_on is used.
   */
  root: 'always_on' | 'always_off';

  /**
   * Configure remote_parent_sampled sampler.
   * If omitted or null, always_on is used.
   */
  remote_parent_sampled: 'always_on' | 'always_off';

  /**
   * Configure remote_parent_not_sampled sampler.
   * If omitted or null, always_off is used.
   */
  remote_parent_not_sampled: 'always_on' | 'always_off';

  /**
   * Configure local_parent_sampled sampler.
   * If omitted or null, always_on is used.
   */
  local_parent_sampled: 'always_on' | 'always_off';

  /**
   * Configure local_parent_not_sampled sampler.
   * If omitted or null, always_off is used.
   */
  local_parent_not_sampled: 'always_on' | 'always_off';
}
export interface ConfigSampler {
  /**
   * Configure sampler to be parent_based.
   */
  parent_based: ConfigParentBase;
}
export interface ConfigTracerProvider {
  /**
   * Configure span processors.
   */
  processors: ConfigProcessor[];

  /**
   * Configure span limits. See also attribute_limits.
   */
  limits: ConfigTracerLimits;

  /**
   * Configure the sampler.
   * If omitted, parent based sampler with a root of always_on is used.
   */
  sampler: ConfigSampler;
}

export interface ConfigMeterOTLPHttp {
  /**
   * Configure endpoint, including the metric specific path.
   * If omitted or null, http://localhost:4318/v1/metrics is used.
   */
  endpoint: string;

  /**
   * Configure certificate used to verify a server's TLS credentials.
   * Absolute path to certificate file in PEM format.
   * If omitted or null, system default certificate verification is used for secure connections.
   */
  certificate_file?: string;

  /**
   * Configure mTLS private client key.
   * Absolute path to client key file in PEM format. If set, .client_certificate must also be set.
   * If omitted or null, mTLS is not used.
   */
  client_key_file?: string;

  /**
   * Configure mTLS client certificate.
   * Absolute path to client certificate file in PEM format. If set, .client_key must also be set.
   * If omitted or null, mTLS is not used.
   */
  client_certificate_file?: string;

  /**
   * Configure compression.
   * Values include: gzip, none. Implementations may support other compression algorithms.
   * If omitted or null, none is used.
   */
  compression?: string;

  /**
   * Configure max time (in milliseconds) to wait for each export.
   * Value must be non-negative. A value of 0 indicates no limit (infinity).
   * If omitted or null, 10000 is used.
   */
  timeout: number;

  /**
   * Configure headers. Entries have higher priority than entries from .headers_list.
   * If an entry's .value is null, the entry is ignored.
   */
  headers?: ConfigHeader[];

  /**
   * Configure headers. Entries have lower priority than entries from .headers.
   * The value is a list of comma separated key-value pairs matching the format of OTEL_EXPORTER_OTLP_HEADERS.
   * If omitted or null, no headers are added.
   */
  headers_list?: string;

  /**
   * Configure temporality preference.
   * Values include: cumulative, delta, low_memory.
   * If omitted or null, cumulative is used.
   */
  temporality_preference: 'cumulative' | 'delta' | 'low_memory';

  /**
   * Configure default histogram aggregation.
   * Values include: explicit_bucket_histogram, base2_exponential_bucket_histogram.
   * If omitted or null, explicit_bucket_histogram is used.
   */
  default_histogram_aggregation:
    | 'explicit_bucket_histogram'
    | 'base2_exponential_bucket_histogram';
}
export interface ConfigPeriodicReader {
  /**
   * Configure delay interval (in milliseconds) between start of two consecutive exports.
   * Value must be non-negative.
   * If omitted or null, 60000 is used.
   */
  interval: number;

  /**
   * Configure maximum allowed time (in milliseconds) to export data.
   * Value must be non-negative. A value of 0 indicates no limit (infinity).
   * If omitted or null, 30000 is used.
   */
  timeout: number;

  /**
   * Configure exporter.
   */
  exporter: ConfigMeterExporter;
}

export interface PullMetricReader {
  /**
   * Configure exporter.
   */
  exporter: PullMetricExporter;

  /**
   * Configure metric producers.
   */
  producers: MetricProducer[];

  /**
   * Configure cardinality limits.
   */
  cardinality_limits: CardinalityLimits;
}

export interface MetricProducer {
  /**
   * Configure metric producer to be opencensus.
   */
  opencensus: object | null;
}

export interface PullMetricExporter {
  /**
   * Configure exporter to be prometheus.
   * This type is in development and subject to breaking changes in minor versions.
   */
  'prometheus/development': PrometheusExporter;
}

export interface PrometheusExporter {
  /**
   * Configure host.
   * If omitted or null, localhost is used.
   */
  host: string;

  /**
   * Configure port.
   * If omitted or null, 9464 is used.
   */
  port: number;

  /**
   * Configure Prometheus Exporter to produce metrics without a unit suffix or UNIT metadata.
   * If omitted or null, false is used.
   */
  without_units: boolean;

  /**
   * Configure Prometheus Exporter to produce metrics without a type suffix.
   * If omitted or null, false is used.
   */
  without_type_suffix: boolean;

  /**
   * Configure Prometheus Exporter to produce metrics without a scope info metric.
   * If omitted or null, false is used.
   */
  without_scope_info: boolean;

  /**
   * Configure Prometheus Exporter to add resource attributes as metrics attributes.
   */
  with_resource_constant_labels: IncludeExclude;
}

export interface IncludeExclude {
  /**
   * Configure resource attributes to be included.
   * Attribute keys from resources are evaluated to match as follows:
   *  * If the value of the attribute key exactly matches.
   *  * If the value of the attribute key matches the wildcard pattern, where '?' matches any
   * single character and '*' matches any number of characters including none.
   * If omitted, no resource attributes are included.
   */
  included: string[];

  /**
   * Configure resource attributes to be excluded. Applies after .with_resource_constant_labels.included
   * (i.e. excluded has higher priority than included).
   * Attribute keys from resources are evaluated to match as follows:
   *   * If the value of the attribute key exactly matches.
   *   * If the value of the attribute key matches the wildcard pattern, where '?' matches any
   * single character and '*' matches any number of characters including none.
   * If omitted, .included resource attributes are included.
   */
  excluded: string[];
}

export interface CardinalityLimits {
  /**
   * Configure default cardinality limit for all instrument types.
   * Instrument-specific cardinality limits take priority.
   * If omitted or null, 2000 is used.
   */
  default: number;

  /**
   * Configure default cardinality limit for counter instruments.
   * If omitted or null, the value from .default is used.
   */
  counter: number;

  /**
   * Configure default cardinality limit for gauge instruments.
   * If omitted or null, the value from .default is used.
   */
  gauge: number;

  /**
   * Configure default cardinality limit for histogram instruments.
   * If omitted or null, the value from .default is used.
   */
  histogram: number;

  /**
   * Configure default cardinality limit for observable_counter instruments.
   * If omitted or null, the value from .default is used.
   */
  observable_counter: number;

  /**
   * Configure default cardinality limit for observable_gauge instruments.
   * If omitted or null, the value from .default is used.
   */
  observable_gauge: number;

  /**
   * Configure default cardinality limit for observable_up_down_counter instruments.
   * If omitted or null, the value from .default is used.
   */
  observable_up_down_counter: number;

  /**
   * Configure default cardinality limit for up_down_counter instruments.
   * If omitted or null, the value from .default is used.
   */
  up_down_counter: number;
}

export interface ConfigReader {
  /**
   * Configure a periodic metric reader.
   */
  periodic?: ConfigPeriodicReader;

  /**
   * Configure a pull based metric reader.
   */
  pull?: PullMetricReader;
}
export interface ConfigMeterProvider {
  /**
   * Configure metric readers.
   */
  readers: ConfigReader[];

  /**
   * Configure the exemplar filter.
   * Values include: trace_based, always_on, always_off.
   * If omitted or null, trace_based is used.
   */
  exemplar_filter: 'trace_based' | 'always_on' | 'always_off';
}

//   readers:
//     - # Configure a periodic metric reader.
//       periodic:
//         # Configure delay interval (in milliseconds) between start of two consecutive exports. 
//         # Value must be non-negative.
//         # If omitted or null, 60000 is used.
//         interval: 60000
//         # Configure maximum allowed time (in milliseconds) to export data. 
//         # Value must be non-negative. A value of 0 indicates no limit (infinity).
//         # If omitted or null, 30000 is used.
//         timeout: 30000
//         # Configure exporter.
//         exporter:
//           # Configure exporter to be OTLP with HTTP transport.
//           otlp_http:
//             # Configure endpoint, including the metric specific path.
//             # If omitted or null, http://localhost:4318/v1/metrics is used.
//             endpoint: http://localhost:4318/v1/metrics
//             # Configure certificate used to verify a server's TLS credentials. 
//             # Absolute path to certificate file in PEM format.
//             # If omitted or null, system default certificate verification is used for secure connections.
//             certificate_file: /app/cert.pem
//             # Configure mTLS private client key. 
//             # Absolute path to client key file in PEM format. If set, .client_certificate must also be set.
//             # If omitted or null, mTLS is not used.
//             client_key_file: /app/cert.pem
//             # Configure mTLS client certificate. 
//             # Absolute path to client certificate file in PEM format. If set, .client_key must also be set.
//             # If omitted or null, mTLS is not used.
//             client_certificate_file: /app/cert.pem
//             # Configure headers. Entries have higher priority than entries from .headers_list.
//             # If an entry's .value is null, the entry is ignored.
//             headers:
//               - name: api-key
//                 value: "1234"
//             # Configure headers. Entries have lower priority than entries from .headers.
//             # The value is a list of comma separated key-value pairs matching the format of OTEL_EXPORTER_OTLP_HEADERS. See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options for details.
//             # If omitted or null, no headers are added.
//             headers_list: "api-key=1234"
//             # Configure compression.
//             # Values include: gzip, none. Implementations may support other compression algorithms.
//             # If omitted or null, none is used.
//             compression: gzip
//             # Configure max time (in milliseconds) to wait for each export. 
//             # Value must be non-negative. A value of 0 indicates no limit (infinity).
//             # If omitted or null, 10000 is used.
//             timeout: 10000
//             # Configure the encoding used for messages. 
//             # Values include: protobuf, json. Implementations may not support json.
//             # If omitted or null, protobuf is used.
//             encoding: protobuf
//             # Configure temporality preference. 
//             # Values include: cumulative, delta, low_memory. For behavior of values, see https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk_exporters/otlp.md.
//             # If omitted or null, cumulative is used.
//             temporality_preference: delta
//             # Configure default histogram aggregation. 
//             # Values include: explicit_bucket_histogram, base2_exponential_bucket_histogram. For behavior of values, see https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk_exporters/otlp.md.
//             # If omitted or null, explicit_bucket_histogram is used.
//             default_histogram_aggregation: base2_exponential_bucket_histogram
//         # Configure metric producers.
//         producers:
//           - # Configure metric producer to be prometheus.
//             prometheus:
//         # Configure cardinality limits.
//         cardinality_limits:
//           # Configure default cardinality limit for all instrument types.
//           # Instrument-specific cardinality limits take priority. 
//           # If omitted or null, 2000 is used.
//           default: 2000
//           # Configure default cardinality limit for counter instruments.
//           # If omitted or null, the value from .default is used.
//           counter: 2000
//           # Configure default cardinality limit for gauge instruments.
//           # If omitted or null, the value from .default is used.
//           gauge: 2000
//           # Configure default cardinality limit for histogram instruments.
//           # If omitted or null, the value from .default is used.
//           histogram: 2000
//           # Configure default cardinality limit for observable_counter instruments.
//           # If omitted or null, the value from .default is used.
//           observable_counter: 2000
//           # Configure default cardinality limit for observable_gauge instruments.
//           # If omitted or null, the value from .default is used.
//           observable_gauge: 2000
//           # Configure default cardinality limit for observable_up_down_counter instruments.
//           # If omitted or null, the value from .default is used.
//           observable_up_down_counter: 2000
//           # Configure default cardinality limit for up_down_counter instruments.
//           # If omitted or null, the value from .default is used.
//           up_down_counter: 2000
//     - # Configure a periodic metric reader.
//       periodic:
//         # Configure exporter.
//         exporter:
//           # Configure exporter to be OTLP with gRPC transport.
//           otlp_grpc:
//             # Configure endpoint.
//             # If omitted or null, http://localhost:4317 is used.
//             endpoint: http://localhost:4317
//             # Configure certificate used to verify a server's TLS credentials. 
//             # Absolute path to certificate file in PEM format.
//             # If omitted or null, system default certificate verification is used for secure connections.
//             certificate_file: /app/cert.pem
//             # Configure mTLS private client key. 
//             # Absolute path to client key file in PEM format. If set, .client_certificate must also be set.
//             # If omitted or null, mTLS is not used.
//             client_key_file: /app/cert.pem
//             # Configure mTLS client certificate. 
//             # Absolute path to client certificate file in PEM format. If set, .client_key must also be set.
//             # If omitted or null, mTLS is not used.
//             client_certificate_file: /app/cert.pem
//             # Configure headers. Entries have higher priority than entries from .headers_list.
//             # If an entry's .value is null, the entry is ignored.
//             headers:
//               - name: api-key
//                 value: "1234"
//             # Configure headers. Entries have lower priority than entries from .headers.
//             # The value is a list of comma separated key-value pairs matching the format of OTEL_EXPORTER_OTLP_HEADERS. See https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#configuration-options for details.
//             # If omitted or null, no headers are added.
//             headers_list: "api-key=1234"
//             # Configure compression.
//             # Values include: gzip, none. Implementations may support other compression algorithms.
//             # If omitted or null, none is used.
//             compression: gzip
//             # Configure max time (in milliseconds) to wait for each export. 
//             # Value must be non-negative. A value of 0 indicates no limit (infinity).
//             # If omitted or null, 10000 is used.
//             timeout: 10000
//             # Configure client transport security for the exporter's connection. 
//             # Only applicable when .endpoint is provided without http or https scheme. Implementations may choose to ignore .insecure.
//             # If omitted or null, false is used.
//             insecure: false
//             # Configure temporality preference. 
//             # Values include: cumulative, delta, low_memory. For behavior of values, see https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk_exporters/otlp.md.
//             # If omitted or null, cumulative is used.
//             temporality_preference: delta
//             # Configure default histogram aggregation. 
//             # Values include: explicit_bucket_histogram, base2_exponential_bucket_histogram. For behavior of values, see https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk_exporters/otlp.md.
//             # If omitted or null, explicit_bucket_histogram is used.
//             default_histogram_aggregation: base2_exponential_bucket_histogram
//     - # Configure a periodic metric reader.
//       periodic:
//         # Configure exporter.
//         exporter:
//           # Configure exporter to be OTLP with file transport.
//           # This type is in development and subject to breaking changes in minor versions.
//           otlp_file/development:
//             # Configure output stream. 
//             # Values include stdout, or scheme+destination. For example: file:///path/to/file.jsonl.
//             # If omitted or null, stdout is used.
//             output_stream: file:///var/log/metrics.jsonl
//             # Configure temporality preference. Values include: cumulative, delta, low_memory. For behavior of values, see https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk_exporters/otlp.md.
//             # If omitted or null, cumulative is used.
//             temporality_preference: delta
//             # Configure default histogram aggregation. Values include: explicit_bucket_histogram, base2_exponential_bucket_histogram. For behavior of values, see https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk_exporters/otlp.md.
//             # If omitted or null, explicit_bucket_histogram is used.
//             default_histogram_aggregation: base2_exponential_bucket_histogram
//     - # Configure a periodic metric reader.
//       periodic:
//         # Configure exporter.
//         exporter:
//           # Configure exporter to be OTLP with file transport.
//           # This type is in development and subject to breaking changes in minor versions.
//           otlp_file/development:
//             # Configure output stream. 
//             # Values include stdout, or scheme+destination. For example: file:///path/to/file.jsonl.
//             # If omitted or null, stdout is used.
//             output_stream: stdout
//             # Configure temporality preference. Values include: cumulative, delta, low_memory. For behavior of values, see https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk_exporters/otlp.md.
//             # If omitted or null, cumulative is used.
//             temporality_preference: delta
//             # Configure default histogram aggregation. Values include: explicit_bucket_histogram, base2_exponential_bucket_histogram. For behavior of values, see https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk_exporters/otlp.md.
//             # If omitted or null, explicit_bucket_histogram is used.
//             default_histogram_aggregation: base2_exponential_bucket_histogram
//     - # Configure a periodic metric reader.
//       periodic:
//         # Configure exporter.
//         exporter:
//           # Configure exporter to be console.
//           console:
//   # Configure views. 
//   # Each view has a selector which determines the instrument(s) it applies to, and a configuration for the resulting stream(s).
//   views:
//     - # Configure view selector. 
//       # Selection criteria is additive as described in https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#instrument-selection-criteria.
//       selector:
//         # Configure instrument name selection criteria.
//         # If omitted or null, all instrument names match.
//         instrument_name: my-instrument
//         # Configure instrument type selection criteria.
//         # Values include: counter, gauge, histogram, observable_counter, observable_gauge, observable_up_down_counter, up_down_counter.
//         # If omitted or null, all instrument types match.
//         instrument_type: histogram
//         # Configure the instrument unit selection criteria.
//         # If omitted or null, all instrument units match.
//         unit: ms
//         # Configure meter name selection criteria.
//         # If omitted or null, all meter names match.
//         meter_name: my-meter
//         # Configure meter version selection criteria.
//         # If omitted or null, all meter versions match.
//         meter_version: 1.0.0
//         # Configure meter schema url selection criteria.
//         # If omitted or null, all meter schema URLs match.
//         meter_schema_url: https://opentelemetry.io/schemas/1.16.0
//       # Configure view stream.
//       stream:
//         # Configure metric name of the resulting stream(s).
//         # If omitted or null, the instrument's original name is used.
//         name: new_instrument_name
//         # Configure metric description of the resulting stream(s).
//         # If omitted or null, the instrument's origin description is used.
//         description: new_description
//         # Configure aggregation of the resulting stream(s). 
//         # Values include: default, drop, explicit_bucket_histogram, base2_exponential_bucket_histogram, last_value, sum. For behavior of values see https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#aggregation.
//         # If omitted, default is used.
//         aggregation:
//           # Configure aggregation to be explicit_bucket_histogram.
//           explicit_bucket_histogram:
//             # Configure bucket boundaries.
//             # If omitted, [0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10000] is used.
//             boundaries:
//               [
//                 0.0,
//                 5.0,
//                 10.0,
//                 25.0,
//                 50.0,
//                 75.0,
//                 100.0,
//                 250.0,
//                 500.0,
//                 750.0,
//                 1000.0,
//                 2500.0,
//                 5000.0,
//                 7500.0,
//                 10000.0
//               ]
//             # Configure record min and max.
//             # If omitted or null, true is used.
//             record_min_max: true
//         # Configure the aggregation cardinality limit.
//         # If omitted or null, the metric reader's default cardinality limit is used.
//         aggregation_cardinality_limit: 2000
//         # Configure attribute keys retained in the resulting stream(s).
//         attribute_keys:
//           # Configure list of attribute keys to include in the resulting stream(s). All other attributes are dropped. 
//           # If omitted, all attributes are included.
//           included:
//             - key1
//             - key2
//           # Configure list of attribute keys to exclude from the resulting stream(s). Applies after .attribute_keys.included (i.e. excluded has higher priority than included).
//           # If omitted, .attribute_keys.included are included.
//           excluded:
//             - key3
//   # Configure the exemplar filter. 
//   # Values include: trace_based, always_on, always_off. For behavior of values see https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/configuration/sdk-environment-variables.md#metrics-sdk-configuration.
//   # If omitted or null, trace_based is used.
//   exemplar_filter: trace_based
//   # Configure meters.
//   # This type is in development and subject to breaking changes in minor versions.
//   meter_configurator/development:
//     # Configure the default meter config used there is no matching entry in .meter_configurator/development.meters.
//     default_config:
//       # Configure if the meter is enabled or not.
//       disabled: true
//     # Configure meters.
//     meters:
//       - # Configure meter names to match, evaluated as follows:
//         #
//         #  * If the meter name exactly matches.
//         #  * If the meter name matches the wildcard pattern, where '?' matches any single character and '*' matches any number of characters including none.
//         name: io.opentelemetry.contrib.*
//         # The meter config.
//         config:
//           # Configure if the meter is enabled or not.
//           disabled: false

export interface ConfigLoggerProvider {
  /**
   * Configure log record processors.
   */
  processors: ConfigProcessor[];

  /**
   * Configure log record limits. See also attribute_limits.
   */
  limits: AttributeLimits;

  /**
   * Configure loggers.
   * This type is in development and subject to breaking changes in minor versions.
   */
  'logger_configurator/development'?: LoggerConfigurator;
}

export interface LoggerConfigurator {
  /**
   * Configure the default logger config used there is no matching entry in .logger_configurator/development.loggers.
   */
  default_config?: DisabledConfig;

  /**
   * Configure loggers.
   */
  loggers?: LoggerMatcherAndConfig[];
}

export interface DisabledConfig {
  /**
   * Configure if the logger is enabled or not.
   */
  disabled: boolean;
}

export interface LoggerMatcherAndConfig {
  /**
   * Configure logger names to match, evaluated as follows:
   *  * If the logger name exactly matches.
   *  * If the logger name matches the wildcard pattern, where '?' matches any single character
   * and '*' matches any number of characters including none.
   */
  name: string;

  /**
   * The logger config.
   */
  config: DisabledConfig;
}

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
export interface ConfigReader {
  /**
   * Configure a periodic metric reader.
   */
  periodic: ConfigPeriodicReader;
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

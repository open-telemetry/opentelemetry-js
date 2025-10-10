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

import {
  IncludeExclude,
  NameStringValuePair,
  OtlpHttpEncoding,
} from './commonModel';

export function initializeDefaultMeterProviderConfiguration(): MeterProvider {
  return {
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
            },
          },
        },
      },
    ],
    exemplar_filter: ExemplarFilter.TraceBased,
  };
}

export interface MeterProvider {
  /**
   * Configure metric readers.
   */
  readers: MetricReader[];

  /**
   * Configure views.
   * Each view has a selector which determines the instrument(s) it applies to,
   * and a configuration for the resulting stream(s).
   */
  views?: View[];

  /**
   * Configure the exemplar filter.
   * Values include: trace_based, always_on, always_off.
   * If omitted or null, trace_based is used.
   */
  exemplar_filter?: ExemplarFilter;
}

export enum ExemplarFilter {
  AlwaysOff = 'always_off',
  AlwaysOn = 'always_on',
  TraceBased = 'trace_based',
}

export interface PeriodicMetricReader {
  /**
   * Configure delay interval (in milliseconds) between start of two consecutive exports.
   * Value must be non-negative.
   * If omitted or null, 60000 is used.
   */
  interval?: number;

  /**
   * Configure maximum allowed time (in milliseconds) to export data.
   * Value must be non-negative. A value of 0 indicates no limit (infinity).
   * If omitted or null, 30000 is used.
   */
  timeout?: number;

  /**
   * Configure exporter.
   */
  exporter: PushMetricExporter;

  /**
   * Configure metric producers.
   */
  producers?: MetricProducer[];

  /**
   * Configure cardinality limits.
   */
  cardinality_limits?: CardinalityLimits;
}

export interface PullMetricReader {
  /**
   * Configure exporter.
   */
  exporter: PullMetricExporter;

  /**
   * Configure metric producers.
   */
  producers?: MetricProducer[];

  /**
   * Configure cardinality limits.
   */
  cardinality_limits?: CardinalityLimits;
}

export interface CardinalityLimits {
  /**
   * Configure default cardinality limit for all instrument types.
   * Instrument-specific cardinality limits take priority.
   * If omitted or null, 2000 is used.
   */
  default?: number;

  /**
   * Configure default cardinality limit for counter instruments.
   * If omitted or null, the value from .default is used.
   */
  counter?: number;

  /**
   * Configure default cardinality limit for gauge instruments.
   * If omitted or null, the value from .default is used.
   */
  gauge?: number;

  /**
   * Configure default cardinality limit for histogram instruments.
   * If omitted or null, the value from .default is used.
   */
  histogram?: number;

  /**
   * Configure default cardinality limit for observable_counter instruments.
   * If omitted or null, the value from .default is used.
   */
  observable_counter?: number;

  /**
   * Configure default cardinality limit for observable_gauge instruments.
   * If omitted or null, the value from .default is used.
   */
  observable_gauge?: number;

  /**
   * Configure default cardinality limit for observable_up_down_counter instruments.
   * If omitted or null, the value from .default is used.
   */
  observable_up_down_counter?: number;

  /**
   * Configure default cardinality limit for up_down_counter instruments.
   * If omitted or null, the value from .default is used.
   */
  up_down_counter?: number;
}

export interface PushMetricExporter {
  /**
   * Configure exporter to be OTLP with HTTP transport.
   */
  otlp_http?: OtlpHttpMetricExporter;

  /**
   * Configure exporter to be OTLP with gRPC transport.
   */
  otlp_grpc?: OtlpGrpcMetricExporter;

  /**
   * Configure exporter to be OTLP with file transport.
   * This type is in development and subject to breaking changes in minor versions.
   */
  'otlp_file/development'?: OtlpFileMetricExporter;

  /**
   * Configure exporter to be console.
   */
  console?: object;
}

export interface PullMetricExporter {
  /**
   * Configure exporter to be prometheus.
   * This type is in development and subject to breaking changes in minor versions.
   */
  'prometheus/development': PrometheusMetricExporter;
}

export interface MetricProducer {
  /**
   * Configure metric producer to be opencensus.
   */
  opencensus?: object;

  /**
   * Configure metric producer to be prometheus.
   */
  prometheus?: object;
}

export interface PrometheusMetricExporter {
  /**
   * Configure host.
   * If omitted or null, localhost is used.
   */
  host?: string;

  /**
   * Configure port.
   * If omitted or null, 9464 is used.
   */
  port?: number;

  /**
   * Configure Prometheus Exporter to produce metrics without a scope info metric.
   * If omitted or null, false is used.
   */
  without_scope_info?: boolean;

  /**
   * Configure Prometheus Exporter to add resource attributes as metrics attributes.
   */
  with_resource_constant_labels: IncludeExclude;
}

export interface MetricReader {
  /**
   * Configure a periodic metric reader.
   */
  periodic?: PeriodicMetricReader;

  /**
   * Configure a pull based metric reader.
   */
  pull?: PullMetricReader;
}

export interface OtlpHttpMetricExporter {
  /**
   * Configure endpoint, including the metric specific path.
   * If omitted or null, http://localhost:4318/v1/metrics is used.
   */
  endpoint?: string;

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
  headers?: NameStringValuePair[];

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
  timeout?: number;

  /**
   * Configure the encoding used for messages.
   * Values include: protobuf, json. Implementations may not support json.
   * If omitted or null, protobuf is used.
   */
  encoding?: OtlpHttpEncoding;

  /**
   * Configure temporality preference.
   * Values include: cumulative, delta, low_memory.
   * If omitted or null, cumulative is used.
   */
  temporality_preference?: ExporterTemporalityPreference;

  /**
   * Configure default histogram aggregation.
   * Values include: explicit_bucket_histogram, base2_exponential_bucket_histogram.
   * If omitted or null, explicit_bucket_histogram is used.
   */
  default_histogram_aggregation?: ExporterDefaultHistogramAggregation;
}

export interface OtlpGrpcMetricExporter {
  /**
   * Configure endpoint.
   * If omitted or null, http://localhost:4317 is used.
   */
  endpoint?: string;

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
  headers?: NameStringValuePair[];

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
  timeout?: number;

  /**
   * Configure client transport security for the exporter's connection.
   * Only applicable when .endpoint is provided without http or https scheme. Implementations may choose to ignore .insecure.
   * If omitted or null, false is used.
   */
  insecure?: boolean;

  /**
   * Configure temporality preference.
   * Values include: cumulative, delta, low_memory.
   * If omitted or null, cumulative is used.
   */
  temporality_preference?: ExporterTemporalityPreference;

  /**
   * Configure default histogram aggregation.
   * Values include: explicit_bucket_histogram, base2_exponential_bucket_histogram.
   * If omitted or null, explicit_bucket_histogram is used.
   */
  default_histogram_aggregation?: ExporterDefaultHistogramAggregation;
}

export interface OtlpFileMetricExporter {
  /**
   * Configure output stream.
   * Values include stdout, or scheme+destination. For example: file:///path/to/file.jsonl.
   * If omitted or null, stdout is used.
   */
  output_stream?: string;

  /**
   * Configure temporality preference.
   * Values include: cumulative, delta, low_memory.
   * If omitted or null, cumulative is used.
   */
  temporality_preference?: ExporterTemporalityPreference;

  /**
   * Configure default histogram aggregation.
   * Values include: explicit_bucket_histogram, base2_exponential_bucket_histogram.
   * If omitted or null, explicit_bucket_histogram is used.
   */
  default_histogram_aggregation?: ExporterDefaultHistogramAggregation;
}

export enum ExporterTemporalityPreference {
  Cumulative = 'cumulative',
  Delta = 'delta',
  LowMemory = 'low_memory',
}

export enum ExporterDefaultHistogramAggregation {
  Base2ExponentialBucketHistogram = 'base2_exponential_bucket_histogram',
  ExplicitBucketHistogram = 'explicit_bucket_histogram',
}

export interface View {
  /**
   * Configure view selector.
   */
  selector?: ViewSelector;

  /**
   * Configure view stream.
   */
  stream?: ViewStream;
}

export interface ViewSelector {
  /**
   * Configure instrument name selection criteria.
   * If omitted or null, all instrument names match.
   */
  instrument_name?: string;

  /**
   * Configure instrument type selection criteria.
   * Values include: counter, gauge, histogram, observable_counter, observable_gauge,
   * observable_up_down_counter, up_down_counter.
   * If omitted or null, all instrument types match.
   */
  instrument_type?: InstrumentType;

  /**
   * Configure the instrument unit selection criteria.
   * If omitted or null, all instrument units match.
   */
  unit?: string;

  /**
   * Configure meter name selection criteria.
   * If omitted or null, all meter names match.
   */
  meter_name?: string;

  /**
   * Configure meter version selection criteria.
   * If omitted or null, all meter versions match.
   */
  meter_version?: string;

  /**
   * Configure meter schema url selection criteria.
   * If omitted or null, all meter schema URLs match.
   */
  meter_schema_url?: string;
}

export enum InstrumentType {
  Counter = 'counter',
  Gauge = 'gauge',
  Histogram = 'histogram',
  ObservableCounter = 'observable_counter',
  ObservableGauge = 'observable_gauge',
  ObservableUpDownCounter = 'observable_up_down_counter',
  UpDownCounter = 'up_down_counter',
}

export interface ViewStream {
  /**
   * Configure metric name of the resulting stream(s).
   * If omitted or null, the instrument's original name is used.
   */
  name?: string;

  /**
   * Configure metric description of the resulting stream(s).
   * If omitted or null, the instrument's origin description is used.
   */
  description?: string;

  /**
   * Configure aggregation of the resulting stream(s).
   * Values include: default, drop, explicit_bucket_histogram, base2_exponential_bucket_histogram, last_value, sum.
   * If omitted, default is used.
   */
  aggregation?: Aggregation;

  /**
   * Configure the aggregation cardinality limit.
   * If omitted or null, the metric reader's default cardinality limit is used.
   */
  aggregation_cardinality_limit?: number;

  /**
   * Configure attribute keys retained in the resulting stream(s).
   */
  attribute_keys?: IncludeExclude;
}

export interface Aggregation {
  /**
   * Configure aggregation to be default.
   */
  default?: object;

  /**
   * Configure aggregation to be drop.
   */
  drop?: object;

  /**
   * Configure aggregation to be explicit_bucket_histogram.
   */
  explicit_bucket_histogram?: ExplicitBucketHistogramAggregation;

  /**
   * Configure aggregation to be base2_exponential_bucket_histogram.
   */
  base2_exponential_bucket_histogram?: Base2ExponentialBucketHistogramAggregation;

  /**
   * Configure aggregation to be last_value.
   */
  last_value?: object;

  /**
   * Configure aggregation to be sum.
   */
  sum?: object;
}

export interface ExplicitBucketHistogramAggregation {
  /**
   * Configure bucket boundaries.
   * If omitted, [0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10000] is used.
   */
  boundaries?: number[];

  /**
   * Configure record min and max.
   * If omitted or null, true is used.
   */
  record_min_max?: boolean;
}

export interface Base2ExponentialBucketHistogramAggregation {
  /**
   * Configure max_scale.
   */
  max_scale?: number;

  /**
   * Configure max_size.
   */
  max_size?: number;

  /**
   * Configure record min and max.
   * If omitted or null, true is used.
   */
  record_min_max?: boolean;
}

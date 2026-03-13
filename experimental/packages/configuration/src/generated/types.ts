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

// AUTO-GENERATED — do not edit
// Generated from opentelemetry-configuration JSON schema
// Run `npm run generate:config` from the configuration package to regenerate
import type { z } from 'zod';
import { OpenTelemetryConfigurationSchema } from './opentelemetry-configuration';

export type DefaultAggregation = {} | null;

export type DropAggregation = {} | null;

export type ExplicitBucketHistogramAggregation = {
  boundaries?: Array<number>;
  record_min_max?: boolean | null;
} | null;

export type Base2ExponentialBucketHistogramAggregation = {
  max_scale?: number | null;
  max_size?: number | null;
  record_min_max?: boolean | null;
} | null;

export type LastValueAggregation = {} | null;

export type SumAggregation = {} | null;

export interface Aggregation {
  default?: DefaultAggregation;
  drop?: DropAggregation;
  explicit_bucket_histogram?: ExplicitBucketHistogramAggregation;
  base2_exponential_bucket_histogram?: Base2ExponentialBucketHistogramAggregation;
  last_value?: LastValueAggregation;
  sum?: SumAggregation;
}

export type AlwaysOffSampler = {} | null;

export type AlwaysOnSampler = {} | null;

export interface AttributeLimits {
  attribute_value_length_limit?: number | null;
  attribute_count_limit?: number | null;
}

export type AttributeType = "string" | "bool" | "int" | "double" | "string_array" | "bool_array" | "int_array" | "double_array";

export interface AttributeNameValue {
  name: string;
  value: string | number | boolean | null | Array<string> | Array<boolean> | Array<number>;
  type?: AttributeType;
}

export type B3MultiPropagator = {} | null;

export type B3Propagator = {} | null;

export type BaggagePropagator = {} | null;

export type HttpTls = {
  ca_file?: string | null;
  key_file?: string | null;
  cert_file?: string | null;
} | null;

export interface NameStringValuePair {
  name: string;
  value: string | null;
}

export type OtlpHttpEncoding = "protobuf" | "json";

export type OtlpHttpExporter = {
  endpoint?: string | null;
  tls?: HttpTls;
  headers?: Array<NameStringValuePair>;
  headers_list?: string | null;
  compression?: string | null;
  timeout?: number | null;
  encoding?: OtlpHttpEncoding;
} | null;

export type GrpcTls = {
  ca_file?: string | null;
  key_file?: string | null;
  cert_file?: string | null;
  insecure?: boolean | null;
} | null;

export type OtlpGrpcExporter = {
  endpoint?: string | null;
  tls?: GrpcTls;
  headers?: Array<NameStringValuePair>;
  headers_list?: string | null;
  compression?: string | null;
  timeout?: number | null;
} | null;

export type ExperimentalOtlpFileExporter = {
  output_stream?: string | null;
} | null;

export type ConsoleExporter = {} | null;

export interface LogRecordExporter {
  otlp_http?: OtlpHttpExporter;
  otlp_grpc?: OtlpGrpcExporter;
  'otlp_file/development'?: ExperimentalOtlpFileExporter;
  console?: ConsoleExporter;
  [key: string]: unknown;
}

export interface BatchLogRecordProcessor {
  schedule_delay?: number | null;
  export_timeout?: number | null;
  max_queue_size?: number | null;
  max_export_batch_size?: number | null;
  exporter: LogRecordExporter;
}

export interface SpanExporter {
  otlp_http?: OtlpHttpExporter;
  otlp_grpc?: OtlpGrpcExporter;
  'otlp_file/development'?: ExperimentalOtlpFileExporter;
  console?: ConsoleExporter;
  [key: string]: unknown;
}

export interface BatchSpanProcessor {
  schedule_delay?: number | null;
  export_timeout?: number | null;
  max_queue_size?: number | null;
  max_export_batch_size?: number | null;
  exporter: SpanExporter;
}

export interface CardinalityLimits {
  default?: number | null;
  counter?: number | null;
  gauge?: number | null;
  histogram?: number | null;
  observable_counter?: number | null;
  observable_gauge?: number | null;
  observable_up_down_counter?: number | null;
  up_down_counter?: number | null;
}

export type ExporterTemporalityPreference = "cumulative" | "delta" | "low_memory";

export type ExporterDefaultHistogramAggregation = "explicit_bucket_histogram" | "base2_exponential_bucket_histogram";

export type ConsoleMetricExporter = {
  temporality_preference?: ExporterTemporalityPreference;
  default_histogram_aggregation?: ExporterDefaultHistogramAggregation;
} | null;

export interface Distribution {
  [key: string]: unknown;
}

export type ExemplarFilter = "always_on" | "always_off" | "trace_based";

export type ExperimentalComposableAlwaysOffSampler = {} | null;

export type ExperimentalComposableAlwaysOnSampler = {} | null;

export type ExperimentalComposableProbabilitySampler = {
  ratio?: number | null;
} | null;

export interface ExperimentalComposableRuleBasedSamplerRuleAttributeValues {
  key: string;
  values: Array<string>;
}

export interface ExperimentalComposableRuleBasedSamplerRuleAttributePatterns {
  key: string;
  included?: Array<string>;
  excluded?: Array<string>;
}

export type SpanKind = "internal" | "server" | "client" | "producer" | "consumer";

export type ExperimentalSpanParent = "none" | "remote" | "local";

export interface ExperimentalComposableRuleBasedSamplerRule {
  attribute_values?: ExperimentalComposableRuleBasedSamplerRuleAttributeValues;
  attribute_patterns?: ExperimentalComposableRuleBasedSamplerRuleAttributePatterns;
  span_kinds?: Array<SpanKind>;
  parent?: Array<ExperimentalSpanParent>;
  sampler: ExperimentalComposableSampler;
}

export type ExperimentalComposableRuleBasedSampler = {
  rules?: Array<ExperimentalComposableRuleBasedSamplerRule> | null;
} | null;

export interface ExperimentalComposableSampler {
  always_off?: ExperimentalComposableAlwaysOffSampler;
  always_on?: ExperimentalComposableAlwaysOnSampler;
  parent_threshold?: ExperimentalComposableParentThresholdSampler;
  probability?: ExperimentalComposableProbabilitySampler;
  rule_based?: ExperimentalComposableRuleBasedSampler;
  [key: string]: unknown;
}

export interface ExperimentalComposableParentThresholdSampler {
  root: ExperimentalComposableSampler;
}

export type ExperimentalContainerResourceDetector = {} | null;

export interface ExperimentalPeerServiceMapping {
  peer: string;
  service: string;
}

export interface ExperimentalPeerInstrumentation {
  service_mapping?: Array<ExperimentalPeerServiceMapping>;
}

export interface ExperimentalHttpClientInstrumentation {
  request_captured_headers?: Array<string>;
  response_captured_headers?: Array<string>;
}

export interface ExperimentalHttpServerInstrumentation {
  request_captured_headers?: Array<string>;
  response_captured_headers?: Array<string>;
}

export interface ExperimentalHttpInstrumentation {
  client?: ExperimentalHttpClientInstrumentation;
  server?: ExperimentalHttpServerInstrumentation;
}

export interface ExperimentalGeneralInstrumentation {
  peer?: ExperimentalPeerInstrumentation;
  http?: ExperimentalHttpInstrumentation;
}

export type ExperimentalHostResourceDetector = {} | null;

export interface ExperimentalLanguageSpecificInstrumentation {
  [key: string]: unknown;
}

export interface ExperimentalInstrumentation {
  general?: ExperimentalGeneralInstrumentation;
  cpp?: ExperimentalLanguageSpecificInstrumentation;
  dotnet?: ExperimentalLanguageSpecificInstrumentation;
  erlang?: ExperimentalLanguageSpecificInstrumentation;
  go?: ExperimentalLanguageSpecificInstrumentation;
  java?: ExperimentalLanguageSpecificInstrumentation;
  js?: ExperimentalLanguageSpecificInstrumentation;
  php?: ExperimentalLanguageSpecificInstrumentation;
  python?: ExperimentalLanguageSpecificInstrumentation;
  ruby?: ExperimentalLanguageSpecificInstrumentation;
  rust?: ExperimentalLanguageSpecificInstrumentation;
  swift?: ExperimentalLanguageSpecificInstrumentation;
}

export type ExperimentalProbabilitySampler = {
  ratio?: number | null;
} | null;

export type TraceIdRatioBasedSampler = {
  ratio?: number | null;
} | null;

export type ParentBasedSampler = {
  root?: Sampler;
  remote_parent_sampled?: Sampler;
  remote_parent_not_sampled?: Sampler;
  local_parent_sampled?: Sampler;
  local_parent_not_sampled?: Sampler;
} | null;

export interface Sampler {
  always_off?: AlwaysOffSampler;
  always_on?: AlwaysOnSampler;
  'composite/development'?: ExperimentalComposableSampler;
  'jaeger_remote/development'?: ExperimentalJaegerRemoteSampler;
  parent_based?: ParentBasedSampler;
  'probability/development'?: ExperimentalProbabilitySampler;
  trace_id_ratio_based?: TraceIdRatioBasedSampler;
  [key: string]: unknown;
}

export type ExperimentalJaegerRemoteSampler = {
  endpoint: string;
  interval?: number | null;
  initial_sampler: Sampler;
} | null;

export type SeverityNumber = "trace" | "trace2" | "trace3" | "trace4" | "debug" | "debug2" | "debug3" | "debug4" | "info" | "info2" | "info3" | "info4" | "warn" | "warn2" | "warn3" | "warn4" | "error" | "error2" | "error3" | "error4" | "fatal" | "fatal2" | "fatal3" | "fatal4";

export interface ExperimentalLoggerConfig {
  disabled?: boolean | null;
  minimum_severity?: SeverityNumber;
  trace_based?: boolean | null;
}

export interface ExperimentalLoggerMatcherAndConfig {
  name: string;
  config: ExperimentalLoggerConfig;
}

export interface ExperimentalLoggerConfigurator {
  default_config?: ExperimentalLoggerConfig;
  loggers?: Array<ExperimentalLoggerMatcherAndConfig>;
}

export interface ExperimentalMeterConfig {
  disabled?: boolean;
}

export interface ExperimentalMeterMatcherAndConfig {
  name: string;
  config: ExperimentalMeterConfig;
}

export interface ExperimentalMeterConfigurator {
  default_config?: ExperimentalMeterConfig;
  meters?: Array<ExperimentalMeterMatcherAndConfig>;
}

export type ExperimentalOtlpFileMetricExporter = {
  output_stream?: string | null;
  temporality_preference?: ExporterTemporalityPreference;
  default_histogram_aggregation?: ExporterDefaultHistogramAggregation;
} | null;

export type ExperimentalProcessResourceDetector = {} | null;

export interface IncludeExclude {
  included?: Array<string>;
  excluded?: Array<string>;
}

export type ExperimentalPrometheusTranslationStrategy = "underscore_escaping_with_suffixes" | "underscore_escaping_without_suffixes" | "no_utf8_escaping_with_suffixes" | "no_translation";

export type ExperimentalPrometheusMetricExporter = {
  host?: string | null;
  port?: number | null;
  without_scope_info?: boolean | null;
  without_target_info?: boolean | null;
  with_resource_constant_labels?: IncludeExclude;
  translation_strategy?: ExperimentalPrometheusTranslationStrategy;
} | null;

export type ExperimentalServiceResourceDetector = {} | null;

export interface ExperimentalResourceDetector {
  container?: ExperimentalContainerResourceDetector;
  host?: ExperimentalHostResourceDetector;
  process?: ExperimentalProcessResourceDetector;
  service?: ExperimentalServiceResourceDetector;
  [key: string]: unknown;
}

export interface ExperimentalResourceDetection {
  attributes?: IncludeExclude;
  detectors?: Array<ExperimentalResourceDetector>;
}

export interface ExperimentalTracerConfig {
  disabled?: boolean;
}

export interface ExperimentalTracerMatcherAndConfig {
  name: string;
  config: ExperimentalTracerConfig;
}

export interface ExperimentalTracerConfigurator {
  default_config?: ExperimentalTracerConfig;
  tracers?: Array<ExperimentalTracerMatcherAndConfig>;
}

export type InstrumentType = "counter" | "gauge" | "histogram" | "observable_counter" | "observable_gauge" | "observable_up_down_counter" | "up_down_counter";

export type JaegerPropagator = {} | null;

export interface SimpleLogRecordProcessor {
  exporter: LogRecordExporter;
}

export interface LogRecordProcessor {
  batch?: BatchLogRecordProcessor;
  simple?: SimpleLogRecordProcessor;
  [key: string]: unknown;
}

export interface LogRecordLimits {
  attribute_value_length_limit?: number | null;
  attribute_count_limit?: number | null;
}

export interface LoggerProvider {
  processors: Array<LogRecordProcessor>;
  limits?: LogRecordLimits;
  'logger_configurator/development'?: ExperimentalLoggerConfigurator;
}

export type OtlpHttpMetricExporter = {
  endpoint?: string | null;
  tls?: HttpTls;
  headers?: Array<NameStringValuePair>;
  headers_list?: string | null;
  compression?: string | null;
  timeout?: number | null;
  encoding?: OtlpHttpEncoding;
  temporality_preference?: ExporterTemporalityPreference;
  default_histogram_aggregation?: ExporterDefaultHistogramAggregation;
} | null;

export type OtlpGrpcMetricExporter = {
  endpoint?: string | null;
  tls?: GrpcTls;
  headers?: Array<NameStringValuePair>;
  headers_list?: string | null;
  compression?: string | null;
  timeout?: number | null;
  temporality_preference?: ExporterTemporalityPreference;
  default_histogram_aggregation?: ExporterDefaultHistogramAggregation;
} | null;

export interface PushMetricExporter {
  otlp_http?: OtlpHttpMetricExporter;
  otlp_grpc?: OtlpGrpcMetricExporter;
  'otlp_file/development'?: ExperimentalOtlpFileMetricExporter;
  console?: ConsoleMetricExporter;
  [key: string]: unknown;
}

export type OpenCensusMetricProducer = {} | null;

export interface MetricProducer {
  opencensus?: OpenCensusMetricProducer;
  [key: string]: unknown;
}

export interface PeriodicMetricReader {
  interval?: number | null;
  timeout?: number | null;
  exporter: PushMetricExporter;
  producers?: Array<MetricProducer>;
  cardinality_limits?: CardinalityLimits;
}

export interface PullMetricExporter {
  'prometheus/development'?: ExperimentalPrometheusMetricExporter;
  [key: string]: unknown;
}

export interface PullMetricReader {
  exporter: PullMetricExporter;
  producers?: Array<MetricProducer>;
  cardinality_limits?: CardinalityLimits;
}

export interface MetricReader {
  periodic?: PeriodicMetricReader;
  pull?: PullMetricReader;
}

export interface ViewSelector {
  instrument_name?: string | null;
  instrument_type?: InstrumentType;
  unit?: string | null;
  meter_name?: string | null;
  meter_version?: string | null;
  meter_schema_url?: string | null;
}

export interface ViewStream {
  name?: string | null;
  description?: string | null;
  aggregation?: Aggregation;
  aggregation_cardinality_limit?: number | null;
  attribute_keys?: IncludeExclude;
}

export interface View {
  selector: ViewSelector;
  stream: ViewStream;
}

export interface MeterProvider {
  readers: Array<MetricReader>;
  views?: Array<View>;
  exemplar_filter?: ExemplarFilter;
  'meter_configurator/development'?: ExperimentalMeterConfigurator;
}

export type OpenTracingPropagator = {} | null;

export type TraceContextPropagator = {} | null;

export interface TextMapPropagator {
  tracecontext?: TraceContextPropagator;
  baggage?: BaggagePropagator;
  b3?: B3Propagator;
  b3multi?: B3MultiPropagator;
  jaeger?: JaegerPropagator;
  ottrace?: OpenTracingPropagator;
  [key: string]: unknown;
}

export interface Propagator {
  composite?: Array<TextMapPropagator>;
  composite_list?: string | null;
}

export interface Resource {
  attributes?: Array<AttributeNameValue>;
  'detection/development'?: ExperimentalResourceDetection;
  schema_url?: string | null;
  attributes_list?: string | null;
}

export interface SimpleSpanProcessor {
  exporter: SpanExporter;
}

export interface SpanLimits {
  attribute_value_length_limit?: number | null;
  attribute_count_limit?: number | null;
  event_count_limit?: number | null;
  link_count_limit?: number | null;
  event_attribute_count_limit?: number | null;
  link_attribute_count_limit?: number | null;
}

export interface SpanProcessor {
  batch?: BatchSpanProcessor;
  simple?: SimpleSpanProcessor;
  [key: string]: unknown;
}

export interface TracerProvider {
  processors: Array<SpanProcessor>;
  limits?: SpanLimits;
  sampler?: Sampler;
  'tracer_configurator/development'?: ExperimentalTracerConfigurator;
}

export interface Configuration {
  file_format: string;
  disabled?: boolean | null;
  log_level?: SeverityNumber;
  attribute_limits?: AttributeLimits;
  logger_provider?: LoggerProvider;
  meter_provider?: MeterProvider;
  propagator?: Propagator;
  tracer_provider?: TracerProvider;
  resource?: Resource;
  'instrumentation/development'?: ExperimentalInstrumentation;
  distribution?: Distribution;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ConfigurationSchema: z.ZodType<Configuration> = OpenTelemetryConfigurationSchema as z.ZodType<Configuration>;

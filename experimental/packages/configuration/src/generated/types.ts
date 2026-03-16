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
  record_min_max?: null | boolean;
} | null;

export type Base2ExponentialBucketHistogramAggregation = {
  max_scale?: null | number;
  max_size?: null | number;
  record_min_max?: null | boolean;
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
  attribute_value_length_limit?: null | number;
  attribute_count_limit?: null | number;
}

export const AttributeType = {
  String: "string",
  Bool: "bool",
  Int: "int",
  Double: "double",
  StringArray: "string_array",
  BoolArray: "bool_array",
  IntArray: "int_array",
  DoubleArray: "double_array",
} as const;
export type AttributeType = typeof AttributeType[keyof typeof AttributeType];

export interface AttributeNameValue {
  name: string;
  value: string | number | boolean | null | Array<string> | Array<boolean> | Array<number>;
  type?: AttributeType;
}

export type B3MultiPropagator = {} | null;

export type B3Propagator = {} | null;

export type BaggagePropagator = {} | null;

export type HttpTls = {
  ca_file?: null | string;
  key_file?: null | string;
  cert_file?: null | string;
} | null;

export interface NameStringValuePair {
  name: string;
  value: null | string;
}

export const OtlpHttpEncoding = {
  Protobuf: "protobuf",
  Json: "json",
} as const;
export type OtlpHttpEncoding = typeof OtlpHttpEncoding[keyof typeof OtlpHttpEncoding];

export type OtlpHttpExporter = {
  endpoint?: null | string;
  tls?: HttpTls;
  headers?: Array<NameStringValuePair>;
  headers_list?: null | string;
  compression?: null | string;
  timeout?: null | number;
  encoding?: OtlpHttpEncoding;
} | null;

export type GrpcTls = {
  ca_file?: null | string;
  key_file?: null | string;
  cert_file?: null | string;
  insecure?: null | boolean;
} | null;

export type OtlpGrpcExporter = {
  endpoint?: null | string;
  tls?: GrpcTls;
  headers?: Array<NameStringValuePair>;
  headers_list?: null | string;
  compression?: null | string;
  timeout?: null | number;
} | null;

export type ExperimentalOtlpFileExporter = {
  output_stream?: null | string;
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
  schedule_delay?: null | number;
  export_timeout?: null | number;
  max_queue_size?: null | number;
  max_export_batch_size?: null | number;
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
  schedule_delay?: null | number;
  export_timeout?: null | number;
  max_queue_size?: null | number;
  max_export_batch_size?: null | number;
  exporter: SpanExporter;
}

export interface CardinalityLimits {
  default?: null | number;
  counter?: null | number;
  gauge?: null | number;
  histogram?: null | number;
  observable_counter?: null | number;
  observable_gauge?: null | number;
  observable_up_down_counter?: null | number;
  up_down_counter?: null | number;
}

export const ExporterTemporalityPreference = {
  Cumulative: "cumulative",
  Delta: "delta",
  LowMemory: "low_memory",
} as const;
export type ExporterTemporalityPreference = typeof ExporterTemporalityPreference[keyof typeof ExporterTemporalityPreference];

export const ExporterDefaultHistogramAggregation = {
  ExplicitBucketHistogram: "explicit_bucket_histogram",
  Base2ExponentialBucketHistogram: "base2_exponential_bucket_histogram",
} as const;
export type ExporterDefaultHistogramAggregation = typeof ExporterDefaultHistogramAggregation[keyof typeof ExporterDefaultHistogramAggregation];

export type ConsoleMetricExporter = {
  temporality_preference?: ExporterTemporalityPreference;
  default_histogram_aggregation?: ExporterDefaultHistogramAggregation;
} | null;

export interface Distribution {
  [key: string]: unknown;
}

export const ExemplarFilter = {
  AlwaysOn: "always_on",
  AlwaysOff: "always_off",
  TraceBased: "trace_based",
} as const;
export type ExemplarFilter = typeof ExemplarFilter[keyof typeof ExemplarFilter];

export type ExperimentalComposableAlwaysOffSampler = {} | null;

export type ExperimentalComposableAlwaysOnSampler = {} | null;

export type ExperimentalComposableProbabilitySampler = {
  ratio?: null | number;
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

export const SpanKind = {
  Internal: "internal",
  Server: "server",
  Client: "client",
  Producer: "producer",
  Consumer: "consumer",
} as const;
export type SpanKind = typeof SpanKind[keyof typeof SpanKind];

export const ExperimentalSpanParent = {
  None: "none",
  Remote: "remote",
  Local: "local",
} as const;
export type ExperimentalSpanParent = typeof ExperimentalSpanParent[keyof typeof ExperimentalSpanParent];

export interface ExperimentalComposableRuleBasedSamplerRule {
  attribute_values?: ExperimentalComposableRuleBasedSamplerRuleAttributeValues;
  attribute_patterns?: ExperimentalComposableRuleBasedSamplerRuleAttributePatterns;
  span_kinds?: Array<SpanKind>;
  parent?: Array<ExperimentalSpanParent>;
  sampler: ExperimentalComposableSampler;
}

export type ExperimentalComposableRuleBasedSampler = {
  rules?: null | Array<ExperimentalComposableRuleBasedSamplerRule>;
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
  ratio?: null | number;
} | null;

export type TraceIdRatioBasedSampler = {
  ratio?: null | number;
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
  interval?: null | number;
  initial_sampler: Sampler;
} | null;

export const SeverityNumber = {
  Trace: "trace",
  Trace2: "trace2",
  Trace3: "trace3",
  Trace4: "trace4",
  Debug: "debug",
  Debug2: "debug2",
  Debug3: "debug3",
  Debug4: "debug4",
  Info: "info",
  Info2: "info2",
  Info3: "info3",
  Info4: "info4",
  Warn: "warn",
  Warn2: "warn2",
  Warn3: "warn3",
  Warn4: "warn4",
  Error: "error",
  Error2: "error2",
  Error3: "error3",
  Error4: "error4",
  Fatal: "fatal",
  Fatal2: "fatal2",
  Fatal3: "fatal3",
  Fatal4: "fatal4",
} as const;
export type SeverityNumber = typeof SeverityNumber[keyof typeof SeverityNumber];

export interface ExperimentalLoggerConfig {
  disabled?: null | boolean;
  minimum_severity?: SeverityNumber;
  trace_based?: null | boolean;
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
  output_stream?: null | string;
  temporality_preference?: ExporterTemporalityPreference;
  default_histogram_aggregation?: ExporterDefaultHistogramAggregation;
} | null;

export type ExperimentalProcessResourceDetector = {} | null;

export interface IncludeExclude {
  included?: Array<string>;
  excluded?: Array<string>;
}

export const ExperimentalPrometheusTranslationStrategy = {
  UnderscoreEscapingWithSuffixes: "underscore_escaping_with_suffixes",
  UnderscoreEscapingWithoutSuffixes: "underscore_escaping_without_suffixes",
  NoUtf8EscapingWithSuffixes: "no_utf8_escaping_with_suffixes",
  NoTranslation: "no_translation",
} as const;
export type ExperimentalPrometheusTranslationStrategy = typeof ExperimentalPrometheusTranslationStrategy[keyof typeof ExperimentalPrometheusTranslationStrategy];

export type ExperimentalPrometheusMetricExporter = {
  host?: null | string;
  port?: null | number;
  without_scope_info?: null | boolean;
  without_target_info?: null | boolean;
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

export const InstrumentType = {
  Counter: "counter",
  Gauge: "gauge",
  Histogram: "histogram",
  ObservableCounter: "observable_counter",
  ObservableGauge: "observable_gauge",
  ObservableUpDownCounter: "observable_up_down_counter",
  UpDownCounter: "up_down_counter",
} as const;
export type InstrumentType = typeof InstrumentType[keyof typeof InstrumentType];

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
  attribute_value_length_limit?: null | number;
  attribute_count_limit?: null | number;
}

export interface LoggerProvider {
  processors: Array<LogRecordProcessor>;
  limits?: LogRecordLimits;
  'logger_configurator/development'?: ExperimentalLoggerConfigurator;
}

export type OtlpHttpMetricExporter = {
  endpoint?: null | string;
  tls?: HttpTls;
  headers?: Array<NameStringValuePair>;
  headers_list?: null | string;
  compression?: null | string;
  timeout?: null | number;
  encoding?: OtlpHttpEncoding;
  temporality_preference?: ExporterTemporalityPreference;
  default_histogram_aggregation?: ExporterDefaultHistogramAggregation;
} | null;

export type OtlpGrpcMetricExporter = {
  endpoint?: null | string;
  tls?: GrpcTls;
  headers?: Array<NameStringValuePair>;
  headers_list?: null | string;
  compression?: null | string;
  timeout?: null | number;
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
  interval?: null | number;
  timeout?: null | number;
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
  instrument_name?: null | string;
  instrument_type?: InstrumentType;
  unit?: null | string;
  meter_name?: null | string;
  meter_version?: null | string;
  meter_schema_url?: null | string;
}

export interface ViewStream {
  name?: null | string;
  description?: null | string;
  aggregation?: Aggregation;
  aggregation_cardinality_limit?: null | number;
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
  composite_list?: null | string;
}

export interface Resource {
  attributes?: Array<AttributeNameValue>;
  'detection/development'?: ExperimentalResourceDetection;
  schema_url?: null | string;
  attributes_list?: null | string;
}

export interface SimpleSpanProcessor {
  exporter: SpanExporter;
}

export interface SpanLimits {
  attribute_value_length_limit?: null | number;
  attribute_count_limit?: null | number;
  event_count_limit?: null | number;
  link_count_limit?: null | number;
  event_attribute_count_limit?: null | number;
  link_attribute_count_limit?: null | number;
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
  disabled?: null | boolean;
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

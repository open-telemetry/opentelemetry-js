/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Naming convention for types exported from this package: configuration
// types use the `ConfigModel` suffix (e.g. `SamplerConfigModel`) rather than
// their schema name (e.g. `Sampler`) so that they don't collide with the SDK
// runtime types of the same name. Internally the package uses the schema
// names from `./generated/types`; the renaming happens at export time here.
// Follow this convention when adding new exports.

export type { ConfigFactory } from './IConfigFactory';
export type {
  ConfigurationModel,
  LogRecordExporter as LogRecordExporterConfigModel,
  PushMetricExporter as PushMetricExporterConfigModel,
  OtlpHttpMetricExporter as OtlpHttpMetricExporterConfigModel,
  OtlpGrpcMetricExporter as OtlpGrpcMetricExporterConfigModel,
  InstrumentType as InstrumentTypeConfigModel,
  Aggregation as AggregationConfigModel,
  PeriodicMetricReader as PeriodicMetricReaderConfigModel,
  Sampler as SamplerConfigModel,
  SpanExporter as SpanExporterConfigModel,
  SpanProcessor as SpanProcessorConfigModel,
  SpanLimits as SpanLimitsConfigModel,
  MetricProducer as MetricProducerConfigModel,
  NameStringValuePair as NameStringValuePairConfigModel,
  HttpTls as HttpTlsConfigModel,
  GrpcTls as GrpcTlsConfigModel,
  IdGenerator as IdGeneratorConfigModel,
  SeverityNumber as SeverityNumberConfigModel,
  TextMapPropagator as TextMapPropagatorConfigModel,
  LoggerProvider as LoggerProviderConfigModel,
  AttributeLimits as AttributeLimitsConfigModel,
  LogRecordProcessor as LogRecordProcessorConfigModel,
  BatchLogRecordProcessor as BatchLogRecordProcessorConfigModel,
  SimpleLogRecordProcessor as SimpleLogRecordProcessorConfigModel,
  OtlpHttpExporter as OtlpHttpExporterConfigModel,
  OtlpGrpcExporter as OtlpGrpcExporterConfigModel,
  LogRecordLimits as LogRecordLimitsConfigModel,
  Propagator as PropagatorConfigModel,
  MeterProvider as MeterProviderConfigModel,
  MetricReader as MetricReaderConfigModel,
  ExporterTemporalityPreference as ExporterTemporalityPreferenceConfigModel,
  ExporterDefaultHistogramAggregation as ExporterDefaultHistogramAggregationConfigModel,
  ConsoleMetricExporter as ConsoleMetricExporterConfigModel,
  PullMetricReader as PullMetricReaderConfigModel,
  PullMetricExporter as PullMetricExporterConfigModel,
  ExperimentalPrometheusMetricExporter as ExperimentalPrometheusMetricExporterConfigModel,
  View as ViewConfigModel,
  ExplicitBucketHistogramAggregation as ExplicitBucketHistogramAggregationConfigModel,
  Base2ExponentialBucketHistogramAggregation as Base2ExponentialBucketHistogramAggregationConfigModel,
  TracerProvider as TracerProviderConfigModel,
  BatchSpanProcessor as BatchSpanProcessorConfigModel,
  SimpleSpanProcessor as SimpleSpanProcessorConfigModel,
  TraceIdRatioBasedSampler as TraceIdRatioBasedSamplerConfigModel,
  ParentBasedSampler as ParentBasedSamplerConfigModel,
} from './generated/types';
export { createConfigFactory } from './ConfigFactory';
export {
  mergeResourceAttributesConfig,
  mergePropagatorCompositeConfig,
} from './FileConfigFactory';

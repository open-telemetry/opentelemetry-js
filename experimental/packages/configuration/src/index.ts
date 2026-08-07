/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

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
  Resource as ResourceConfigModel,
} from './generated/types';
export { createConfigFactory } from './ConfigFactory';
export {
  mergeResourceAttributesConfig,
  mergePropagatorCompositeConfig,
} from './FileConfigFactory';

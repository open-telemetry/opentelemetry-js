/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export type { ConfigFactory } from './IConfigFactory';
export type {
  ConfigurationModel,
  LogRecordExporter as LogRecordExporterConfigModel,
  PushMetricExporter as PushMetricExporterConfigModel,
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
} from './generated/types';
export { createConfigFactory } from './ConfigFactory';
export {
  mergeResourceAttributesConfig,
  mergePropagatorCompositeConfig,
} from './FileConfigFactory';

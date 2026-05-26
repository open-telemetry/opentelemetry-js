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
  NameStringValuePair as NameStringValuePairConfigModel,
  HttpTls as HttpTlsConfigModel,
  GrpcTls as GrpcTlsConfigModel,
  SeverityNumber as SeverityNumberConfigModel,
  OtlpHttpExporter as OtlpHttpExporterConfigModel,
  OtlpGrpcExporter as OtlpGrpcExporterConfigModel,
  OtlpHttpMetricExporter as OtlpHttpMetricExporterConfigModel,
  OtlpGrpcMetricExporter as OtlpGrpcMetricExporterConfigModel,
  ConsoleExporter as ConsoleExporterConfigModel,
  ConsoleMetricExporter as ConsoleMetricExporterConfigModel,
} from './generated/types';
export { createConfigFactory } from './ConfigFactory';

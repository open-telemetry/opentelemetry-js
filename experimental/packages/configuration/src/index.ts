/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export type { ConfigFactory } from './IConfigFactory';
export type { ConfigurationModel } from './generated/types';
export type { LogRecordExporter as LogRecordExporterConfigModel } from './generated/types';
export type {
  PushMetricExporter as PushMetricExporterConfigModel,
  InstrumentType as InstrumentTypeConfigModel,
  Aggregation as AggregationConfigModel,
  PeriodicMetricReader as PeriodicMetricReaderConfigModel,
  SpanExporter as SpanExporterConfigModel,
  SpanProcessor as SpanProcessorConfigModel,
} from './generated/types';
export { createConfigFactory } from './ConfigFactory';

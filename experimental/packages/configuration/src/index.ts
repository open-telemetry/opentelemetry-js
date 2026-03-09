/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export type { ConfigFactory } from './IConfigFactory';
export type { ConfigurationModel } from './models/configModel';
export type { LogRecordExporter as LogRecordExporterModel } from './models/loggerProviderModel';
export type { PushMetricExporter as MeterExporterModel } from './models/meterProviderModel';
export type { SpanExporter as SpanExporterModel } from './models/tracerProviderModel';
export { createConfigFactory } from './ConfigFactory';

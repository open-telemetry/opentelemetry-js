/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { z } from 'zod';
import type { LogRecordExporterSchema } from './generated/opentelemetry-configuration';

export type { ConfigFactory } from './IConfigFactory';
export type { ConfigurationModel } from './generated/types';
export { createConfigFactory } from './ConfigFactory';

/** @deprecated Use ConfigurationModel instead. Kept for backward compatibility. */
export type { ConfigurationModel as Configuration } from './generated/types';
export type { InstrumentType as InstrumentTypeConfigModel } from './generated/types';
export type { Aggregation as AggregationConfigModel } from './generated/types';
export type { PeriodicMetricReader as PeriodicMetricReaderConfigModel } from './generated/types';

/** Type for a log record exporter configuration object (replaces LogRecordExporterModel). */
export type LogRecordExporterConfiguration = z.infer<
  typeof LogRecordExporterSchema
>;

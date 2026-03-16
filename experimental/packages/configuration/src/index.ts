/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { z } from 'zod';
import type { LogRecordExporterSchema } from './generated/opentelemetry-configuration';

export type { ConfigFactory } from './IConfigFactory';
export type { Configuration } from './generated/types';
export { createConfigFactory } from './ConfigFactory';

/** @deprecated Use Configuration instead. Kept for backward compatibility. */
export type { Configuration as ConfigurationModel } from './generated/types';

/** Type for a log record exporter configuration object (replaces LogRecordExporterModel). */
export type LogRecordExporterConfiguration = z.infer<
  typeof LogRecordExporterSchema
>;

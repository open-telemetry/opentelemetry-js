/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MeterProvider } from '@opentelemetry/api';

/**
 * Common options for SDK log record processors.
 */
export interface LogRecordProcessorConfig {
  meterProvider?: MeterProvider;
}

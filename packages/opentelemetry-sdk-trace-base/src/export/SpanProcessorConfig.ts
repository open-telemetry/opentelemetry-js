/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MeterProvider } from '@opentelemetry/api';

/**
 * Common options for SDK span processors.
 */
export interface SpanProcessorConfig {
  meterProvider?: MeterProvider;
}

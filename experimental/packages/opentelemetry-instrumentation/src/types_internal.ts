/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TracerProvider, MeterProvider } from '@opentelemetry/api';
import type { Instrumentation } from './types';
import type { LoggerProvider } from '@opentelemetry/api-logs';

export interface AutoLoaderResult {
  instrumentations: Instrumentation[];
}

export interface AutoLoaderOptions {
  instrumentations?: (Instrumentation | Instrumentation[])[];
  tracerProvider?: TracerProvider;
  meterProvider?: MeterProvider;
  loggerProvider?: LoggerProvider;
}

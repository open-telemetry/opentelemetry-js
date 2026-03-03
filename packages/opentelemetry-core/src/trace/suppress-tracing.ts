/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, createContextKey } from '@opentelemetry/api';

const SUPPRESS_TRACING_KEY = createContextKey(
  'OpenTelemetry SDK Context Key SUPPRESS_TRACING'
);

export function suppressTracing(context: Context): Context {
  return context.setValue(SUPPRESS_TRACING_KEY, true);
}

export function unsuppressTracing(context: Context): Context {
  return context.deleteValue(SUPPRESS_TRACING_KEY);
}

export function isTracingSuppressed(context: Context): boolean {
  return context.getValue(SUPPRESS_TRACING_KEY) === true;
}

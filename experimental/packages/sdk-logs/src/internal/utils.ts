/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { InstrumentationScope } from '@opentelemetry/core';

/**
 * Converting the instrumentation scope object to a unique identifier string.
 * @param scope - The instrumentation scope to convert
 * @returns A unique string identifier for the scope
 */
export function getInstrumentationScopeKey(
  scope: InstrumentationScope
): string {
  return `${scope.name}@${scope.version || ''}:${scope.schemaUrl || ''}`;
}

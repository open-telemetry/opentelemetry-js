/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Returns the default service name for OpenTelemetry resources.
 * Browsers have no process name, so this is always "unknown_service".
 */
export function defaultServiceName(): string {
  return 'unknown_service';
}

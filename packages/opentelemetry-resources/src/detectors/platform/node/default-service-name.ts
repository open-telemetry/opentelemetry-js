/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

let serviceName: string | undefined;

/**
 * Returns the default service name for OpenTelemetry resources:
 * "unknown_service:<process.argv0>", or "unknown_service" when the
 * process name is unavailable.
 */
export function defaultServiceName(): string {
  if (serviceName === undefined) {
    try {
      const argv0 = globalThis.process.argv0;
      serviceName = argv0 ? `unknown_service:${argv0}` : 'unknown_service';
    } catch {
      // Edge runtimes may stub process out or leave it undefined.
      serviceName = 'unknown_service';
    }
  }
  return serviceName;
}

/** @internal For testing purposes only */
export function _clearDefaultServiceNameCache(): void {
  serviceName = undefined;
}

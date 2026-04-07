/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Logger } from './Logger';
import type { LoggerOptions } from './LoggerOptions';

/**
 * A registry for creating named {@link Logger}s.
 */
export interface LoggerProvider {
  /**
   * Returns a Logger, creating one if one with the given name, version,
   * schemaUrl, and scopeAttributes is not already created.
   *
   * Getting a Logger may be expensive, especially when `scopeAttributes` are
   * provided. Reuse Logger instances where possible instead of calling
   * `getLogger()` on hot paths.
   *
   * @param name The name of the logger or instrumentation library.
   * @param version The version of the logger or instrumentation library.
   * @param options The options of the logger or instrumentation library.
   * @returns {@link Logger} A Logger with the given name and version
   */
  getLogger(name: string, version?: string, options?: LoggerOptions): Logger;
}

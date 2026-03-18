/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LogAttributes } from './LogRecord';

export interface LoggerOptions {
  /**
   * The schemaUrl of the tracer or instrumentation library
   * @default ''
   */
  schemaUrl?: string;

  /**
   * The instrumentation scope attributes to associate with emitted telemetry
   */
  scopeAttributes?: LogAttributes;
}

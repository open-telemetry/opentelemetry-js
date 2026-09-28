/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Attributes } from '@opentelemetry/api';

export interface LoggerOptions {
  /**
   * The schemaUrl of the tracer or instrumentation library
   * @default ''
   */
  schemaUrl?: string;

  /**
   * The instrumentation scope attributes to associate with emitted telemetry.
   * These attributes also participate in logger identity.
   *
   * Only "simple" value types are supported for instrumentation scope attributes
   * (string, number, boolean, homogeneous array of these primitive types).
   * Other attribute types will be dropped.
   * See OTEP 4485 and `cleanSimpleAttributes()` in `@opentelemetry/core`.
   */
  attributes?: Attributes;
}

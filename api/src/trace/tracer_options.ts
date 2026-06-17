/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * An interface describes additional metadata of a tracer.
 *
 * @since 1.3.0
 */
export interface TracerOptions {
  /**
   * The schemaUrl of the tracer or instrumentation library
   */
  schemaUrl?: string;
}

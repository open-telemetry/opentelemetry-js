/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/** IdGenerator provides an interface for generating Trace Id and Span Id */
export interface IdGenerator {
  /** Returns a trace ID composed of 32 lowercase hex characters. */
  generateTraceId(): string;
  /** Returns a span ID composed of 16 lowercase hex characters. */
  generateSpanId(): string;
}

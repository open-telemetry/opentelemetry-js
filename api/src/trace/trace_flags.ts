/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @since 1.0.0
 */
export enum TraceFlags {
  /** Represents no flag set. */
  NONE = 0x0,
  /** Bit to represent whether trace is sampled in trace flags. */
  SAMPLED = 0x1 << 0,
}

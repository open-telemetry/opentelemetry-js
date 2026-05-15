/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AnyValue can be:
 * - a string, number, boolean value
 * - a byte array (Uint8Array)
 * - array of any value
 * - map from string to any value
 * - empty value
 *
 * https://opentelemetry.io/docs/specs/otel/common/#anyvalue
 *
 * @since 1.3.0
 */
export type AnyValue =
  | string
  | number
  | boolean
  | Uint8Array
  | Array<AnyValue>
  | AnyValueMap
  | null
  | undefined;

interface AnyValueMap {
  [attributeKey: string]: AnyValue;
}

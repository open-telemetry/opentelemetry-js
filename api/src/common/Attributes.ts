/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Attributes is a mapping from string to attribute values.
 * https://opentelemetry.io/docs/specs/otel/common/#attribute-collections
 *
 * @since 1.3.0
 */
export interface Attributes {
  [attributeKey: string]: AttributeValue | undefined;
}

/**
 * Attribute value (called AnyValue in the OpenTelemetry spec) can be:
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
export type AttributeValue =
  | string
  | number
  | boolean
  | Uint8Array
  | Array<AttributeValue>
  | AnyValueMap
  | null
  | undefined;

interface AnyValueMap {
  [attributeKey: string]: AttributeValue;
}

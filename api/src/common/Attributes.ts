/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AnyValue } from './AnyValue';

/**
 * Attributes is a mapping from string to attribute values.
 * https://opentelemetry.io/docs/specs/otel/common/#attribute-collections
 *
 * @since 1.1.0
 */
export interface Attributes {
  [attributeKey: string]: AnyValue;
}

/**
 * @since 1.1.0
 * @deprecated use AnyValue
 */
export type AttributeValue = AnyValue;

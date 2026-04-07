/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';
import type { AnyValue, LogAttributes } from '@opentelemetry/api-logs';

/**
 * Validates if a value is a valid AnyValue for Log Attributes according to OpenTelemetry spec.
 * Log Attributes support a superset of standard Attributes and must support:
 * - Scalar values: string, boolean, signed 64 bit integer, or double precision floating point
 * - Byte arrays (Uint8Array)
 * - Arrays of any values (heterogeneous arrays allowed)
 * - Maps from string to any value (nested objects)
 * - Empty values (null/undefined)
 *
 * @param val - The value to validate
 * @returns true if the value is a valid AnyValue, false otherwise
 */
export function isLogAttributeValue(val: unknown): val is AnyValue {
  return isLogAttributeValueInternal(val, new WeakSet());
}

/**
 * Sanitize attributes for use on the instrumentation scope. Drops invalid attributes and keeps track of
 * how many were dropped.
 *
 * @param attributes
 */
export function sanitizeScopeAttributes(attributes?: LogAttributes): {
  readonly attributes?: LogAttributes;
  readonly droppedAttributesCount?: number;
} {
  if (attributes == null) {
    return {};
  }

  const sanitizedAttributes: LogAttributes = {};
  let droppedAttributesCount = 0;

  for (const [key, value] of Object.entries(attributes)) {
    if (key.length === 0) {
      diag.warn(`Invalid attribute key: ${key}`);
      droppedAttributesCount++;
      continue;
    }

    if (!isLogAttributeValue(value)) {
      diag.warn(`Invalid attribute value set for key: ${key}`);
      droppedAttributesCount++;
      continue;
    }

    sanitizedAttributes[key] = value;
  }

  return {
    attributes:
      Object.keys(sanitizedAttributes).length > 0
        ? sanitizedAttributes
        : undefined,
    droppedAttributesCount,
  };
}

function isLogAttributeValueInternal(
  val: unknown,
  visited: WeakSet<object>
): val is AnyValue {
  // null and undefined are explicitly allowed
  if (val == null) {
    return true;
  }

  // Scalar values
  if (
    typeof val === 'string' ||
    typeof val === 'number' ||
    typeof val === 'boolean'
  ) {
    return true;
  }

  // Byte arrays
  if (val instanceof Uint8Array) {
    return true;
  }

  // For objects and arrays, check for circular references
  if (typeof val === 'object') {
    if (visited.has(val as object)) {
      // Circular reference detected - reject it
      return false;
    }
    visited.add(val as object);

    // Arrays (can contain any AnyValue, including heterogeneous)
    if (Array.isArray(val)) {
      return val.every(item => isLogAttributeValueInternal(item, visited));
    }

    // Only accept plain objects (not built-in objects like Date, RegExp, Error, etc.)
    // Check if it's a plain object by verifying its constructor is Object or it has no constructor
    const obj = val as Record<string, unknown>;
    if (obj.constructor !== Object && obj.constructor !== undefined) {
      return false;
    }

    // Objects/Maps (including empty objects)
    // All object properties must be valid AnyValues
    return Object.values(obj).every(item =>
      isLogAttributeValueInternal(item, visited)
    );
  }

  return false;
}

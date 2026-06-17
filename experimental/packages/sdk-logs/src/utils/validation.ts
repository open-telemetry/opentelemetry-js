/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';
import type { AnyValue, LogAttributes } from '@opentelemetry/api-logs';
import type { LogRecordLimits } from '../types';

/**
 * Validates if a value is a valid AnyValue for Log Attributes according to OpenTelemetry spec.
 * Log Attributes support a superset of standard Attributes and must support:
 * - Scalar values: string, boolean, signed 64-bit integer, or double precision floating point
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
      for (const item of val) {
        if (!isLogAttributeValueInternal(item, visited)) {
          return false;
        }
      }
      return true;
    }

    // Only accept plain objects (not built-in objects like Date, RegExp, Error, etc.)
    // Check if it's a plain object by verifying its constructor is Object or it has no constructor
    const obj = val as Record<string, unknown>;
    if (obj.constructor !== Object && obj.constructor !== undefined) {
      return false;
    }

    // Objects/Maps (including empty objects)
    // All object properties must be valid AnyValues
    for (const key in obj) {
      if (
        Object.prototype.hasOwnProperty.call(obj, key) &&
        !isLogAttributeValueInternal(obj[key], visited)
      ) {
        return false;
      }
    }
    return true;
  }

  return false;
}

export const enum AddAttributeDecision {
  DROP_INVALID = 0,
  DROP_LIMIT_REACHED = 1,
  ADD_NEW = 2,
  ADD_OVERWRITE_EXISTING = 3,
}

export function addAttribute(
  attributes: LogAttributes,
  limits: Readonly<Required<LogRecordLimits>>,
  currentAttributesCount: number,
  key: string,
  value?: AnyValue
): AddAttributeDecision {
  if (key.length === 0) {
    diag.warn(`Invalid attribute key: ${key}`);
    return AddAttributeDecision.DROP_INVALID;
  }
  if (!isLogAttributeValue(value)) {
    diag.warn(`Invalid attribute value set for key: ${key}`);
    return AddAttributeDecision.DROP_INVALID;
  }
  const isNewKey = !Object.prototype.hasOwnProperty.call(attributes, key);
  if (isNewKey && currentAttributesCount >= limits.attributeCountLimit) {
    return AddAttributeDecision.DROP_LIMIT_REACHED;
  }

  attributes[key] = truncateToSize(value, limits.attributeValueLengthLimit);
  if (isNewKey) {
    return AddAttributeDecision.ADD_NEW;
  }
  return AddAttributeDecision.ADD_OVERWRITE_EXISTING;
}

function truncateToSize(value: AnyValue, limit: number): AnyValue {
  // Check limit
  if (limit <= 0) {
    // Negative values are invalid, so do not truncate
    diag.warn(`Attribute value limit must be positive, got ${limit}`);
    return value;
  }

  // null/undefined - no truncation needed
  if (value == null) {
    return value;
  }

  // String
  if (typeof value === 'string') {
    if (value.length <= limit) {
      return value;
    }
    return value.substring(0, limit);
  }

  // Byte arrays - no truncation needed
  if (value instanceof Uint8Array) {
    return value;
  }

  // Arrays (can contain any AnyValue types)
  if (Array.isArray(value)) {
    return value.map(val => truncateToSize(val, limit));
  }

  // Objects/Maps - recursively truncate nested values
  if (typeof value === 'object') {
    const truncatedObj: Record<string, AnyValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, AnyValue>)) {
      truncatedObj[k] = truncateToSize(v, limit);
    }
    return truncatedObj;
  }

  // Other types (number, boolean), no need to apply value length limit
  return value;
}

/**
 * Normalize attributes for use on the instrumentation scope. Drops invalid attributes and keeps track of
 * how many were dropped.
 *
 * @param limits
 * @param attributes
 */
export function normalizeScopeAttributes(
  limits: Readonly<Required<LogRecordLimits>>,
  attributes?: LogAttributes
): {
  readonly attributes?: LogAttributes;
  readonly droppedAttributesCount?: number;
} {
  if (attributes == null) {
    return {};
  }

  const normalizedAttributes: LogAttributes = {};
  let currentAttributesCount = 0;
  let droppedAttributesCount = 0;

  for (const [key, value] of Object.entries(attributes)) {
    const decision = addAttribute(
      normalizedAttributes,
      limits,
      currentAttributesCount,
      key,
      value
    );

    if (decision === AddAttributeDecision.ADD_NEW) {
      currentAttributesCount += 1;
    } else if (decision === AddAttributeDecision.DROP_INVALID) {
      droppedAttributesCount += 1;
    } else if (decision === AddAttributeDecision.DROP_LIMIT_REACHED) {
      droppedAttributesCount += 1;
    } else {
      // do nothing
    }
  }

  return {
    attributes: currentAttributesCount > 0 ? normalizedAttributes : undefined,
    droppedAttributesCount,
  };
}

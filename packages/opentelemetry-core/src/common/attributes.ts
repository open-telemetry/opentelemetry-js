/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AttributeValue, Attributes } from '@opentelemetry/api';
import { diag } from '@opentelemetry/api';

/**
 * Return a valid {@link Attributes} object from the given object.
 *
 * Limitations:
 * - This does not handle attribute limits.
 *   https://opentelemetry.io/docs/specs/otel/common/#attribute-limits
 * - This makes a top-level copy of keys. Nested elements should be immutable,
 *   but this is the caller's responsibility.
 *
 * XXX Deprecate in favour of normalizeAttributes()? ddtrace uses this FWIW.
 *     Or just replace with normalizeAttributes and drop the dropped count.
 * XXX add circular ref check? Or deprecate and not bother?
 *
 * @deprecated use normalizeAttributes
 */
export function sanitizeAttributes(attributes: unknown): Attributes {
  const out: Attributes = {};

  if (typeof attributes !== 'object' || attributes == null) {
    return out;
  }

  for (const key in attributes) {
    if (!Object.hasOwn(attributes, key)) {
      continue;
    }
    if (!isAttributeKey(key)) {
      diag.warn(`Invalid attribute key: ${key}`);
      continue;
    }
    const val = (attributes as Record<string, unknown>)[key];
    if (!isAttributeValue(val)) {
      diag.warn(`Invalid attribute value set for key: ${key}`);
      continue;
    }
    if (Array.isArray(val)) {
      // XXX I think we should drop this copy.
      out[key] = val.slice();
    } else {
      out[key] = val;
    }
  }

  return out;
}

function isAttributeKey(key: unknown): key is string {
  return typeof key === 'string' && key !== '';
}

/**
 * Validates if a value is a valid AttributeValue ("AnyValue" in the spec):
 * https://opentelemetry.io/docs/specs/otel/common/#anyvalue
 *
 * This also returns false if a cicular reference is detected.
 *
 * @param val - The value to validate
 * @returns true if the value is a valid AttributeValue, false otherwise
 */
export function isAttributeValue(val: unknown): val is AttributeValue {
  return isAttributeValueInternal(val, new WeakSet());
}

function isAttributeValueInternal(
  val: unknown,
  visited: WeakSet<object>
): val is AttributeValue {
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
      return val.every(item => isAttributeValueInternal(item, visited));
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
      isAttributeValueInternal(item, visited)
    );
  }

  return false;
}

// XXX not lovin' using enums. Would prefer to stick to eraseable syntax, but no requirement for that.
//     Cannot use *const enum* at least, https://github.com/open-telemetry/opentelemetry-js/issues/5691
export enum AddAttributeDecision {
  DROP_INVALID = 0,
  DROP_LIMIT_REACHED = 1,
  ADD_NEW = 2,
  ADD_OVERWRITE_EXISTING = 3,
}

// XXX Rename to assignAttribute (a la Object.assign) perhaps? Something else?
// XXX Want a version without limits: resources and metrics are exempt: https://opentelemetry.io/docs/specs/otel/common/#exempt-entities
// XXX Having to pass around attribute count (currentAttributesCount, etc.) is a pain. Not suggesting it now, because more work, but using a Map would be nice for the API.
// XXX Consider moving diag.warn()s out to caller.
export function addAttribute(
  attributes: Attributes,
  currentAttributesCount: number,
  countLimit: number,
  valueLengthLimit: number,
  key: string,
  // XXX Marc had `value?`. Is that really necessary? https://github.com/open-telemetry/opentelemetry-js/pull/6573
  value: unknown
): AddAttributeDecision {
  if (key.length === 0) {
    diag.warn(`Invalid attribute key: ${key}`);
    return AddAttributeDecision.DROP_INVALID;
  }
  if (!isAttributeValue(value)) {
    diag.warn(`Invalid attribute value set for key: ${key}`);
    return AddAttributeDecision.DROP_INVALID;
  }
  const isNewKey = !Object.hasOwn(attributes, key);
  if (isNewKey && currentAttributesCount >= countLimit) {
    return AddAttributeDecision.DROP_LIMIT_REACHED;
  }

  // `truncateToSize` makes a copy of arrays and objects, which ensures
  // mutation of the passed in object does not impact the serialized attributes.
  attributes[key] = truncateToSize(value, valueLengthLimit);
  if (isNewKey) {
    return AddAttributeDecision.ADD_NEW;
  }
  return AddAttributeDecision.ADD_OVERWRITE_EXISTING;
}

function truncateToSize(value: AttributeValue, limit: number): AttributeValue {
  // Check limit
  // XXX move this limit check to the top-level.
  // XXX this has the subtle side-effect that a copy of arrays/objects is NOT taken
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
  // XXX wrong, spec says to truncate
  if (value instanceof Uint8Array) {
    return value;
  }

  // Arrays (can contain any AnyValue types)
  if (Array.isArray(value)) {
    return value.map(val => truncateToSize(val, limit));
  }

  // Objects/Maps - recursively truncate nested values
  if (typeof value === 'object') {
    const truncatedObj: Record<string, AttributeValue> = {};
    for (const [k, v] of Object.entries(
      value as Record<string, AttributeValue>
    )) {
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
export function normalizeAttributes(
  attributes: unknown | undefined,
  countLimit = Infinity,
  valueLengthLimit = Infinity
): {
  readonly attributes?: Attributes;
  readonly droppedAttributesCount?: number;
} {
  if (attributes == null) {
    return {};
  }

  const normalizedAttributes: Attributes = {};
  let currentAttributesCount = 0;
  let droppedAttributesCount = 0;

  for (const [key, value] of Object.entries(attributes)) {
    const decision = addAttribute(
      normalizedAttributes,
      currentAttributesCount,
      countLimit,
      valueLengthLimit,
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

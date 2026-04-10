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
 * - This does not return a number of dropped attributes, needed for
 *   handling `droppedAttributesCount` OTLP fields.
 *
 * @deprecated use normalizeAttributes
 */
export function sanitizeAttributes(obj: unknown): Attributes {
  const { attributes } = normalizeAttributes(obj);
  return attributes ?? {};
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

// XXX adapted from Marc's https://github.com/open-telemetry/opentelemetry-js/pull/6573/changes#diff-51e43be6170821a96fa159a51a1c557810feb4ba2cf6f5c9a13ca365bda3a4c4R14-R27
/**
 * Return a normalized JSON-serializable object for an AnyValue.
 *
 * This is useful for creating a mapping key for SDK data structures including
 * `Attributes`. For example:
 * - the Metrics SDK needs to group instrument values based on Attributes
 * - LoggerProvider et al need to key on InstrumentationScope data, which can
 *   include Attributes.
 *
 * Dev Notes:
 * This normalization uses a [typeTag, payload] tuple.
 * Using a type tag as the first element guarantees that two values can only
 * produce the same tuple when they have the same type AND the same data,
 * avoiding cross-type collisions such as:
 *   - null vs NaN vs Infinity (all become JSON `null` via JSON.stringify)
 *   - -0 vs 0 (both become JSON `0` via JSON.stringify)
 *   - string "null" vs the value null
 *
 * Object keys are sorted so that attribute maps with the same entries but
 * different insertion orders produce the same key.
 */
export function keyObjFromAnyValue(value: AttributeValue): unknown {
  if (value === undefined) {
    return ['u', null];
  }
  if (value === null) {
    return ['n', null];
  }

  const valueType = typeof value;
  if (valueType === 'string') {
    return ['s', value];
  }
  if (valueType === 'boolean') {
    return ['b', value];
  }
  if (valueType === 'number') {
    if (Number.isNaN(value)) return ['nan', null];
    if (value === Infinity) return ['inf', null];
    if (value === -Infinity) return ['-inf', null];
    if (Object.is(value, -0)) return ['n0', null];
    return ['d', value];
  }
  if (value instanceof Uint8Array) {
    return ['bytes', Array.from(value)];
  }
  if (Array.isArray(value)) {
    return ['arr', value.map(keyObjFromAnyValue)];
  }
  // AnyValueMap — sort keys for insertion-order independence
  return [
    'map',
    Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, keyObjFromAnyValue(v)]),
  ];
}

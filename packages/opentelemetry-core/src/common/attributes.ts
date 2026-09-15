/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * OTel JS attributes handling utilities.
 *
 * In earlier OTel spec versions, attributes (e.g. on spans) were restricted
 * to a relatively "simple" set of allowed types:
 * - scalar values: string, number, boolean
 * - homogeneous array of scalar values
 *
 * OTEP 4485 defined a wider, extended, more *complex* set of types, adding:
 * - byte arrays (Uint8Array in JS)
 * - heterogenous arrays
 * - key/value-mappings (`KeyValueList` in proto, a plain `object` in JS)
 *
 * OTel SDKs "MUST" or "MAY" support for attributes, depending.
 * See https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/4485-extending-attributes-to-support-complex-values.md#sdk
 *
 * In OTel JS SDK 3.0 and `@opentelemetry/api@1.10.0` support was added
 * for those extended attributes types. The `api` was updated to accept
 * TypeScript type `unknown` for attribute values via:
 *    type AnyValue = unknown;
 *
 * The intent is that users of the `api` can (and will, this is JavaScript)
 * pass whatever types as attribute values. SDK implementations need to handle
 * API users passing in extended attribute types.
 * Two options:
 *
 * 1. Support the "simple" set of types. Use `cleanSimpleAttributes()` and
 *    `maybeAddSimpleAttribute()`. (Or use `sanitizeAttributes()`, kept for
 *    backward compatibility.)
 * 2. Support the extended types. Use `cleanAttributes()` and
 *    `maybeAddAttribute()`; and test the SDK implementation with newer
 *    attribute value types.
 */

import type { AnyValue, Attributes } from '@opentelemetry/api';
import { diag } from '@opentelemetry/api';

// XXX Is there any value to other packages in exporting this type?
type SimpleAttributeValue =
  | string
  | number
  | boolean
  | Array<null | undefined | string>
  | Array<null | undefined | number>
  | Array<null | undefined | boolean>;

// XXX I'd welcome a suggestion other than an enum; prefer erasable syntax.
export enum AddAttributeDecision {
  DROP_UNDEFINED = 0,
  DROP_INVALID = 1,
  DROP_LIMIT_REACHED = 2,
  ADD_NEW = 3,
  ADD_OVERWRITE_EXISTING = 4,
}

type AttributeLimits = {
  attributeCountLimit: number;
  attributeValueLengthLimit: number;
};

// https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#attribute-limits
const DEFAULT_ATTRIBUTE_LIMITS: AttributeLimits = {
  attributeCountLimit: 128,
  attributeValueLengthLimit: Infinity,
};

type MaybeAddAttributeOpts = {
  key: string;
  value: AnyValue;
  attributes: Attributes;
  limits: AttributeLimits;
  currentAttributesCount: number;
};

/**
 * Maybe add the `key`/`val` attribute to the given `attributes`.
 * - "Maybe" because this ensures the `key` is valid (the string is not empty)
 *   and the `val` is an accepted spec AnyValue type (see `isAnyValue` below).
 *   Note that the TypeScript `AnyValue` type is *looser* than the spec
 *   `AnyValue`.
 * - This also applies attribute count and value length limits.
 * - This returns an `AddAttributeDecision` enum value indicating whether,
 *   why, and how the attribute was added. This can be relevant for the
 *   caller updating metrics (e.g. `droppedAttributesCount`).
 */
export function maybeAddAttribute(
  opts: MaybeAddAttributeOpts
): AddAttributeDecision {
  return maybeAddAttributeInternal(opts, isAnyValue);
}

/**
 * A version of `maybeAddAttribute` that limits allowed attribute value
 * types to "simple" types (`SimpleAttributeValue`).
 */
export function maybeAddSimpleAttribute(
  opts: MaybeAddAttributeOpts
): AddAttributeDecision {
  return maybeAddAttributeInternal(opts, isSimpleAttributeValue);
}

function maybeAddAttributeInternal(
  opts: MaybeAddAttributeOpts,
  isValidValue: (value: unknown) => boolean
): AddAttributeDecision {
  if (opts.value === undefined) {
    // Silently drop undefined values.
    return AddAttributeDecision.DROP_UNDEFINED;
  }

  if (opts.key.length === 0) {
    diag.warn(`Invalid attribute key: ${opts.key}`);
    return AddAttributeDecision.DROP_INVALID;
  }

  const isNewKey = !Object.hasOwn(opts.attributes, opts.key);
  if (
    isNewKey &&
    opts.currentAttributesCount >= opts.limits.attributeCountLimit
  ) {
    return AddAttributeDecision.DROP_LIMIT_REACHED;
  }

  if (!isValidValue(opts.value)) {
    diag.warn(`Invalid attribute value set for key: ${opts.key}`);
    return AddAttributeDecision.DROP_INVALID;
  }

  let attributeValueLengthLimit = opts.limits.attributeValueLengthLimit;
  if (attributeValueLengthLimit <= 0) {
    diag.warn(
      `Invalid attributeValueLengthLimit: must be positive, got ${attributeValueLengthLimit} (ignoring)`
    );
    attributeValueLengthLimit = Infinity;
  }
  opts.attributes[opts.key] = copyAndTruncAnyValue(
    opts.value,
    attributeValueLengthLimit
  );
  if (isNewKey) {
    return AddAttributeDecision.ADD_NEW;
  }
  return AddAttributeDecision.ADD_OVERWRITE_EXISTING;
}

/**
 * Clean a given set of attributes.
 * - `undefined` values are silently dropped
 * - invalid attribute value types are removed, with a warning
 * - attribute count and value length *limits* are applied
 *
 * The call signature is meant to make it ergonomic for creating SDK things
 * that take `attributes` and `droppedAttributesCount` arguments, e.g.:
 *    this.links({
 *      context: opts.context,
 *      ...cleanAttributes(opts.attributes, attributeLimits)
 *    });
 *
 * If the given `inAttributes` is undefined, then the properties in the
 * return value will be undefined.
 */
export function cleanAttributes(
  inAttributes: unknown,
  limits: AttributeLimits
): {
  attributes?: Attributes;
  droppedAttributesCount?: number;
} {
  return cleanAttributesInternal(inAttributes, limits, isAnyValue);
}

/**
 * A version of `cleanAttributes` that limits allowed attribute value types to
 * "simple" types (`SimpleAttributeValue`).
 */
export function cleanSimpleAttributes(
  inAttributes: unknown,
  limits: AttributeLimits
): {
  attributes?: Attributes;
  droppedAttributesCount?: number;
} {
  return cleanAttributesInternal(inAttributes, limits, isSimpleAttributeValue);
}

function cleanAttributesInternal(
  inAttributes: unknown,
  limits: AttributeLimits,
  isValidValue: (value: unknown) => boolean
): {
  attributes?: Attributes;
  droppedAttributesCount?: number;
} {
  if (typeof inAttributes !== 'object' || inAttributes == null) {
    return {};
  }

  const attributes: Attributes = {};
  let droppedAttributesCount = 0;

  let attributeValueLengthLimit = limits.attributeValueLengthLimit;
  if (attributeValueLengthLimit <= 0) {
    diag.warn(
      `Invalid attributeValueLengthLimit: must be positive, got ${attributeValueLengthLimit} (ignoring)`
    );
    attributeValueLengthLimit = Infinity;
  }

  let count = 0;
  for (const [key, val] of Object.entries(inAttributes)) {
    if (val === undefined) {
      // Silently drop undefined values.
      continue;
    }
    if (count >= limits.attributeCountLimit) {
      droppedAttributesCount++;
      continue;
    }
    if (key.length === 0) {
      diag.warn(`Invalid attribute key: ${key}`);
      droppedAttributesCount++;
      continue;
    }
    if (!isValidValue(val)) {
      diag.warn(`Invalid attribute value set for key: ${key}`);
      droppedAttributesCount++;
      continue;
    }
    attributes[key] = copyAndTruncAnyValue(val, attributeValueLengthLimit);
    count++;
  }

  return { attributes, droppedAttributesCount };
}

/**
 * Returns true iff the given value is a supported AnyValue per
 * https://opentelemetry.io/docs/specs/otel/common/#anyvalue
 *
 * - Primitives/scalars: string, boolean, number
 *   (Note that this *excludes* BigInt and Symbol)
 * - Byte arrays (Uint8Array, Buffer)
 * - Arrays of AnyValue (heterogeneous arrays allowed)
 * - Maps from string to AnyValue (nested objects)
 * - Empty values (null)
 *
 * Notes:
 * - `undefined` is *not* considered an AnyValue.
 *   (TODO: update the spec to exclude `undefined`. *`null`* is the JavaScript
 *   value for "empty".)
 * - TypedArray's other than `Uint8Array` are *not* considered an AnyValue.
 *
 * @param val
 * @returns true if the value is a valid AnyValue, false otherwise
 */
export function isAnyValue(val: unknown): boolean {
  // TODO(perf): Do we *need* a *weak* set? Faster with just Set()?
  return isAnyValueInternal(val, new WeakSet());
}

function isAnyValueInternal(
  val: unknown,
  visited: WeakSet<object>
): val is AnyValue {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#description
  switch (typeof val) {
    case 'undefined':
    case 'bigint':
    case 'symbol':
    case 'function':
      return false;
    case 'string':
    case 'number':
    case 'boolean':
      return true;
    case 'object':
      // Handled below.
      break;
    default:
      throw new Error(
        'internal error: unexpected JS object typeof: ${typeof val}'
      );
  }

  if (val === null) {
    return true;
  }

  // Byte arrays
  if (val instanceof Uint8Array) {
    return true;
  }

  // This leaves objects and arrays. Check for circular references.
  if (visited.has(val)) {
    // Circular reference detected - reject it
    return false;
  }
  visited.add(val);

  // Arrays (can contain any AnyValue, including heterogeneous)
  if (Array.isArray(val)) {
    for (const item of val) {
      // Special case: `undefined` in an array is allowed because it has
      // meaning (the array index of subsequent items). It gets serialized
      // as an empty value, the same as `null`.
      if (item !== undefined && !isAnyValueInternal(item, visited)) {
        return false;
      }
    }
    return true;
  }

  // Only accept plain objects (not objects like Date, RegExp, Error, etc.).
  const obj = val as Record<string, unknown>;
  if (obj.constructor !== Object && obj.constructor !== undefined) {
    return false;
  }

  // Plain objects
  for (const key of Object.keys(obj)) {
    if (!isAnyValueInternal(obj[key], visited)) {
      return false;
    }
  }

  return true;
}

/**
 * Attribute value length limiting/truncation per:
 * https://opentelemetry.io/docs/specs/otel/common/#attribute-limits
 *
 * For arrays and objects, this also returns a deep copy to avoid mutating data
 * passed in by calling code.
 *
 * XXX diffs from truncateToSize() from sdk-logs:
 * - Uint8Array *is* truncated
 *
 * @param {AnyValue} val - The attribute value. We are assuming this has
 *    already been guarded by `isAnyValue`. This filters out non-plain objects,
 *    like RegExp & Date, and circular references.
 */
function copyAndTruncAnyValue(val: AnyValue, limit: number): AnyValue {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#description
  switch (typeof val) {
    // Currently some of these aren't allowed AnyValue's, but having these
    // here is resilient for later changes (e.g. allowing bigint) and they help
    // with type narrowing.
    case 'number':
    case 'boolean':
    case 'undefined':
    case 'bigint':
    case 'symbol':
    case 'function':
      return val;
    case 'string':
      if (val.length <= limit) {
        return val;
      } else {
        return val.substring(0, limit);
      }
    case 'object':
      // Handled below.
      break;
    default:
      throw new Error(
        'internal error: unexpected JS object typeof: ${typeof val}'
      );
  }

  if (val === null) {
    return val;
  }

  // Byte arrays
  if (val instanceof Uint8Array) {
    if (val.length <= limit) {
      return val;
    } else {
      return val.slice(0, limit);
    }
  }

  // Arrays
  if (Array.isArray(val)) {
    return val.map(elem => copyAndTruncAnyValue(elem, limit));
  }

  // Plain objects
  const truncObj: Record<string, AnyValue> = {};
  const obj = val as Record<string, AnyValue>;
  for (const key of Object.keys(obj)) {
    truncObj[key] = copyAndTruncAnyValue(obj[key], limit);
  }
  return truncObj;
}

/**
 * Clean the given attributes to just those with "simple" attribute types.
 * This remains for backwards compatibility with 2.x.
 *
 * Changes to previous behavior:
 * - a default attribute count limit of 128 is applied
 * - nullish values (except in arrays) are removed
 *
 * @deprecated Use `cleanAttributes` or `cleanSimpleAttributes`.
 */
export function sanitizeAttributes(inAttributes: unknown): Attributes {
  const { attributes } = cleanSimpleAttributes(
    inAttributes,
    DEFAULT_ATTRIBUTE_LIMITS
  );
  return attributes ?? {};
}

/**
 * Return true if the given attribute value is a "simple" attribute value type.
 *
 * Changes to previous behavior: nullish values now return *false*.
 *
 * @deprecated use `isAnyValue`, or `isSimpleAttributeValue`.
 */
export const isAttributeValue = isSimpleAttributeValue;

export function isSimpleAttributeValue(
  val: unknown
): val is SimpleAttributeValue {
  if (Array.isArray(val)) {
    return isHomogeneousAttributeValueArray(val);
  }
  return isValidPrimitiveAttributeValueType(typeof val);
}

function isHomogeneousAttributeValueArray(arr: unknown[]): boolean {
  let type: string | undefined;

  for (const element of arr) {
    // null/undefined elements are allowed
    if (element == null) continue;
    const elementType = typeof element;

    if (elementType === type) {
      continue;
    }

    if (!type) {
      if (isValidPrimitiveAttributeValueType(elementType)) {
        type = elementType;
        continue;
      }
      // encountered an invalid primitive
      return false;
    }

    return false;
  }

  return true;
}

function isValidPrimitiveAttributeValueType(valType: string): boolean {
  switch (valType) {
    case 'number':
    case 'boolean':
    case 'string':
      return true;
  }

  return false;
}

/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag, AttributeValue, Attributes } from '@opentelemetry/api';

export function sanitizeAttributes(attributes: unknown): Attributes {
  const out: Attributes = {};

  if (typeof attributes !== 'object' || attributes == null) {
    return out;
  }

  for (const key in attributes) {
    if (!Object.prototype.hasOwnProperty.call(attributes, key)) {
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
      out[key] = val.slice();
    } else {
      out[key] = val;
    }
  }

  return out;
}

export function isAttributeKey(key: unknown): key is string {
  return typeof key === 'string' && key !== '';
}

export function isAttributeValue(val: unknown): val is AttributeValue {
  if (val == null) {
    return true;
  }

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

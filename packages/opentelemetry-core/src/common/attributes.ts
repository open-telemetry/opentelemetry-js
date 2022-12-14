/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { diag, AttributeValue, Attributes } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

const valueSanitizers: ReadonlyMap<
  string,
  (val: AttributeValue) => AttributeValue | undefined
> = new Map([[SemanticAttributes.HTTP_URL, sanitizeHttpUrl]]);

export function sanitizeAttribute(
  key: string,
  val: AttributeValue
): AttributeValue | undefined {
  let out: AttributeValue | undefined = undefined;

  if (!isAttributeKey(key)) {
    diag.warn(`Invalid attribute key: ${key}`);
    return out;
  }
  if (!isAttributeValue(val)) {
    diag.warn(`Invalid attribute value set for key: ${key}`);
    return out;
  }

  let copyVal: AttributeValue;

  if (Array.isArray(val)) {
    copyVal = val.slice();
  } else {
    copyVal = val;
  }

  const valueSanitizer = valueSanitizers.get(key);
  if (typeof valueSanitizer === 'undefined') {
    return copyVal;
  }

  return valueSanitizer(copyVal);
}

export function sanitizeAttributes(attributes: unknown): Attributes {
  const out: Attributes = {};

  if (typeof attributes !== 'object' || attributes == null) {
    return out;
  }

  for (const [key, val] of Object.entries(attributes)) {
    const sanitizedVal = sanitizeAttribute(key, val);
    if (typeof sanitizedVal !== 'undefined') {
      out[key] = sanitizedVal;
    }
  }

  return out;
}

export function isAttributeKey(key: unknown): key is string {
  return typeof key === 'string' && key.length > 0;
}

export function isAttributeValue(val: unknown): val is AttributeValue {
  if (val == null) {
    return true;
  }

  if (Array.isArray(val)) {
    return isHomogeneousAttributeValueArray(val);
  }

  return isValidPrimitiveAttributeValue(val);
}

function isHomogeneousAttributeValueArray(arr: unknown[]): boolean {
  let type: string | undefined;

  for (const element of arr) {
    // null/undefined elements are allowed
    if (element == null) continue;

    if (!type) {
      if (isValidPrimitiveAttributeValue(element)) {
        type = typeof element;
        continue;
      }
      // encountered an invalid primitive
      return false;
    }

    if (typeof element === type) {
      continue;
    }

    return false;
  }

  return true;
}

function isValidPrimitiveAttributeValue(val: unknown): boolean {
  switch (typeof val) {
    case 'number':
    case 'boolean':
    case 'string':
      return true;
  }

  return false;
}

function sanitizeHttpUrl(val: AttributeValue): AttributeValue | undefined {
  let out: AttributeValue | undefined;

  if (typeof val !== 'string') {
    diag.warn(
      `Invalid attribute value set for key: ${
        SemanticAttributes.HTTP_URL
      }. Unable to sanitize ${Array.isArray(val) ? 'array' : typeof val} value.`
    );

    return val;
  }

  try {
    const valUrl = new URL(val);

    valUrl.username = '';
    valUrl.password = '';

    out = valUrl.toString();
  } catch (err: unknown) {
    diag.warn(
      `Invalid attribute value set for key: ${SemanticAttributes.HTTP_URL}. Unable to sanitize invalid URL.`
    );

    out = val;
  }

  return out;
}

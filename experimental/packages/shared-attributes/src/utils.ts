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

import { Attributes, createContextKey, Context, diag } from '@opentelemetry/api';
import {
  isAttributeValue,
} from '@opentelemetry/core';

const CONTEXT_ATTRIBUTES_KEY = createContextKey(
  'OpenTelemetry Context Attributes'
);

const globalAttributes: Attributes = {};

export function setGlobalAttribute(key: string, value: unknown): void {
  if (value == null) return;
  if (key.length === 0) {
    diag.warn(`Invalid attribute key: ${key}`);
    return;
  }
  if (!isAttributeValue(value)) {
    diag.warn(`Invalid attribute value set for key: ${key}`);
    return;
  }

  globalAttributes[key] = value;
}

export function setGlobalAttributes(attributes: Attributes): void {
  for (const [k, v] of Object.entries(attributes)) {
    setGlobalAttribute(k, v);
  }
}

export function getGlobalAttributes(): Attributes {
  return globalAttributes;
}

export function setContextAttribute(context: Context, key: string, value: unknown): Context {
  return context.setValue(CONTEXT_ATTRIBUTES_KEY, {
    ...(context.getValue(CONTEXT_ATTRIBUTES_KEY) as Attributes || {}),
    [key]: value,
  });
}

export function setContextAttributes(
  context: Context,
  attributes: Attributes
): Context {
  return context.setValue(CONTEXT_ATTRIBUTES_KEY, {
    ...(context.getValue(CONTEXT_ATTRIBUTES_KEY) as Attributes || {}),
    ...(attributes || {}),
  });
}

export function getContextAttributes(context: Context): Attributes {
  return context.getValue(CONTEXT_ATTRIBUTES_KEY) as Attributes;
}

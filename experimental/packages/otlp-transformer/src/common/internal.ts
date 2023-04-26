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
import type { Attributes } from '@opentelemetry/api';
import type { IAnyValue, IKeyValue } from './types';

export function toAttributes(attributes: Attributes): IKeyValue[] {
  return Object.keys(attributes).map(key => toKeyValue(key, attributes[key]));
}

export function toKeyValue(key: string, value: unknown): IKeyValue {
  return {
    key: key,
    value: toAnyValue(value),
  };
}

export function toAnyValue(value: unknown): IAnyValue {
  const t = typeof value;
  if (t === 'string') return { stringValue: value as string };
  if (t === 'number') {
    if (!Number.isInteger(value)) return { doubleValue: value as number };
    return { intValue: value as number };
  }
  if (t === 'boolean') return { boolValue: value as boolean };
  if (value instanceof Uint8Array) return { bytesValue: value };
  if (Array.isArray(value))
    return { arrayValue: { values: value.map(toAnyValue) } };
  if (t === 'object' && value != null)
    return {
      kvlistValue: {
        values: Object.entries(value as object).map(([k, v]) =>
          toKeyValue(k, v)
        ),
      },
    };

  return {};
}

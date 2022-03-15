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
import type { SpanAttributes } from '@opentelemetry/api';
import { IAnyValue, IKeyValue } from './types';

export function toAttributes(
  attributes: SpanAttributes
): IKeyValue[] {
  return Object.keys(attributes).map(key => toKeyValue(key, attributes[key]));
}

export function toKeyValue(
  key: string,
  value: unknown
): IKeyValue {
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
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toAnyValue) } };
  if (t === 'object' && value != null) return { kvlistValue: { values: Object.entries(value as object).map(([k, v]) => toKeyValue(k, v)) } };

  return {};
}

export function hexToBuf(hex: string): Uint8Array | undefined {
  const ints = hex.match(/[\da-f]{2}/gi)?.map(h => parseInt(h, 16));
  return ints && new Uint8Array(ints);
}

function i2hex(i: number): string {
  return ('0' + i.toString(16)).slice(-2);
}

export function bufToHex(buf?: Uint8Array | null): string | undefined {
  if (buf == null || buf.length === 0) return undefined;
  return Array.from(buf).map(i2hex).join('');
}

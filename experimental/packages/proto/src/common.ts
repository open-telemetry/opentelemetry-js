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
import { HrTime, SpanAttributes } from '@opentelemetry/api';
import { opentelemetry } from './generated';
import * as Long from 'long';

const MAX_INTEGER_VALUE = 2147483647;
const MIN_INTEGER_VALUE = -2147483648;

export function toAttributes(
  attributes: SpanAttributes
): opentelemetry.proto.common.v1.KeyValue[] {
  return Object.keys(attributes).map(key => toKeyValue(key, attributes[key]));
}

export function toKeyValue(
  key: string,
  value: unknown
): opentelemetry.proto.common.v1.KeyValue {
  return opentelemetry.proto.common.v1.KeyValue.fromObject({
    key: key,
    value: toAnyValue(value),
  });
}

export function toAnyValue(value: unknown): opentelemetry.proto.common.v1.AnyValue {
  return opentelemetry.proto.common.v1.AnyValue.fromObject({
    stringValue: typeof value === 'string' ? value : undefined,
    doubleValue: typeof value === 'number' && !Number.isInteger(value) ? value : undefined,
    intValue:
      typeof value === 'number' &&
        Number.isInteger(value) &&
        value > MIN_INTEGER_VALUE &&
        value < MAX_INTEGER_VALUE
        ? value
        : undefined,
    boolValue: typeof value === 'boolean' ? value : undefined,
    bytesValue: value instanceof Uint8Array ? value : undefined,
    arrayValue: Array.isArray(value) ? { values: value.map(v => toAnyValue(v)) } : undefined,
    kvlistValue: typeof value === 'object' &&
      value != null &&
      !Array.isArray(value) &&
      !(value instanceof Uint8Array) ?
      { values: Object.entries(value).map(([k, v]) => toKeyValue(k, v)) } :
      undefined,
  });
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

export function hrTimeToLong(hrtime: HrTime): Long {
  return Long.fromInt(hrtime[0], true).mul(1e9).add(hrtime[1]);
}

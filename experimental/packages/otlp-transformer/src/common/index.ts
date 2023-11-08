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

import type { OtlpEncodingOptions, Fixed64, LongBits } from './types';
import { HrTime } from '@opentelemetry/api';
import { hexToBase64, hrTimeToNanoseconds } from '@opentelemetry/core';

const NANOSECONDS = BigInt(1_000_000_000);

export function hrTimeToNanos(hrTime: HrTime): bigint {
  return BigInt(hrTime[0]) * NANOSECONDS + BigInt(hrTime[1]);
}

export function toLongBits(value: bigint): LongBits {
  const low = Number(BigInt.asUintN(32, value));
  const high = Number(BigInt.asUintN(32, value >> BigInt(32)));
  return { low, high };
}

export function encodeAsLongBits(hrTime: HrTime): LongBits {
  const nanos = hrTimeToNanos(hrTime);
  return toLongBits(nanos);
}

export function encodeAsString(hrTime: HrTime): string {
  const nanos = hrTimeToNanos(hrTime);
  return nanos.toString();
}

const encodeTimestamp =
  typeof BigInt !== 'undefined' ? encodeAsString : hrTimeToNanoseconds;

export type HrTimeEncodeFunction = (hrTime: HrTime) => Fixed64;
export type SpanContextEncodeFunction = (spanContext: string) => string;
export type OptionalSpanContextEncodeFunction = (
  spanContext: string | undefined
) => string | undefined;

export interface Encoder {
  encodeHrTime: HrTimeEncodeFunction;
  encodeSpanContext: SpanContextEncodeFunction;
  encodeOptionalSpanContext: OptionalSpanContextEncodeFunction;
}

function identity<T>(value: T): T {
  return value;
}

function optionalHexToBase64(str: string | undefined): string | undefined {
  if (str === undefined) return undefined;
  return hexToBase64(str);
}

const DEFAULT_ENCODER: Encoder = {
  encodeHrTime: encodeAsLongBits,
  encodeSpanContext: hexToBase64,
  encodeOptionalSpanContext: optionalHexToBase64,
};

export function getOtlpEncoder(options?: OtlpEncodingOptions): Encoder {
  if (options === undefined) {
    return DEFAULT_ENCODER;
  }

  const useLongBits = options.useLongBits ?? true;
  const useHex = options.useHex ?? false;
  return {
    encodeHrTime: useLongBits ? encodeAsLongBits : encodeTimestamp,
    encodeSpanContext: useHex ? identity : hexToBase64,
    encodeOptionalSpanContext: useHex ? identity : optionalHexToBase64,
  };
}

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

import type { OtlpEncodingOptions, Fixed64, LongBits } from './internal-types';
import { HrTime } from '@opentelemetry/api';
import { hrTimeToNanoseconds } from '@opentelemetry/core';
import { hexToBinary } from './hex-to-binary';

export function hrTimeToNanos(hrTime: HrTime): bigint {
  const NANOSECONDS = BigInt(1_000_000_000);
  return (
    BigInt(Math.trunc(hrTime[0])) * NANOSECONDS + BigInt(Math.trunc(hrTime[1]))
  );
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
export type SpanContextEncodeFunction = (
  spanContext: string
) => string | Uint8Array;
export type OptionalSpanContextEncodeFunction = (
  spanContext: string | undefined
) => string | Uint8Array | undefined;

export interface Encoder {
  encodeHrTime: HrTimeEncodeFunction;
  encodeSpanContext: SpanContextEncodeFunction;
  encodeOptionalSpanContext: OptionalSpanContextEncodeFunction;
}

function identity<T>(value: T): T {
  return value;
}

function optionalHexToBinary(str: string | undefined): Uint8Array | undefined {
  if (str === undefined) return undefined;
  return hexToBinary(str);
}

/**
 * Convert hex string to base64 (for protobuf JSON format).
 */
export function hexToBase64(hex: string): string {
  const bytes = hexToBinary(hex);
  // Works in both Node.js and browser
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  // Browser fallback using spread to avoid string concatenation in loop
  return btoa(String.fromCharCode(...bytes));
}

function optionalHexToBase64(str: string | undefined): string | undefined {
  if (str === undefined) return undefined;
  return hexToBase64(str);
}

const DEFAULT_ENCODER: Encoder = {
  encodeHrTime: encodeAsLongBits,
  encodeSpanContext: hexToBinary,
  encodeOptionalSpanContext: optionalHexToBinary,
};

/**
 * Encoder for protobuf JSON format (used with fromJson).
 * Uses string timestamps and base64 for bytes.
 */
export const PROTOBUF_JSON_ENCODER: Encoder = {
  encodeHrTime: encodeAsString,
  encodeSpanContext: hexToBase64,
  encodeOptionalSpanContext: optionalHexToBase64,
};

/** @internal */
export function isEncoder(
  obj: OtlpEncodingOptions | Encoder | undefined
): obj is Encoder {
  return obj !== undefined && 'encodeHrTime' in obj;
}

export function getOtlpEncoder(options?: OtlpEncodingOptions): Encoder {
  if (options === undefined) {
    return DEFAULT_ENCODER;
  }

  const useLongBits = options.useLongBits ?? true;
  const useHex = options.useHex ?? false;
  return {
    encodeHrTime: useLongBits ? encodeAsLongBits : encodeTimestamp,
    encodeSpanContext: useHex ? identity : hexToBinary,
    encodeOptionalSpanContext: useHex ? identity : optionalHexToBinary,
  };
}

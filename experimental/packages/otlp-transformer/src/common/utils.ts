/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Fixed64, LongBits } from './internal-types';
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
export type Uint8ArrayEncodeFunction = (
  value: Uint8Array
) => string | Uint8Array;

export interface Encoder {
  encodeHrTime: HrTimeEncodeFunction;
  encodeSpanContext: SpanContextEncodeFunction;
  encodeOptionalSpanContext: OptionalSpanContextEncodeFunction;
  encodeUint8Array: Uint8ArrayEncodeFunction;
}

function identity<T>(value: T): T {
  return value;
}

function optionalHexToBinary(str: string | undefined): Uint8Array | undefined {
  if (str === undefined) return undefined;
  return hexToBinary(str);
}

/**
 * Encoder for protobuf format.
 * Uses { high, low } timestamps and binary for span/trace IDs, leaves Uint8Array attributes as-is.
 */
export const PROTOBUF_ENCODER: Encoder = {
  encodeHrTime: encodeAsLongBits,
  encodeSpanContext: hexToBinary,
  encodeOptionalSpanContext: optionalHexToBinary,
  encodeUint8Array: identity,
};

/**
 * Encoder for JSON format.
 * Uses string timestamps, hex for span/trace IDs, and base64 for Uint8Array.
 */
export const JSON_ENCODER: Encoder = {
  encodeHrTime: encodeTimestamp,
  encodeSpanContext: identity,
  encodeOptionalSpanContext: identity,
  encodeUint8Array: (bytes: Uint8Array): string => {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(bytes).toString('base64');
    }

    // implementation note: not using spread operator and passing to
    // btoa to avoid stack overflow on large Uint8Arrays
    const chars = new Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      chars[i] = String.fromCharCode(bytes[i]);
    }
    return btoa(chars.join(''));
  },
};

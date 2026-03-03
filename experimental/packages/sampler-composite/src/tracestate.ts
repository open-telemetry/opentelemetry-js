/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { TraceState } from '@opentelemetry/api';
import {
  INVALID_RANDOM_VALUE,
  INVALID_THRESHOLD,
  isValidRandomValue,
  isValidThreshold,
  MAX_THRESHOLD,
} from './util';

export type OtelTraceState = {
  /** The random value for sampling decisions in the trace. */
  randomValue: bigint;
  /** The upstream threshold for sampling decisions. */
  threshold: bigint;
  /** The rest of the "ot" tracestate value. */
  rest?: string[];
};

export const INVALID_TRACE_STATE: OtelTraceState = Object.freeze({
  randomValue: INVALID_RANDOM_VALUE,
  threshold: INVALID_THRESHOLD,
});

const TRACE_STATE_SIZE_LIMIT = 256;
const MAX_VALUE_LENGTH = 14; // 56 bits, 4 bits per hex digit

export function parseOtelTraceState(
  traceState: TraceState | undefined
): OtelTraceState {
  const ot = traceState?.get('ot');
  if (!ot || ot.length > TRACE_STATE_SIZE_LIMIT) {
    return INVALID_TRACE_STATE;
  }

  let threshold = INVALID_THRESHOLD;
  let randomValue = INVALID_RANDOM_VALUE;

  // Parse based on https://opentelemetry.io/docs/specs/otel/trace/tracestate-handling/
  const members = ot.split(';');
  let rest: string[] | undefined;
  for (const member of members) {
    if (member.startsWith('th:')) {
      threshold = parseTh(member.slice('th:'.length), INVALID_THRESHOLD);
      continue;
    }
    if (member.startsWith('rv:')) {
      randomValue = parseRv(member.slice('rv:'.length), INVALID_RANDOM_VALUE);
      continue;
    }
    if (!rest) {
      rest = [];
    }
    rest.push(member);
  }

  return {
    randomValue,
    threshold,
    rest,
  };
}

export function serializeTraceState(otTraceState: OtelTraceState): string {
  if (
    !isValidThreshold(otTraceState.threshold) &&
    !isValidRandomValue(otTraceState.randomValue) &&
    !otTraceState.rest
  ) {
    return '';
  }

  const parts: string[] = [];
  if (
    isValidThreshold(otTraceState.threshold) &&
    otTraceState.threshold !== MAX_THRESHOLD
  ) {
    parts.push(`th:${serializeTh(otTraceState.threshold)}`);
  }
  if (isValidRandomValue(otTraceState.randomValue)) {
    parts.push(`rv:${serializeRv(otTraceState.randomValue)}`);
  }
  if (otTraceState.rest) {
    parts.push(...otTraceState.rest);
  }
  let res = parts.join(';');
  while (res.length > TRACE_STATE_SIZE_LIMIT) {
    const lastSemicolon = res.lastIndexOf(';');
    if (lastSemicolon === -1) {
      break;
    }
    res = res.slice(0, lastSemicolon);
  }
  return res;
}

function parseTh(value: string, defaultValue: bigint): bigint {
  if (!value || value.length > MAX_VALUE_LENGTH) {
    return defaultValue;
  }

  try {
    return BigInt('0x' + value.padEnd(MAX_VALUE_LENGTH, '0'));
  } catch {
    return defaultValue;
  }
}

function parseRv(value: string, defaultValue: bigint): bigint {
  if (!value || value.length !== MAX_VALUE_LENGTH) {
    return defaultValue;
  }

  try {
    return BigInt(`0x${value}`);
  } catch {
    return defaultValue;
  }
}

// hex value without trailing zeros
export function serializeTh(threshold: bigint): string {
  if (threshold === 0n) {
    return '0';
  }

  const value = threshold.toString(16).padStart(MAX_VALUE_LENGTH, '0');
  let idxAfterNonZero = value.length;
  for (let i = value.length - 1; i >= 0; i--) {
    if (value[i] !== '0') {
      idxAfterNonZero = i + 1;
      break;
    }
  }
  // Checked at beginning so there is definitely a nonzero.
  return value.slice(0, idxAfterNonZero);
}

function serializeRv(randomValue: bigint): string {
  return randomValue.toString(16).padStart(MAX_VALUE_LENGTH, '0');
}

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

export function invalidTraceState(): OtelTraceState {
  return {
    randomValue: INVALID_RANDOM_VALUE,
    threshold: INVALID_THRESHOLD,
  };
}

const TRACE_STATE_SIZE_LIMIT = 256;
const MAX_VALUE_LENGTH = 14; // 56 bits, 4 bits per hex digit

export function parseOtelTraceState(
  traceState: TraceState | undefined
): OtelTraceState {
  const ot = traceState?.get('ot');
  if (!ot || ot.length > TRACE_STATE_SIZE_LIMIT) {
    return invalidTraceState();
  }

  let threshold = INVALID_THRESHOLD;
  let randomValue = INVALID_RANDOM_VALUE;

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

  let parsed: bigint;
  try {
    parsed = BigInt(`0x${value}`);
  } catch {
    return defaultValue;
  }

  const trailingZeros = MAX_VALUE_LENGTH - value.length;
  return parsed << BigInt(trailingZeros * 4);
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

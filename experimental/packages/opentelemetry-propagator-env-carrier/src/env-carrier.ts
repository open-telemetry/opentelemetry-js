/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TextMapGetter, TextMapSetter } from '@opentelemetry/api';

const ASCII_UPPER_A = 'A'.charCodeAt(0);
const ASCII_UPPER_Z = 'Z'.charCodeAt(0);
const ASCII_LOWER_A = 'a'.charCodeAt(0);
const ASCII_LOWER_Z = 'z'.charCodeAt(0);
const ASCII_DIGIT_0 = '0'.charCodeAt(0);
const ASCII_DIGIT_9 = '9'.charCodeAt(0);
const ASCII_UNDERSCORE = '_'.charCodeAt(0);
const ASCII_CASE_OFFSET = ASCII_LOWER_A - ASCII_UPPER_A;

/**
 * isNormalizedKey returns whether a key is already a normalized environment variable name.
 *
 * A normalized name is non-empty, starts with an ASCII uppercase letter or
 * underscore, and contains only ASCII uppercase letters, digits, and
 * underscores. Equivalently, it matches /^[A-Z_][A-Z0-9_]*$/.
 */
function isNormalizedKey(key: string): boolean {
  if (key.length === 0) {
    return false;
  }

  const firstCharCode = key.charCodeAt(0);
  if (
    !(
      (firstCharCode >= ASCII_UPPER_A && firstCharCode <= ASCII_UPPER_Z) ||
      firstCharCode === ASCII_UNDERSCORE
    )
  ) {
    return false;
  }

  for (let i = 1; i < key.length; i++) {
    const charCode = key.charCodeAt(i);

    if (
      !(
        (charCode >= ASCII_UPPER_A && charCode <= ASCII_UPPER_Z) ||
        (charCode >= ASCII_DIGIT_0 && charCode <= ASCII_DIGIT_9) ||
        charCode === ASCII_UNDERSCORE
      )
    ) {
      return false;
    }
  }

  return true;
}

/**
 * normalizeKey converts a propagator key to a valid POSIX environment variable
 * name. The conversion rules are:
 * - A-Z, 0-9, and _ are kept as-is.
 * - a-z are uppercased.
 * - All other characters are replaced with _.
 * - If the result would start with a digit, an underscore is prepended.
 */
function normalizeKey(key: string): string {
  let result = '';

  for (let i = 0; i < key.length; i++) {
    const charCode = key.charCodeAt(i);

    if (charCode >= ASCII_LOWER_A && charCode <= ASCII_LOWER_Z) {
      result += String.fromCharCode(charCode - ASCII_CASE_OFFSET);
    } else if (
      (charCode >= ASCII_UPPER_A && charCode <= ASCII_UPPER_Z) ||
      (charCode >= ASCII_DIGIT_0 && charCode <= ASCII_DIGIT_9) ||
      charCode === ASCII_UNDERSCORE
    ) {
      result += key[i];
    } else {
      result += '_';
    }
  }

  const firstCharCode = result.charCodeAt(0);
  if (firstCharCode >= ASCII_DIGIT_0 && firstCharCode <= ASCII_DIGIT_9) {
    return `_${result}`;
  }

  return result;
}

/**
 * TextMapGetter that reads propagation values from a process environment
 * snapshot.
 *
 * `EnvironmentGetter` snapshots `process.env` when it is constructed and
 * ignores the carrier passed to `get()` and `keys()`. Pass `undefined` as the
 * carrier when using this getter with a `TextMapPropagator`.
 *
 * Only environment variables whose names are already normalized are stored in
 * the snapshot. The requested propagator key is normalized before lookup.
 *
 * @see https://opentelemetry.io/docs/specs/otel/context/env-carriers/
 */
export class EnvironmentGetter implements TextMapGetter<void> {
  private readonly _carrier: Record<string, string> = {};

  constructor() {
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined && isNormalizedKey(key)) {
        this._carrier[key] = value;
      }
    }
  }

  get(_carrier: void, key: string): string | undefined {
    return this._carrier[normalizeKey(key)];
  }

  keys(_carrier: void): string[] {
    return Object.keys(this._carrier);
  }
}

/**
 * TextMapSetter that writes propagation values to an environment map.
 *
 * `EnvironmentSetter` mutates only the environment map supplied to the
 * constructor and never writes to `process.env`. Pass `undefined` as the
 * carrier when using this setter with a `TextMapPropagator`.
 *
 * Propagator keys are normalized before storing their opaque string values. If
 * multiple keys normalize to the same environment variable name, the latest
 * value written to the map is retained.
 *
 * @see https://opentelemetry.io/docs/specs/otel/context/env-carriers/
 */
export class EnvironmentSetter implements TextMapSetter<void> {
  private readonly _carrier: Record<string, string>;

  constructor(carrier: Record<string, string>) {
    this._carrier = carrier;
  }

  set(_carrier: void, key: string, value: string): void {
    this._carrier[normalizeKey(key)] = value;
  }
}

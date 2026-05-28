/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TextMapGetter, TextMapSetter } from '@opentelemetry/api';

type EnvironmentCarrierMap = Record<string, string>;

const ASCII_UPPER_A = 'A'.charCodeAt(0);
const ASCII_UPPER_Z = 'Z'.charCodeAt(0);
const ASCII_LOWER_A = 'a'.charCodeAt(0);
const ASCII_LOWER_Z = 'z'.charCodeAt(0);
const ASCII_DIGIT_0 = '0'.charCodeAt(0);
const ASCII_DIGIT_9 = '9'.charCodeAt(0);
const ASCII_UNDERSCORE = '_'.charCodeAt(0);
const ASCII_CASE_OFFSET = ASCII_LOWER_A - ASCII_UPPER_A;

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
 * TextMapGetter that reads propagation values from an environment snapshot.
 */
export class EnvironmentGetter implements TextMapGetter<unknown> {
  private readonly _carrier: EnvironmentCarrierMap = {};

  constructor() {
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        this._carrier[normalizeKey(key)] = value;
      }
    }
  }

  get(_carrier: unknown, key: string): string | undefined {
    return this._carrier[normalizeKey(key)];
  }

  keys(_carrier: unknown): string[] {
    return Object.keys(this._carrier);
  }
}

/**
 * TextMapSetter that writes propagation values to an environment map.
 */
export class EnvironmentSetter implements TextMapSetter<EnvironmentCarrierMap> {
  set(carrier: EnvironmentCarrierMap, key: string, value: string): void {
    carrier[normalizeKey(key)] = value;
  }
}

/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TextMapGetter, TextMapSetter } from '@opentelemetry/api';

type EnvironmentCarrierMap = Record<string, string>;

function normalizeKey(key: string): string {
  let result = '';

  for (let i = 0; i < key.length; i++) {
    const charCode = key.charCodeAt(i);

    if (charCode >= 0x61 && charCode <= 0x7a) {
      result += String.fromCharCode(charCode - 0x20);
    } else if (
      (charCode >= 0x41 && charCode <= 0x5a) ||
      (charCode >= 0x30 && charCode <= 0x39) ||
      charCode === 0x5f
    ) {
      result += key[i];
    } else {
      result += '_';
    }
  }

  const firstCharCode = result.charCodeAt(0);
  if (firstCharCode >= 0x30 && firstCharCode <= 0x39) {
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

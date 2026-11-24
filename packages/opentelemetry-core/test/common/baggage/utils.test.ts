/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BaggageEntry } from '@opentelemetry/api';
import * as assert from 'assert';
import {
  parseBaggageHeaderString,
  parseKeyPairsIntoRecord,
} from '../../../src/baggage/utils';

describe('parseKeyPairsIntoRecord()', () => {
  it('returns an empty object when value is not a string', () => {
    assert.deepStrictEqual(parseKeyPairsIntoRecord(), {});
  });

  it('returns an empty object when value is the empty string', () => {
    assert.deepStrictEqual(parseKeyPairsIntoRecord(''), {});
  });

  it('parses a single key-value pair', () => {
    const value = 'key1=value1';
    const result = parseKeyPairsIntoRecord(value);
    assert.deepStrictEqual(result, { key1: 'value1' });
  });

  it('parses multiple key-value pairs', () => {
    const value = 'key1=value1,key2=value2,key3=value3';
    const result = parseKeyPairsIntoRecord(value);
    assert.deepStrictEqual(result, {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    });
  });

  it('ignores leading and trailing whitespace', () => {
    const value = '  key1=value1, key2=value2  ';
    const result = parseKeyPairsIntoRecord(value);
    assert.deepStrictEqual(result, { key1: 'value1', key2: 'value2' });
  });

  it('filters out invalid pairs', () => {
    assert.deepStrictEqual(parseKeyPairsIntoRecord('key1,key2=value2'), {
      key2: 'value2',
    });
  });

  it('filters out empty values', () => {
    assert.deepStrictEqual(parseKeyPairsIntoRecord('key1=,key2=value2'), {
      key2: 'value2',
    });
  });

  it('preserves __proto__ as an own property without mutating the prototype', () => {
    const result = parseKeyPairsIntoRecord('__proto__=evil,a=1');
    assert.strictEqual(Object.getPrototypeOf(result), Object.prototype);
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(result, '__proto__'),
      true
    );
    assert.strictEqual(
      Object.getOwnPropertyDescriptor(result, '__proto__')?.value,
      'evil'
    );
    assert.strictEqual(result.a, '1');
  });
});

describe('parseBaggageHeaderString()', () => {
  it('defines __proto__ as an own property without mutating record prototype', () => {
    const record: Record<string, BaggageEntry> = {};
    const [count, totalSize] = parseBaggageHeaderString(
      '__proto__=evil,a=1',
      record,
      0,
      0
    );
    assert.strictEqual(count, 2);
    assert.strictEqual(totalSize, '__proto__=evil,a=1'.length);
    assert.strictEqual(Object.getPrototypeOf(record), Object.prototype);
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(record, '__proto__'),
      true
    );
    assert.deepStrictEqual(
      Object.getOwnPropertyDescriptor(record, '__proto__')?.value,
      { value: 'evil' }
    );
    assert.deepStrictEqual(record.a, { value: '1' });
  });
});

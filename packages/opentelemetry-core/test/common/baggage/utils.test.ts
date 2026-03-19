/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { parseKeyPairsIntoRecord } from '../../../src/baggage/utils';

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
});

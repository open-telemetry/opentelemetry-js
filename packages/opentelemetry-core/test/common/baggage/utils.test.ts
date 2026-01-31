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

  it('prevents empty baggage values', () => {
    assert.deepStrictEqual(parseKeyPairsIntoRecord('key1=value1,key2='), {
      key1: 'value1',
      key2: '',
    });
  });
});

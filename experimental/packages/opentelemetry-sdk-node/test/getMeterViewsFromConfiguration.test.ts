/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { getMeterViewsFromConfiguration } from '../src/utils';

describe('getMeterViewsFromConfiguration()', () => {
  it('should return undefined for empty config', () => {
    const result = getMeterViewsFromConfiguration({});
    assert.strictEqual(result, undefined);
  });

  it('should return undefined when meter_provider has no views', () => {
    const result = getMeterViewsFromConfiguration({
      meter_provider: { readers: [] },
    });
    assert.strictEqual(result, undefined);
  });

  it('should set attributesProcessors with included attribute_keys', () => {
    const result = getMeterViewsFromConfiguration({
      meter_provider: {
        readers: [],
        views: [
          {
            selector: { instrument_name: 'my.counter' },
            stream: {
              attribute_keys: {
                included: ['key1', 'key2'],
              },
            },
          },
        ],
      },
    });
    assert.ok(result);
    assert.strictEqual(result.length, 1);
    assert.ok(result[0].attributesProcessors);
    assert.strictEqual(result[0].attributesProcessors!.length, 1);

    // AllowListProcessor should keep only 'key1' and 'key2'
    const processed = result[0].attributesProcessors![0].process({
      key1: 'a',
      key2: 'b',
      key3: 'c',
    });
    assert.deepStrictEqual(processed, { key1: 'a', key2: 'b' });
  });

  it('should set attributesProcessors with excluded attribute_keys', () => {
    const result = getMeterViewsFromConfiguration({
      meter_provider: {
        readers: [],
        views: [
          {
            selector: { instrument_name: 'my.counter' },
            stream: {
              attribute_keys: {
                excluded: ['key3'],
              },
            },
          },
        ],
      },
    });
    assert.ok(result);
    assert.strictEqual(result.length, 1);
    assert.ok(result[0].attributesProcessors);
    assert.strictEqual(result[0].attributesProcessors!.length, 1);

    // DenyListProcessor should drop 'key3'
    const processed = result[0].attributesProcessors![0].process({
      key1: 'a',
      key2: 'b',
      key3: 'c',
    });
    assert.deepStrictEqual(processed, { key1: 'a', key2: 'b' });
  });

  it('should set both processors when included and excluded are provided', () => {
    const result = getMeterViewsFromConfiguration({
      meter_provider: {
        readers: [],
        views: [
          {
            selector: { instrument_name: 'my.counter' },
            stream: {
              attribute_keys: {
                included: ['key1', 'key2', 'key3'],
                excluded: ['key3'],
              },
            },
          },
        ],
      },
    });
    assert.ok(result);
    assert.strictEqual(result.length, 1);
    assert.ok(result[0].attributesProcessors);
    // AllowList + DenyList = 2 processors
    assert.strictEqual(result[0].attributesProcessors!.length, 2);

    // Apply both: first allow key1,key2,key3, then deny key3
    let processed = result[0].attributesProcessors![0].process({
      key1: 'a',
      key2: 'b',
      key3: 'c',
      key4: 'd',
    });
    processed = result[0].attributesProcessors![1].process(processed);
    assert.deepStrictEqual(processed, { key1: 'a', key2: 'b' });
  });

  it('should not set attributesProcessors when attribute_keys is empty', () => {
    const result = getMeterViewsFromConfiguration({
      meter_provider: {
        readers: [],
        views: [
          {
            selector: { instrument_name: 'my.counter' },
            stream: {
              attribute_keys: {
                included: [],
                excluded: [],
              },
            },
          },
        ],
      },
    });
    assert.ok(result);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].attributesProcessors, undefined);
  });

  it('should not set attributesProcessors when stream has no attribute_keys', () => {
    const result = getMeterViewsFromConfiguration({
      meter_provider: {
        readers: [],
        views: [
          {
            selector: { instrument_name: 'my.counter' },
            stream: {
              name: 'renamed',
            },
          },
        ],
      },
    });
    assert.ok(result);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].attributesProcessors, undefined);
  });
});

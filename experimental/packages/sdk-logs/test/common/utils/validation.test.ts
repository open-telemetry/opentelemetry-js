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
import { isLogAttributeValue } from '../../../src/utils/validation';

describe('isLogAttributeValue', () => {
  describe('should accept scalar values', () => {
    it('should accept strings', () => {
      assert.strictEqual(isLogAttributeValue('test'), true);
      assert.strictEqual(isLogAttributeValue(''), true);
      assert.strictEqual(isLogAttributeValue('multi\nline'), true);
      assert.strictEqual(isLogAttributeValue('unicode: 🎉'), true);
    });

    it('should accept numbers', () => {
      assert.strictEqual(isLogAttributeValue(42), true);
      assert.strictEqual(isLogAttributeValue(0), true);
      assert.strictEqual(isLogAttributeValue(-123), true);
      assert.strictEqual(isLogAttributeValue(3.14159), true);
      assert.strictEqual(isLogAttributeValue(Number.MAX_SAFE_INTEGER), true);
      assert.strictEqual(isLogAttributeValue(Number.MIN_SAFE_INTEGER), true);
      assert.strictEqual(isLogAttributeValue(Infinity), true);
      assert.strictEqual(isLogAttributeValue(-Infinity), true);
      assert.strictEqual(isLogAttributeValue(NaN), true);
    });

    it('should accept booleans', () => {
      assert.strictEqual(isLogAttributeValue(true), true);
      assert.strictEqual(isLogAttributeValue(false), true);
    });
  });

  describe('should accept null and undefined values', () => {
    it('should accept null', () => {
      assert.strictEqual(isLogAttributeValue(null), true);
    });

    it('should accept undefined', () => {
      assert.strictEqual(isLogAttributeValue(undefined), true);
    });
  });

  describe('should accept byte arrays', () => {
    it('should accept Uint8Array', () => {
      assert.strictEqual(isLogAttributeValue(new Uint8Array([1, 2, 3])), true);
      assert.strictEqual(isLogAttributeValue(new Uint8Array(0)), true);
      assert.strictEqual(
        isLogAttributeValue(new Uint8Array([255, 0, 128])),
        true
      );
    });
  });

  describe('should accept arrays', () => {
    it('should accept homogeneous arrays', () => {
      assert.strictEqual(isLogAttributeValue(['a', 'b', 'c']), true);
      assert.strictEqual(isLogAttributeValue([1, 2, 3]), true);
      assert.strictEqual(isLogAttributeValue([true, false]), true);
    });

    it('should accept heterogeneous arrays', () => {
      assert.strictEqual(isLogAttributeValue(['string', 42, true]), true);
      assert.strictEqual(isLogAttributeValue([null, undefined, 'test']), true);
      assert.strictEqual(
        isLogAttributeValue(['test', new Uint8Array([1, 2])]),
        true
      );
    });

    it('should accept nested arrays', () => {
      assert.strictEqual(
        isLogAttributeValue([
          ['a', 'b'],
          [1, 2],
        ]),
        true
      );
      assert.strictEqual(
        isLogAttributeValue([
          [1, 2, 3],
          ['nested', 'array'],
        ]),
        true
      );
    });

    it('should accept arrays with null/undefined', () => {
      assert.strictEqual(isLogAttributeValue([null, 'test', undefined]), true);
      assert.strictEqual(isLogAttributeValue([]), true);
    });

    it('should accept arrays with objects', () => {
      assert.strictEqual(
        isLogAttributeValue([{ key: 'value' }, 'string']),
        true
      );
    });
  });

  describe('should accept objects/maps', () => {
    it('should accept simple objects', () => {
      assert.strictEqual(isLogAttributeValue({ key: 'value' }), true);
      assert.strictEqual(isLogAttributeValue({ num: 42, bool: true }), true);
    });

    it('should accept empty objects', () => {
      assert.strictEqual(isLogAttributeValue({}), true);
    });

    it('should accept nested objects', () => {
      const nested = {
        level1: {
          level2: {
            deep: 'value',
            number: 123,
          },
        },
      };
      assert.strictEqual(isLogAttributeValue(nested), true);
    });

    it('should accept objects with arrays', () => {
      const obj = {
        strings: ['a', 'b'],
        numbers: [1, 2, 3],
        mixed: ['str', 42, true],
      };
      assert.strictEqual(isLogAttributeValue(obj), true);
    });

    it('should accept objects with null/undefined values', () => {
      assert.strictEqual(
        isLogAttributeValue({ nullVal: null, undefVal: undefined }),
        true
      );
    });

    it('should accept objects with byte arrays', () => {
      assert.strictEqual(
        isLogAttributeValue({ bytes: new Uint8Array([1, 2, 3]) }),
        true
      );
    });

    it('should accept plain objects without prototypes', () => {
      const objWithoutProto = Object.create(null);
      objWithoutProto.key = 'value';
      objWithoutProto.number = 42;
      assert.strictEqual(isLogAttributeValue(objWithoutProto), true);
    });

    it('should accept nested objects without prototypes', () => {
      const parent = Object.create(null);
      const child = Object.create(null);
      child.deep = 'value';
      parent.nested = child;
      parent.regular = { withProto: true };
      assert.strictEqual(isLogAttributeValue(parent), true);
    });

    it('should accept objects without prototypes containing arrays', () => {
      const obj = Object.create(null);
      obj.strings = ['a', 'b', 'c'];
      obj.mixed = [1, 'two', true];
      obj.bytes = new Uint8Array([1, 2, 3]);
      assert.strictEqual(isLogAttributeValue(obj), true);
    });
  });

  describe('should accept complex combinations', () => {
    it('should accept deeply nested structures', () => {
      const complex = {
        scalars: {
          str: 'test',
          num: 42,
          bool: true,
        },
        arrays: {
          homogeneous: ['a', 'b', 'c'],
          heterogeneous: [1, 'two', true, null],
          nested: [
            [1, 2],
            ['a', 'b'],
          ],
        },
        bytes: new Uint8Array([255, 254, 253]),
        nullish: {
          nullValue: null,
          undefinedValue: undefined,
        },
        empty: {},
      };
      assert.strictEqual(isLogAttributeValue(complex), true);
    });

    it('should accept arrays of complex objects', () => {
      const arrayOfObjects = [
        { name: 'obj1', value: 123 },
        { name: 'obj2', nested: { deep: 'value' } },
        { bytes: new Uint8Array([1, 2, 3]) },
      ];
      assert.strictEqual(isLogAttributeValue(arrayOfObjects), true);
    });
  });

  describe('should reject invalid values', () => {
    it('should reject functions', () => {
      assert.strictEqual(
        isLogAttributeValue(() => {}),
        false
      );
      assert.strictEqual(
        isLogAttributeValue(function () {}),
        false
      );
    });

    it('should reject symbols', () => {
      assert.strictEqual(isLogAttributeValue(Symbol('test')), false);
      assert.strictEqual(isLogAttributeValue(Symbol.for('test')), false);
    });

    it('should reject Date objects', () => {
      assert.strictEqual(isLogAttributeValue(new Date()), false);
    });

    it('should reject RegExp objects', () => {
      assert.strictEqual(isLogAttributeValue(/test/), false);
    });

    it('should reject Error objects', () => {
      assert.strictEqual(isLogAttributeValue(new Error('test')), false);
    });

    it('should reject class instances', () => {
      class TestClass {
        value = 'test';
      }
      assert.strictEqual(isLogAttributeValue(new TestClass()), false);
    });

    it('should reject Map objects', () => {
      assert.strictEqual(isLogAttributeValue(new Map()), false);
      assert.strictEqual(
        isLogAttributeValue(new Map([['key', 'value']])),
        false
      );

      const nestedMap = new Map();
      nestedMap.set('nested', new Map([['inner', 'value']]));
      assert.strictEqual(isLogAttributeValue(nestedMap), false);
    });

    it('should reject Set objects', () => {
      assert.strictEqual(isLogAttributeValue(new Set()), false);
      assert.strictEqual(isLogAttributeValue(new Set([1, 2, 3])), false);
      assert.strictEqual(isLogAttributeValue(new Set(['a', 'b', 'c'])), false);
    });

    it('should reject WeakMap and WeakSet objects', () => {
      assert.strictEqual(isLogAttributeValue(new WeakMap()), false);
      assert.strictEqual(isLogAttributeValue(new WeakSet()), false);
    });

    it('should reject arrays containing invalid values', () => {
      assert.strictEqual(isLogAttributeValue(['valid', () => {}]), false);
      assert.strictEqual(isLogAttributeValue([Symbol('test'), 'valid']), false);
      assert.strictEqual(isLogAttributeValue([new Date()]), false);
      assert.strictEqual(isLogAttributeValue([new Map()]), false);
      assert.strictEqual(
        isLogAttributeValue(['valid', new Set([1, 2, 3])]),
        false
      );
    });

    it('should reject objects containing invalid values', () => {
      assert.strictEqual(
        isLogAttributeValue({ valid: 'test', invalid: () => {} }),
        false
      );
      assert.strictEqual(
        isLogAttributeValue({ symbol: Symbol('test') }),
        false
      );
      assert.strictEqual(isLogAttributeValue({ date: new Date() }), false);
      assert.strictEqual(
        isLogAttributeValue({ map: new Map([['key', 'value']]) }),
        false
      );
      assert.strictEqual(
        isLogAttributeValue({ set: new Set([1, 2, 3]) }),
        false
      );
    });

    it('should reject deeply nested invalid values', () => {
      const nested = {
        level1: {
          level2: {
            valid: 'value',
            invalid: Symbol('test'),
          },
        },
      };
      assert.strictEqual(isLogAttributeValue(nested), false);
    });

    it('should reject arrays with nested invalid values', () => {
      const nestedArray = [
        ['valid', 'array'],
        ['has', Symbol('invalid')],
      ];
      assert.strictEqual(isLogAttributeValue(nestedArray), false);
    });
  });

  describe('edge cases', () => {
    it('should handle circular references gracefully', () => {
      const circular: any = { a: 'test' };
      circular.self = circular;

      // This should not throw an error, though it might return false
      // The exact behavior isn't specified in the OpenTelemetry spec
      const result = isLogAttributeValue(circular);
      assert.strictEqual(typeof result, 'boolean');
    });

    it('should handle very deep nesting', () => {
      let deep: any = 'bottom';
      for (let i = 0; i < 100; i++) {
        deep = { level: i, nested: deep };
      }

      const result = isLogAttributeValue(deep);
      assert.strictEqual(typeof result, 'boolean');
    });

    it('should handle large arrays', () => {
      const largeArray = new Array(1000).fill('test');
      assert.strictEqual(isLogAttributeValue(largeArray), true);
    });
  });
});

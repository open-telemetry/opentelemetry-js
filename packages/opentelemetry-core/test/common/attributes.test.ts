/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {
  AddAttributeDecision,
  cleanAttributes,
  cleanSimpleAttributes,
  isAnyValue,
  isAttributeValue,
  isSimpleAttributeValue,
  maybeAddAttribute,
  maybeAddSimpleAttribute,
  sanitizeAttributes,
} from '../../src/common/attributes';

describe('attributes', () => {
  describe('isAttributeValue (deprecated)', () => {
    it('should allow primitive values', () => {
      assert.ok(isAttributeValue(0));
      assert.ok(isAttributeValue(true));
      assert.ok(isAttributeValue('str'));
    });

    it('should not allow objects', () => {
      assert.ok(!isAttributeValue({}));
    });

    it('should allow homogeneous arrays', () => {
      assert.ok(isAttributeValue([]));
      assert.ok(isAttributeValue([0, 1, 2]));
      assert.ok(isAttributeValue([true, false, true]));
      assert.ok(isAttributeValue(['str1', 'str2', 'str3']));
    });

    it('should allow homogeneous arrays with null values', () => {
      assert.ok(isAttributeValue([null]));
      assert.ok(isAttributeValue([0, null, 2]));
      assert.ok(isAttributeValue([true, null, true]));
      assert.ok(isAttributeValue(['str1', undefined, 'str3']));
    });

    it('should not allow heterogeneous arrays', () => {
      assert.ok(!isAttributeValue([0, false, 2]));
      assert.ok(!isAttributeValue([true, 'false', true]));
      assert.ok(!isAttributeValue(['str1', 2, 'str3']));
    });

    it('should not allow arrays of objects or nested arrays', () => {
      assert.ok(!isAttributeValue([{}]));
      assert.ok(!isAttributeValue([[]]));
    });
  });

  describe('sanitizeAttributes (deprecated)', () => {
    it('should remove invalid fields', () => {
      const attributes = sanitizeAttributes({
        str: 'string',
        num: 0,
        bool: false,
        object: {},
        arrStr: ['str1', null, 'str2'],
        arrNum: [0, null, 1],
        arrBool: [false, undefined, true],
        mixedArr: [0, false],
      });

      assert.deepStrictEqual(attributes, {
        str: 'string',
        num: 0,
        bool: false,
        arrStr: ['str1', null, 'str2'],
        arrNum: [0, null, 1],
        arrBool: [false, undefined, true],
      });
    });

    it('should copy the input', () => {
      const inp = {
        str: 'unmodified',
        arr: ['unmodified'],
      };

      const attributes = sanitizeAttributes(inp);

      inp.str = 'modified';
      inp.arr[0] = 'modified';

      assert.strictEqual(attributes.str, 'unmodified');
      assert.ok(Array.isArray(attributes.arr));
      assert.strictEqual(attributes.arr[0], 'unmodified');
    });
  });

  // Build an input attributes argument with all sorts of edge cases.
  const attrTypesSimple: any = {
    a01_Str: 'strVal',
    a02_Bool: true,
    a03_BoolFalse: false,
    a04_Int: 42,
    a05_Float: 3.141,

    a06_ArrayOfNums: [1, 2.5, 3.141],
    a07_ArrayOfStrings: ['a', 'b', 'c'],
    // Allowing null/undefined in "homogeneous" arrays, see https://github.com/open-telemetry/opentelemetry-js/pull/1488
    a08_ArrayOfStringsWithNullsUndefineds: ['a', null, 'c', undefined, 'e'],

    // Float edge cases
    a09_NaN: NaN,
    a10_Infinity: Infinity,
    a11_NegativeInfinity: -Infinity,
  };

  const attrTypesExtended: any = {
    a12_ArrayMixed: [1, 'b', null, { val: 'four' }],
    a13_Obj: { spam: 'eggs', foo: ['bar'] },
    a14_Buffer: Buffer.from('hello'),
    a15_Uint8Array: new Uint8Array([104, 101, 108, 108, 111]), // 'hello' ords
    a16_Null: null,
  };

  const attrTypesDroppedSilently: any = {
    a17_Undefined: undefined,
    [Symbol.for('a18_SymbolFor')]: 'strVal',
    [Symbol('a19_Symbol')]: 'strVal',
  };

  const circleA: any = { circleA: 1 };
  const circleB: any = { circleB: 2 };
  circleA.circleB = circleB;
  circleB.circleA = circleA;
  const attrTypesDroppedWithWarning: any = {
    a20_ArrayWithFuncSymbol: [1, () => {}, 3, Symbol('six'), 4],
    a21_Func: () => {},
    a22_Uint32Array: new Uint32Array([1, 2, 3]),
    a23_BigInt: 1152921504606846976n, // less than 2**64, bigger than MAX_SAFE_INTEGER
    a24_BigInt64Array: new BigInt64Array([1n, 2n, 3n]),
    a25_CircularRef: circleA,
  };

  const allTheAttrTypes: any = {
    ...attrTypesSimple,
    ...attrTypesExtended,
    ...attrTypesDroppedSilently,
    ...attrTypesDroppedWithWarning,
  };

  const NO_ATTR_LIMITS = {
    attributeCountLimit: Infinity,
    attributeValueLengthLimit: Infinity,
  };

  describe('isAnyValue', () => {
    for (const [k, v] of Object.entries({
      ...attrTypesSimple,
      ...attrTypesExtended,
    })) {
      it(`${k} -> true`, () => {
        assert.equal(isAnyValue(v), true);
      });
    }

    for (const [k, v] of Object.entries({
      ...attrTypesDroppedSilently,
      ...attrTypesDroppedWithWarning,
    })) {
      it(`${k} -> false`, () => {
        assert.equal(isAnyValue(v), false);
      });
    }
  });

  describe('isSimpleAttributeValue', () => {
    for (const [k, v] of Object.entries(attrTypesSimple)) {
      it(`${k} -> true`, () => {
        assert.equal(isSimpleAttributeValue(v), true);
      });
    }

    for (const [k, v] of Object.entries({
      ...attrTypesExtended,
      ...attrTypesDroppedSilently,
      ...attrTypesDroppedWithWarning,
    })) {
      it(`${k} -> false`, () => {
        assert.equal(isSimpleAttributeValue(v), false);
      });
    }
  });

  describe('cleanAttributes', () => {
    it('should remove invalid fields', () => {
      const { attributes, droppedAttributesCount } = cleanAttributes(
        allTheAttrTypes,
        NO_ATTR_LIMITS
      );

      assert.deepStrictEqual(attributes, {
        ...attrTypesSimple,
        ...attrTypesExtended,
      });
      assert.equal(
        droppedAttributesCount,
        Object.keys(attrTypesDroppedWithWarning).length
      );
    });

    // XXX handle `?` on attributes and droppedAttributesCount cases, update docstring

    it('should copy the input', () => {
      const inp = {
        str: 'unmodified',
        arr: ['unmodified'],
        obj: { key: 'unmodified' },
      };
      const { attributes } = cleanAttributes(inp, NO_ATTR_LIMITS);

      inp.str = 'modified';
      inp.arr[0] = 'modified';
      inp.obj.key = 'modified';

      assert.ok(attributes !== undefined);
      assert.strictEqual(attributes.str, 'unmodified');
      assert.ok(Array.isArray(attributes.arr));
      assert.strictEqual(attributes.arr[0], 'unmodified');
      assert.strictEqual((attributes as any).obj.key, 'unmodified');
    });

    // https://opentelemetry.io/docs/specs/otel/common/#attribute-limits
    it('handles attributeCountLimit', () => {
      const { attributes, droppedAttributesCount } = cleanAttributes(
        { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 },
        {
          attributeCountLimit: 5,
          attributeValueLengthLimit: Infinity,
        }
      );

      assert.deepEqual(attributes, { a: 1, b: 2, c: 3, d: 4, e: 5 });
      assert.equal(droppedAttributesCount, 2);
    });

    it('attributeCountLimit does not apply to arrays and nested objs', () => {
      const { attributes, droppedAttributesCount } = cleanAttributes(
        { arr: [1, 2, 3, 4, 5], obj: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 } },
        {
          attributeCountLimit: 3,
          attributeValueLengthLimit: Infinity,
        }
      );

      assert.deepEqual(attributes, {
        arr: [1, 2, 3, 4, 5],
        obj: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 },
      });
      assert.equal(droppedAttributesCount, 0);
    });

    // https://opentelemetry.io/docs/specs/otel/common/#attribute-limits
    it('handles attributeValueLengthLimit', () => {
      const { attributes, droppedAttributesCount } = cleanAttributes(
        {
          str: 'abcdefghij', // truncate
          buf: Buffer.from('hello'), // truncate
          uint8Array: new Uint8Array([104, 101, 108, 108, 111]), // truncate
          recursive: [
            'abcdefghij', // truncate
            {
              str: 'abcdefghij', // truncate
              buf: Buffer.from('hello'), // truncate
              uint8Array: new Uint8Array([104, 101, 108, 108, 111]), // truncate
            },
            3,
            4,
            5,
          ],
          // Not truncated:
          num: 123456789,
          arr: [1, 2, 3, 4, 5],
          obj: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 },
        },
        {
          attributeCountLimit: Infinity,
          attributeValueLengthLimit: 3,
        }
      );

      assert.deepEqual(attributes, {
        str: 'abc',
        buf: Buffer.from('hel'),
        uint8Array: new Uint8Array([104, 101, 108]),
        recursive: [
          'abc',
          {
            str: 'abc',
            buf: Buffer.from('hel'),
            uint8Array: new Uint8Array([104, 101, 108]),
          },
          3,
          4,
          5,
        ],
        // Not truncated:
        num: 123456789,
        arr: [1, 2, 3, 4, 5],
        obj: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 },
      });
      assert.equal(droppedAttributesCount, 0);
    });
  });

  describe('cleanSimpleAttributes', () => {
    it('should remove invalid fields', () => {
      const { attributes, droppedAttributesCount } = cleanSimpleAttributes(
        allTheAttrTypes,
        NO_ATTR_LIMITS
      );

      assert.deepStrictEqual(attributes, attrTypesSimple);
      assert.equal(
        droppedAttributesCount,
        Object.keys(attrTypesExtended).length +
          Object.keys(attrTypesDroppedWithWarning).length
      );
    });

    it('should copy the input', () => {
      const inp = {
        str: 'unmodified',
        arr: ['unmodified'],
      };
      const { attributes } = cleanSimpleAttributes(inp, NO_ATTR_LIMITS);

      inp.str = 'modified';
      inp.arr[0] = 'modified';

      assert.ok(attributes !== undefined);
      assert.strictEqual(attributes.str, 'unmodified');
      assert.ok(Array.isArray(attributes.arr));
      assert.strictEqual(attributes.arr[0], 'unmodified');
    });

    // https://opentelemetry.io/docs/specs/otel/common/#attribute-limits
    it('handles attributeCountLimit', () => {
      const { attributes, droppedAttributesCount } = cleanSimpleAttributes(
        { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 },
        {
          attributeCountLimit: 5,
          attributeValueLengthLimit: Infinity,
        }
      );

      assert.deepEqual(attributes, { a: 1, b: 2, c: 3, d: 4, e: 5 });
      assert.equal(droppedAttributesCount, 2);
    });

    it('attributeCountLimit does not apply to arrays', () => {
      const { attributes, droppedAttributesCount } = cleanSimpleAttributes(
        { arr: [1, 2, 3, 4, 5] },
        {
          attributeCountLimit: 3,
          attributeValueLengthLimit: Infinity,
        }
      );

      assert.deepEqual(attributes, { arr: [1, 2, 3, 4, 5] });
      assert.equal(droppedAttributesCount, 0);
    });

    // https://opentelemetry.io/docs/specs/otel/common/#attribute-limits
    it('handles attributeValueLengthLimit', () => {
      const { attributes, droppedAttributesCount } = cleanSimpleAttributes(
        {
          str: 'abcdefghij',
          recursive: ['abcdefghij', 'b', 'c', 'd', 'e'],
        },
        {
          attributeCountLimit: Infinity,
          attributeValueLengthLimit: 3,
        }
      );

      assert.deepEqual(attributes, {
        str: 'abc',
        recursive: ['abc', 'b', 'c', 'd', 'e'],
      });
      assert.equal(droppedAttributesCount, 0);
    });
  });

  describe('maybeAddAttribute', () => {
    it('DROP_UNDEFINED', () => {
      const attributes = { foo: 'bar' };
      const decision = maybeAddAttribute({
        key: 'spam',
        value: undefined,
        attributes,
        limits: NO_ATTR_LIMITS,
        currentAttributesCount: Object.keys(attributes).length,
      });

      assert.deepStrictEqual(attributes, { foo: 'bar' });
      assert.equal(decision, AddAttributeDecision.DROP_UNDEFINED);
    });

    for (const [k, v] of Object.entries(attrTypesDroppedWithWarning)) {
      it(`${k} -> DROP_INVALID`, () => {
        const attributes = { foo: 'bar' };
        const decision = maybeAddAttribute({
          key: 'spam',
          value: v,
          attributes,
          limits: NO_ATTR_LIMITS,
          currentAttributesCount: Object.keys(attributes).length,
        });
        assert.equal(decision, AddAttributeDecision.DROP_INVALID);
      });
    }

    it('DROP_LIMIT_REACHED', () => {
      const attributes = { a: 1, b: 2, c: 3 };
      const decision = maybeAddAttribute({
        key: 'spam',
        value: 'eggs',
        attributes,
        limits: {
          attributeCountLimit: 3,
          attributeValueLengthLimit: Infinity,
        },
        currentAttributesCount: Object.keys(attributes).length,
      });

      assert.deepStrictEqual(attributes, { a: 1, b: 2, c: 3 });
      assert.equal(decision, AddAttributeDecision.DROP_LIMIT_REACHED);
    });

    for (const [k, v] of Object.entries({
      ...attrTypesSimple,
      ...attrTypesExtended,
    })) {
      it(`ADD_NEW ${k}`, () => {
        const attributes = { a: 1, b: 2 };
        const decision = maybeAddAttribute({
          key: k,
          value: v,
          attributes,
          limits: {
            attributeCountLimit: 3,
            attributeValueLengthLimit: Infinity,
          },
          currentAttributesCount: Object.keys(attributes).length,
        });

        assert.deepStrictEqual(attributes, { a: 1, b: 2, [k]: v });
        assert.equal(decision, AddAttributeDecision.ADD_NEW);
      });
    }

    it('ADD_OVERWRITE_EXISTING', () => {
      const attributes = { a: 1, b: 2 };
      const decision = maybeAddAttribute({
        key: 'b',
        value: 'eggs',
        attributes,
        limits: {
          attributeCountLimit: 3,
          attributeValueLengthLimit: Infinity,
        },
        currentAttributesCount: Object.keys(attributes).length,
      });

      assert.deepStrictEqual(attributes, { a: 1, b: 'eggs' });
      assert.equal(decision, AddAttributeDecision.ADD_OVERWRITE_EXISTING);
    });
  });

  describe('maybeAddSimpleAttribute', () => {
    it('DROP_UNDEFINED', () => {
      const attributes = { foo: 'bar' };
      const decision = maybeAddSimpleAttribute({
        key: 'spam',
        value: undefined,
        attributes,
        limits: NO_ATTR_LIMITS,
        currentAttributesCount: Object.keys(attributes).length,
      });

      assert.deepStrictEqual(attributes, { foo: 'bar' });
      assert.equal(decision, AddAttributeDecision.DROP_UNDEFINED);
    });

    for (const [k, v] of Object.entries({
      ...attrTypesDroppedWithWarning,
      ...attrTypesExtended,
    })) {
      it(`${k} -> DROP_INVALID`, () => {
        const attributes = { foo: 'bar' };
        const decision = maybeAddSimpleAttribute({
          key: 'spam',
          value: v,
          attributes,
          limits: NO_ATTR_LIMITS,
          currentAttributesCount: Object.keys(attributes).length,
        });
        assert.equal(decision, AddAttributeDecision.DROP_INVALID);
      });
    }

    it('DROP_LIMIT_REACHED', () => {
      const attributes = { a: 1, b: 2, c: 3 };
      const decision = maybeAddSimpleAttribute({
        key: 'spam',
        value: 'eggs',
        attributes,
        limits: {
          attributeCountLimit: 3,
          attributeValueLengthLimit: Infinity,
        },
        currentAttributesCount: Object.keys(attributes).length,
      });

      assert.deepStrictEqual(attributes, { a: 1, b: 2, c: 3 });
      assert.equal(decision, AddAttributeDecision.DROP_LIMIT_REACHED);
    });

    for (const [k, v] of Object.entries(attrTypesSimple)) {
      it(`ADD_NEW ${k}`, () => {
        const attributes = { a: 1, b: 2 };
        const decision = maybeAddSimpleAttribute({
          key: k,
          value: v,
          attributes,
          limits: {
            attributeCountLimit: 3,
            attributeValueLengthLimit: Infinity,
          },
          currentAttributesCount: Object.keys(attributes).length,
        });

        assert.deepStrictEqual(attributes, { a: 1, b: 2, [k]: v });
        assert.equal(decision, AddAttributeDecision.ADD_NEW);
      });
    }

    it('ADD_OVERWRITE_EXISTING', () => {
      const attributes = { a: 1, b: 2 };
      const decision = maybeAddSimpleAttribute({
        key: 'b',
        value: 'eggs',
        attributes,
        limits: {
          attributeCountLimit: 3,
          attributeValueLengthLimit: Infinity,
        },
        currentAttributesCount: Object.keys(attributes).length,
      });

      assert.deepStrictEqual(attributes, { a: 1, b: 'eggs' });
      assert.equal(decision, AddAttributeDecision.ADD_OVERWRITE_EXISTING);
    });
  });
});

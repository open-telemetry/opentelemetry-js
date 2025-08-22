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
import { merge } from '../../../src/utils/merge';

const tests: TestResult[] = [];

tests.push({
  inputs: ['1', '2'],
  result: '2',
  desc: 'two strings',
});
tests.push({
  inputs: [1, 2],
  result: 2,
  desc: 'two numbers',
});
tests.push({
  inputs: [true, false],
  result: false,
  desc: 'two booleans',
});
tests.push({
  inputs: [false, true],
  result: true,
  desc: 'two booleans case 2',
});
tests.push({
  inputs: [undefined, undefined],
  result: undefined,
  desc: 'two undefined',
});
tests.push({
  inputs: [null, null],
  result: null,
  desc: 'two nulls',
});
tests.push({
  inputs: ['1', 1],
  result: 1,
  desc: 'string & number',
});
tests.push({
  inputs: ['1', false],
  result: false,
  desc: 'string & boolean',
});
tests.push({
  inputs: ['1', undefined],
  result: undefined,
  desc: 'string & undefined',
});
tests.push({
  inputs: ['1', null],
  result: null,
  desc: 'string & null',
});
tests.push({
  inputs: [3, '1'],
  result: '1',
  desc: 'number & string',
});
tests.push({
  inputs: [3, false],
  result: false,
  desc: 'number & boolean',
});
tests.push({
  inputs: [3, undefined],
  result: undefined,
  desc: 'number & undefined',
});
tests.push({
  inputs: [3, null],
  result: null,
  desc: 'number & null',
});
tests.push({
  inputs: [false, '3'],
  result: '3',
  desc: 'boolean & string',
});
tests.push({
  inputs: [false, 3],
  result: 3,
  desc: 'boolean & number',
});
tests.push({
  inputs: [false, undefined],
  result: undefined,
  desc: 'boolean & undefined',
});
tests.push({
  inputs: [false, null],
  result: null,
  desc: 'boolean & null',
});
tests.push({
  inputs: [undefined, '1'],
  result: '1',
  desc: 'undefined & string',
});
tests.push({
  inputs: [undefined, 1],
  result: 1,
  desc: 'undefined & number',
});
tests.push({
  inputs: [undefined, false],
  result: false,
  desc: 'undefined & boolean',
});
tests.push({
  inputs: [undefined, null],
  result: null,
  desc: 'undefined & null',
});
tests.push({
  inputs: [null, '1'],
  result: '1',
  desc: 'null & string',
});
tests.push({
  inputs: [null, 1],
  result: 1,
  desc: 'null & number',
});
tests.push({
  inputs: [null, false],
  result: false,
  desc: 'null & boolean',
});
tests.push({
  inputs: [null, undefined],
  result: undefined,
  desc: 'null & undefined',
});

const date1 = new Date(327164400000);
const date2 = new Date(358700400000);
tests.push({
  inputs: [date1, date2],
  result: date2,
  desc: 'two dates',
});

tests.push({
  inputs: [/.+/g, /.a+/g],
  result: /.a+/g,
  desc: 'two regexp',
});

tests.push({
  inputs: [1, { a: 1 }],
  result: { a: 1 },
  desc: 'primitive with object',
});

tests.push({
  inputs: [{ a: 1 }, 1],
  result: 1,
  desc: 'object with primitive',
});

const arrResult1: any = [1, 2, 3];
arrResult1['foo'] = 1;
tests.push({
  inputs: [[1, 2, 3], { foo: 1 }],
  result: arrResult1,
  desc: 'array with object',
});

tests.push({
  inputs: [{ foo: 1 }, [1, 2, 3]],
  result: [1, 2, 3],
  desc: 'object with array',
});

tests.push({
  inputs: [
    { a: 1, c: 1 },
    { a: 2, b: 3 },
  ],
  result: { a: 2, b: 3, c: 1 },
  desc: 'two objects',
});

tests.push({
  inputs: [
    { a: 1, c: 1 },
    { a: 2, b: 3, c: { foo: 1 } },
  ],
  result: { a: 2, b: 3, c: { foo: 1 } },
  desc: 'two objects 2nd with nested',
});

tests.push({
  inputs: [
    { a: 1, c: { bar: 1, d: { bla: 2 } } },
    { a: 2, b: 3, c: { foo: 1 } },
  ],
  result: { a: 2, b: 3, c: { bar: 1, d: { bla: 2 }, foo: 1 } },
  desc: 'two objects with nested objects',
});

tests.push({
  inputs: [
    [1, 2, 3],
    [4, 5],
  ],
  result: [1, 2, 3, 4, 5],
  desc: 'two arrays with numbers',
});

tests.push({
  inputs: [
    [1, 2, 3, { foo: 1 }],
    [4, 5, { foo: 2 }],
  ],
  result: [1, 2, 3, { foo: 1 }, 4, 5, { foo: 2 }],
  desc: 'two arrays, with number and objects',
});

tests.push({
  inputs: [
    { a: 1, c: 1 },
    { a: 2, b: 3 },
    { a: 3, c: 2, d: 1 },
  ],
  result: { a: 3, b: 3, c: 2, d: 1 },
  desc: 'three objects',
});

tests.push({
  inputs: [
    { a: 1, c: 1, foo: { bar1: 1 } },
    { a: 2, b: 3, foo: { bar1: 2 } },
    { a: 3, c: 2, d: 1, foo: { bar2: 1 } },
  ],
  result: { a: 3, b: 3, c: 2, d: 1, foo: { bar1: 2, bar2: 1 } },
  desc: 'three nested objects',
});

tests.push({
  inputs: [
    { a: 1, c: { bar: 1, d: { bla: 2 } } },
    { a: 2, b: 3, c: { foo: 1, bar: undefined } },
  ],
  result: { a: 2, b: 3, c: { d: { bla: 2 }, foo: 1 } },
  desc: 'two objects with nested objects and undefined',
});

class A {
  constructor(private _name = 'foo') {}

  getName() {
    return this._name;
  }
}

class B extends A {
  constructor(
    name = 'foo',
    private _ver = 1
  ) {
    super(name);
  }
  getVer() {
    return this._ver;
  }
}

const a = new A('foo');
const b = new B('bar');

tests.push({
  inputs: [
    { a: 1, c: 1, foo: a, foo2: { a: 1 } },
    { a: 2, b: 3, foo: b, foo2: { b: 1, a: a } },
  ],
  result: { a: 2, b: 3, c: 1, foo: b, foo2: { a: a, b: 1 } },
  desc: 'two objects with nested objects and objects created from classes',
});

describe('merge', () => {
  tests.forEach((test, index) => {
    it(`should merge ${test.desc}`, () => {
      const result = merge(...test.inputs);

      assert.deepStrictEqual(
        result,
        test.result,
        `test ${index + 1} '${test.desc}' failed`
      );
    });
  });

  it('should create a shallow copy when merging plain objects', () => {
    const a = { a: 1, c: 1, foo: { bar1: 1 } };
    const b = { b: 1, c: 2, foo: { bar2: 2 }, arr: [1, 2, 3] };

    const result = merge(a, b);
    a.a = 5;
    b.b = 9;
    b.arr.push(5);

    assert.deepStrictEqual(result, {
      a: 1,
      c: 2,
      foo: { bar1: 1, bar2: 2 },
      b: 1,
      arr: [1, 2, 3],
    });
  });

  it('should ignore cyclic reference', () => {
    const a: any = { a: 1, c: 1, foo: { bar1: 1 } };
    a.f = a;
    const b: any = { b: 1, c: 2, foo: { bar2: 2 }, arr: [1, 2, 3] };
    b.f = b;

    const result = merge(a, b);
    assert.deepStrictEqual(result, {
      a: 1,
      c: 2,
      foo: { bar1: 1, bar2: 2 },
      f: { a: 1, c: 2, b: 1, arr: [1, 2, 3] },
      b: 1,
      arr: [1, 2, 3],
    });
  });

  it('should not fail for 1 argument', () => {
    const result = merge(1);
    assert.deepStrictEqual(result, 1);
  });

  it('should not fail for 0 arguments', () => {
    const result = merge();
    assert.deepStrictEqual(result, undefined);
  });

  it('should merge function', () => {
    const a = {
      a: 1,
      b: 2,
    };
    const b = {
      a: 2,
      c: function () {
        return 'foo';
      },
    };
    const result = merge(a, b);
    assert.deepStrictEqual(result, {
      a: 2,
      b: 2,
      c: b.c,
    });
  });

  it('should allow maximum of 20 levels deep', () => {
    const a = {};
    const b = {};

    function add(obj: any, added: any) {
      obj.foo = added;
      return obj.foo;
    }

    let x = a;
    let y = b;
    for (let i = 0, j = 25; i < j; i++) {
      const foo = { c: i + 1 };
      x = add(x, foo);
      y = add(y, foo);
    }

    const result = merge(a, b);
    let check = result.foo;
    let count = 0;
    while (check.foo) {
      count++;
      check = check.foo;
    }
    assert.deepStrictEqual(count, 19);
  });
});

interface TestResult {
  desc: string;
  inputs: any[];
  result: any;
}

/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const Benchmark = require('benchmark');
const { toAnyValue } = require('../../../dist/common/internal.cjs');
const { JSON_ENCODER } = require('../../../dist/common/utils.cjs');

const suite = new Benchmark.Suite();

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add('toAnyValue Uint8Array (JSON)', function () {
  toAnyValue(new Uint8Array([1, 2, 3, 4, 5]), JSON_ENCODER);
});

suite.add('toAnyValue string', function () {
  toAnyValue('test-string-value');
});

suite.add('toAnyValue integer', function () {
  toAnyValue(42);
});

suite.add('toAnyValue array of strings', function () {
  toAnyValue(['a', 'b', 'c', 'd', 'e']);
});

suite.add('toAnyValue array of objects', function () {
  toAnyValue([{ a: 1 }, { b: 2 }, { c: 3 }]);
});

suite.add('toAnyValue nested object', function () {
  toAnyValue({ level1: { level2: { level3: 'deep' } } });
});

suite.add('toAnyValue complex nested', function () {
  toAnyValue({
    a: { b: { c: { d: 'value' } } },
    arr: [1, 2, 3],
    mixed: { nested: [{ x: 1 }, { y: 2 }] },
  });
});

suite.run();

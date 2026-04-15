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

const Benchmark = require('benchmark');
const { toAnyValue } = require('../../../build/common/internal.cjs');
const { JSON_ENCODER } = require('../../../build/common/utils.cjs');

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

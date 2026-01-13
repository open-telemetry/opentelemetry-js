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
const { serializeKeyPairs } = require('../../../build/src/baggage/utils');

const suite = new Benchmark.Suite();

// Test data - various sizes of key pairs
const emptyPairs = [];
const singlePair = ['key1=value1'];
const threePairs = ['key1=value1', 'key2=value2', 'key3=value3'];
const tenPairs = Array.from({ length: 10 }, (_, i) => `key${i}=value${i}`);
const fiftyPairs = Array.from({ length: 50 }, (_, i) => `key${i}=value${i}`);
// Pairs that will exceed max length (8192 bytes)
const longPairs = Array.from({ length: 100 }, (_, i) => `key${i}=${'x'.repeat(100)}`);

suite.on('cycle', event => {
  console.log(String(event.target));
});

// serializeKeyPairs benchmarks
suite.add('serializeKeyPairs empty', function() {
  serializeKeyPairs(emptyPairs);
});

suite.add('serializeKeyPairs single', function() {
  serializeKeyPairs(singlePair);
});

suite.add('serializeKeyPairs 3 pairs', function() {
  serializeKeyPairs(threePairs);
});

suite.add('serializeKeyPairs 10 pairs', function() {
  serializeKeyPairs(tenPairs);
});

suite.add('serializeKeyPairs 50 pairs', function() {
  serializeKeyPairs(fiftyPairs);
});

suite.add('serializeKeyPairs with truncation', function() {
  serializeKeyPairs(longPairs);
});

suite.run();

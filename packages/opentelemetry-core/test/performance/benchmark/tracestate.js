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
const { TraceState } = require('../../../build/src/trace/TraceState');

const suite = new Benchmark.Suite();

// Test data - various tracestate sizes
const singleEntry = 'vendor1=value1';
const threeEntries = 'vendor1=value1,vendor2=value2,vendor3=value3';
const tenEntries = Array.from({ length: 10 }, (_, i) => `vendor${i}=value${i}`).join(',');
// Use shorter keys for 32 entries to stay under MAX_TRACE_STATE_LEN (512)
const maxEntries = Array.from({ length: 32 }, (_, i) => `v${i}=x${i}`).join(',');

// Pre-create TraceState instances for serialization benchmarks
const tsEmpty = new TraceState();
const tsSingle = new TraceState(singleEntry);
const tsThree = new TraceState(threeEntries);
const tsTen = new TraceState(tenEntries);
const tsMax = new TraceState(maxEntries);

suite.on('cycle', event => {
  console.log(String(event.target));
});

// Parsing benchmarks
suite.add('TraceState#parse empty', function() {
  new TraceState();
});

suite.add('TraceState#parse single entry', function() {
  new TraceState(singleEntry);
});

suite.add('TraceState#parse 3 entries', function() {
  new TraceState(threeEntries);
});

suite.add('TraceState#parse 10 entries', function() {
  new TraceState(tenEntries);
});

suite.add('TraceState#parse 32 entries (max)', function() {
  new TraceState(maxEntries);
});

// Serialization benchmarks
suite.add('TraceState#serialize empty', function() {
  tsEmpty.serialize();
});

suite.add('TraceState#serialize single entry', function() {
  tsSingle.serialize();
});

suite.add('TraceState#serialize 3 entries', function() {
  tsThree.serialize();
});

suite.add('TraceState#serialize 10 entries', function() {
  tsTen.serialize();
});

suite.add('TraceState#serialize 32 entries (max)', function() {
  tsMax.serialize();
});

// Get/Set benchmarks
suite.add('TraceState#get existing key', function() {
  tsTen.get('vendor5');
});

suite.add('TraceState#get non-existing key', function() {
  tsTen.get('nonexistent');
});

suite.add('TraceState#set new key', function() {
  tsTen.set('newkey', 'newvalue');
});

suite.add('TraceState#set existing key (update)', function() {
  tsTen.set('vendor5', 'updatedvalue');
});

suite.run();

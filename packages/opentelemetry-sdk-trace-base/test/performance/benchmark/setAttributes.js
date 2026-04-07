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
const { BasicTracerProvider } = require('../../../build/index.cjs');

const tracerProvider = new BasicTracerProvider();
const tracer = tracerProvider.getTracer('test');

const suite = new Benchmark.Suite('setAttribute performance');

suite.on('cycle', event => {
  console.log(String(event.target));
});

// Generate attribute keys for different test sizes
function generateAttributeKeys(count) {
  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push(`attribute_key_${i.toString().padStart(4, '0')}`);
  }
  return keys;
}

const keys10 = generateAttributeKeys(10);
const keys50 = generateAttributeKeys(50);
const keys100 = generateAttributeKeys(100);
const keys128 = generateAttributeKeys(128);

// Test with 10 attributes
suite.add('setAttribute (10 attributes)', function () {
  const span = tracer.startSpan('span');
  for (let i = 0; i < keys10.length; i++) {
    span.setAttribute(keys10[i], 'test_value');
  }
  span.end();
});

// Test with 50 attributes
suite.add('setAttribute (50 attributes)', function () {
  const span = tracer.startSpan('span');
  for (let i = 0; i < keys50.length; i++) {
    span.setAttribute(keys50[i], 'test_value');
  }
  span.end();
});

// Test with 100 attributes
suite.add('setAttribute (100 attributes)', function () {
  const span = tracer.startSpan('span');
  for (let i = 0; i < keys100.length; i++) {
    span.setAttribute(keys100[i], 'test_value');
  }
  span.end();
});

// Test with 128 attributes (default limit)
suite.add('setAttribute (128 attributes - at limit)', function () {
  const span = tracer.startSpan('span');
  for (let i = 0; i < keys128.length; i++) {
    span.setAttribute(keys128[i], 'test_value');
  }
  span.end();
});

// Test setAttribute with overwriting existing keys (no Object.keys growth)
suite.add('setAttribute (100 overwrites of same key)', function () {
  const span = tracer.startSpan('span');
  for (let i = 0; i < 100; i++) {
    span.setAttribute('same_key', 'test_value_' + i);
  }
  span.end();
});

// Test setAttributes in bulk vs individual setAttribute
suite.add('setAttributes bulk (100 attributes)', function () {
  const span = tracer.startSpan('span');
  const attrs = {};
  for (let i = 0; i < 100; i++) {
    attrs[keys100[i]] = 'test_value';
  }
  span.setAttributes(attrs);
  span.end();
});

suite.run({ async: false });

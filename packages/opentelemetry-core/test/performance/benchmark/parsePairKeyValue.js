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
const { parsePairKeyValue } = require('../../../build/baggage/utils.cjs');

const suite = new Benchmark.Suite();

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add('parsePairKeyValue simple', function() {
  parsePairKeyValue('key1=value1');
});

suite.add('parsePairKeyValue with metadata', function() {
  parsePairKeyValue('key1=value1;metadata=sample');
});

suite.add('parsePairKeyValue URI encoded', function() {
  parsePairKeyValue('user%20id=john%20doe');
});

suite.add('parsePairKeyValue complex', function() {
  parsePairKeyValue('user%20id=john%20doe;metadata=user%20info;tenant=prod');
});

suite.run();

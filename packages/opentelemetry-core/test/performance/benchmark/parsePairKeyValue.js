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
const { parsePairKeyValue } = require('../../../build/src/baggage/utils');
const { baggageEntryMetadataFromString } = require('@opentelemetry/api');

// Constants
const BAGGAGE_PROPERTIES_SEPARATOR = ';';
const BAGGAGE_KEY_PAIR_SEPARATOR = '=';

// Old implementation for comparison
function parsePairKeyValue_Old(entry) {
  const valueProps = entry.split(BAGGAGE_PROPERTIES_SEPARATOR);
  if (valueProps.length <= 0) return;
  const keyPairPart = valueProps.shift();
  if (!keyPairPart) return;
  const separatorIndex = keyPairPart.indexOf(BAGGAGE_KEY_PAIR_SEPARATOR);
  if (separatorIndex <= 0) return;
  const key = decodeURIComponent(
    keyPairPart.substring(0, separatorIndex).trim()
  );
  const value = decodeURIComponent(
    keyPairPart.substring(separatorIndex + 1).trim()
  );
  let metadata;
  if (valueProps.length > 0) {
    metadata = baggageEntryMetadataFromString(
      valueProps.join(BAGGAGE_PROPERTIES_SEPARATOR)
    );
  }
  return { key, value, metadata };
}

const suite = new Benchmark.Suite();

suite.on('cycle', event => {
  console.log(String(event.target));
});

// Simple key-value pairs
suite.add('parsePairKeyValue simple (old)', function() {
  parsePairKeyValue_Old('key1=value1');
});

suite.add('parsePairKeyValue simple (new)', function() {
  parsePairKeyValue('key1=value1');
});

// Key-value with metadata
suite.add('parsePairKeyValue with metadata (old)', function() {
  parsePairKeyValue_Old('key1=value1;metadata=sample');
});

suite.add('parsePairKeyValue with metadata (new)', function() {
  parsePairKeyValue('key1=value1;metadata=sample');
});

// URI encoded values
suite.add('parsePairKeyValue URI encoded (old)', function() {
  parsePairKeyValue_Old('user%20id=john%20doe');
});

suite.add('parsePairKeyValue URI encoded (new)', function() {
  parsePairKeyValue('user%20id=john%20doe');
});

// Complex case
suite.add('parsePairKeyValue complex (old)', function() {
  parsePairKeyValue_Old('user%20id=john%20doe;metadata=user%20info;tenant=prod');
});

suite.add('parsePairKeyValue complex (new)', function() {
  parsePairKeyValue('user%20id=john%20doe;metadata=user%20info;tenant=prod');
});

suite.run();

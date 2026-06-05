/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const Benchmark = require('benchmark');
const { parsePairKeyValue } = require('../../../build/src/baggage/utils');

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

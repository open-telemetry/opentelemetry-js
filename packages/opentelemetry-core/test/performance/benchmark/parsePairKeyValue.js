/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const Benchmark = require('benchmark');
// `parsePairKeyValue` is internal-only and not exported from dist chunks;
// `parseBaggageHeaderString` is its public per-header wrapper.
const { parseBaggageHeaderString } = require('../../../dist/baggage/utils.cjs');

const suite = new Benchmark.Suite();

// Accumulate results so V8 can't dead-code-eliminate the calls.
let sink = 0;

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add('parseBaggageHeaderString simple', function() {
  sink += parseBaggageHeaderString('key1=value1', {}, 0, 0)[0];
});

suite.add('parseBaggageHeaderString with metadata', function() {
  sink += parseBaggageHeaderString('key1=value1;metadata=sample', {}, 0, 0)[0];
});

suite.add('parseBaggageHeaderString URI encoded', function() {
  sink += parseBaggageHeaderString('user%20id=john%20doe', {}, 0, 0)[0];
});

suite.add('parseBaggageHeaderString complex', function() {
  sink += parseBaggageHeaderString(
    'user%20id=john%20doe;metadata=user%20info,tenant=prod',
    {},
    0,
    0
  )[0];
});

suite.run();

if (sink < 0) {
  console.log(sink);
}

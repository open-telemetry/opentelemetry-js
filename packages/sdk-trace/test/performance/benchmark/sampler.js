/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const Benchmark = require('benchmark');
const { TraceIdRatioBasedSampler } = require('../../../build/src');

const suite = new Benchmark.Suite();

// Create sampler with 50% sampling ratio
const sampler = new TraceIdRatioBasedSampler(0.5);

// Generate a set of realistic trace IDs (32 hex characters)
const traceIds = [];
for (let i = 0; i < 1000; i++) {
  // Generate random 32-character hex string
  let traceId = '';
  for (let j = 0; j < 32; j++) {
    traceId += Math.floor(Math.random() * 16).toString(16);
  }
  traceIds.push(traceId);
}

let traceIdIndex = 0;

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add('TraceIdRatioBasedSampler.shouldSample', function () {
  const traceId = traceIds[traceIdIndex++ % traceIds.length];
  sampler.shouldSample({}, traceId);
});

suite.run();

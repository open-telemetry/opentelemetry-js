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

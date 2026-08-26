/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const Benchmark = require('benchmark');
const { RandomIdGenerator } = require('../../../build/src');

const idGenerator = new RandomIdGenerator();

const suite = new Benchmark.Suite();

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add('generateTraceId', () => idGenerator.generateTraceId());
suite.add('generateSpanId', () => idGenerator.generateSpanId());

suite.run();

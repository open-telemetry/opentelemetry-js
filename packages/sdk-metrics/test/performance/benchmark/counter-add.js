/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const Benchmark = require('benchmark');
const {
  MeterProvider,
  createAllowListAttributesProcessor,
} = require('../../../build/src');

const provider = new MeterProvider();
const meter = provider.getMeter('bench');
const counter = meter.createCounter('bench.counter');

const viewProvider = new MeterProvider({
  views: [
    {
      instrumentName: 'bench.counter.view',
      attributesProcessors: [
        createAllowListAttributesProcessor(['service', 'route']),
      ],
    },
  ],
});
const viewMeter = viewProvider.getMeter('bench');
const viewCounter = viewMeter.createCounter('bench.counter.view');

const fixedAttributes = {
  service: 'checkout',
  route: '/api/cart',
  method: 'POST',
  region: 'us-east-1',
};

const variedAttributes = [];
for (let i = 0; i < 100; i++) {
  variedAttributes.push({
    service: `svc-${i % 10}`,
    route: `/api/route-${i % 20}`,
    method: i % 2 === 0 ? 'GET' : 'POST',
    region: `us-${i % 5}`,
  });
}
let variedIdx = 0;

const suite = new Benchmark.Suite();

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add('Counter.add (fixed attributes)', () => {
  counter.add(1, fixedAttributes);
});

suite.add('Counter.add (varied attributes, 100 combos)', () => {
  counter.add(1, variedAttributes[variedIdx++ % 100]);
});

suite.add('Counter.add (with view attribute processor)', () => {
  viewCounter.add(1, fixedAttributes);
});

suite.run();

/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Benchmark from 'benchmark';
import { MeterProvider } from '../../src';

const provider = new MeterProvider();
const meter = provider.getMeter('bench');
const counter = meter.createCounter('bench.counter');

const fixedAttributes = {
  service: 'checkout',
  route: '/api/cart',
  method: 'POST',
  region: 'us-east-1',
};

const variedAttributes: Record<string, string>[] = [];
for (let i = 0; i < 100; i++) {
  variedAttributes.push({
    service: `svc-${i % 10}`,
    route: `/api/route-${i % 20}`,
    method: i % 2 === 0 ? 'GET' : 'POST',
    region: `us-${i % 5}`,
  });
}
let variedIdx = 0;

describe('Counter.add benchmark', function () {
  this.timeout(60000);

  it('Counter.add (fixed attributes)', done => {
    const suite = new Benchmark.Suite();
    suite
      .add('Counter.add (fixed attributes)', () => {
        counter.add(1, fixedAttributes);
      })
      .on('cycle', (event: Benchmark.Event) =>
        console.log(String(event.target))
      )
      .on('complete', () => done())
      .run({ async: true });
  });

  it('Counter.add (varied attributes, 100 combos)', done => {
    const suite = new Benchmark.Suite();
    suite
      .add('Counter.add (varied attributes, 100 combos)', () => {
        counter.add(1, variedAttributes[variedIdx++ % 100]);
      })
      .on('cycle', (event: Benchmark.Event) =>
        console.log(String(event.target))
      )
      .on('complete', () => done())
      .run({ async: true });
  });
});

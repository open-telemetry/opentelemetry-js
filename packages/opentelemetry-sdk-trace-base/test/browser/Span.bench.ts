/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Benchmark from 'benchmark';
import { BasicTracerProvider } from '../../src';

const tracerProvider = new BasicTracerProvider();
const tracer = tracerProvider.getTracer('test');

describe('Span benchmark (browser)', function () {
  this.timeout(60000);

  it('create spans (10 attributes) (browser)', done => {
    const suite = new Benchmark.Suite();
    suite
      .add('create spans (10 attributes) (browser)', () => {
        const span = tracer.startSpan('span');
        span.setAttribute('aaaaaaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('bbbbbbbbbbbbbbbbbbbb', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('cccccccccccccccccccc', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('dddddddddddddddddddd', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('eeeeeeeeeeeeeeeeeeee', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('ffffffffffffffffffff', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('gggggggggggggggggggg', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('hhhhhhhhhhhhhhhhhhhh', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('iiiiiiiiiiiiiiiiiiii', 'aaaaaaaaaaaaaaaaaaaa');
        span.setAttribute('jjjjjjjjjjjjjjjjjjjj', 'aaaaaaaaaaaaaaaaaaaa');
        span.end();
      })
      .on('cycle', (event: Benchmark.Event) =>
        console.log(String(event.target))
      )
      .on('complete', () => done())
      .run({ async: true });
  });

  it('create spans (10 attributes w/ setAttributes) (browser)', done => {
    const suite = new Benchmark.Suite();
    suite
      .add('create spans (10 attributes w/ setAttributes) (browser)', () => {
        const span = tracer.startSpan('span');
        span.setAttributes({
          aaaaaaaaaaaaaaaaaaaaaa: 'aaaaaaaaaaaaaaaaaaaa',
          bbbbbbbbbbbbbbbbbbbb: 'aaaaaaaaaaaaaaaaaaaa',
          cccccccccccccccccccc: 'aaaaaaaaaaaaaaaaaaaa',
          dddddddddddddddddddddd: 'aaaaaaaaaaaaaaaaaaaa',
          eeeeeeeeeeeeeeeeeeeee: 'aaaaaaaaaaaaaaaaaaaa',
          ffffffffffffffffffff: 'aaaaaaaaaaaaaaaaaaaa',
          gggggggggggggggggggg: 'aaaaaaaaaaaaaaaaaaaa',
          hhhhhhhhhhhhhhhhhhhhhh: 'aaaaaaaaaaaaaaaaaaaa',
          iiiiiiiiiiiiiiiiiiii: 'aaaaaaaaaaaaaaaaaaaa',
          jjjjjjjjjjjjjjjjjjjj: 'aaaaaaaaaaaaaaaaaaaa',
        });
        span.end();
      })
      .on('cycle', (event: Benchmark.Event) =>
        console.log(String(event.target))
      )
      .on('complete', () => done())
      .run({ async: true });
  });
});

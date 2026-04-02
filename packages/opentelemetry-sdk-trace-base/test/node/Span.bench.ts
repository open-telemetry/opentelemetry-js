/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Attributes, SpanContext } from '@opentelemetry/api';
import { TraceFlags } from '@opentelemetry/api';
import * as Benchmark from 'benchmark';
import { BasicTracerProvider } from '../../src';

const tracerProvider = new BasicTracerProvider();
const tracer = tracerProvider.getTracer('test');

/** Default span limit OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT / _LINK_ (128). */
function buildManyAttributes(count: number): Attributes {
  const attrs: Attributes = {};
  for (let i = 0; i < count; i++) {
    attrs[`k_${i.toString().padStart(4, '0')}`] = 'v';
  }
  return attrs;
}

const manySpanAttributes = buildManyAttributes(128);
const benchLinkContext: SpanContext = {
  traceId: 'e4cda95b652f4a1592b449d5929fda1b',
  spanId: '7e0c63257de34c92',
  traceFlags: TraceFlags.SAMPLED,
};

describe('Span benchmark', function () {
  this.timeout(60000);

  it('creates spans', done => {
    const suite = new Benchmark.Suite();
    suite
      .add('creates spans', () => {
        const span = tracer.startSpan('span');
        span.end();
      })
      .on('cycle', (event: Benchmark.Event) =>
        console.log(String(event.target))
      )
      .on('complete', () => done())
      .run({ async: true });
  });

  it('create spans (10 attributes)', done => {
    const suite = new Benchmark.Suite();
    suite
      .add('create spans (10 attributes)', () => {
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

  it('addEvent / addLink (128 attributes, at default per-event/link limit)', done => {
    const suite = new Benchmark.Suite();
    suite
      .add('addEvent (128 attributes)', () => {
        const span = tracer.startSpan('span');
        span.addEvent('evt', manySpanAttributes);
        span.end();
      })
      .add('addLink (128 attributes)', () => {
        const span = tracer.startSpan('span');
        span.addLink({
          context: benchLinkContext,
          attributes: manySpanAttributes,
        });
        span.end();
      })
      .on('cycle', (event: Benchmark.Event) =>
        console.log(String(event.target))
      )
      .on('complete', () => done())
      .run({ async: true });
  });

  it('create spans (10 attributes w/ setAttributes)', done => {
    const suite = new Benchmark.Suite();
    suite
      .add('create spans (10 attributes w/ setAttributes)', () => {
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

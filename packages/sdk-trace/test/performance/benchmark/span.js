/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const Benchmark = require('benchmark');
const { TraceFlags } = require('@opentelemetry/api');
const { TracerProvider } = require('../../../dist/index.cjs');

const tracerProvider = new TracerProvider();
const tracer = tracerProvider.getTracer('test');

function buildManyAttributes(count) {
  const attrs = {};
  for (let i = 0; i < count; i++) {
    attrs[`k_${i.toString().padStart(4, '0')}`] = 'v';
  }
  return attrs;
}

const manySpanAttributes = buildManyAttributes(128);
const benchLinkContext = {
  traceId: 'e4cda95b652f4a1592b449d5929fda1b',
  spanId: '7e0c63257de34c92',
  traceFlags: TraceFlags.SAMPLED,
};

const suite = new Benchmark.Suite();

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add('create spans (10 attributes)', () => {
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
});

suite.add('create spans (10 attributes w/ setAttributes)', () => {
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
});

suite.add('addEvent (128 attributes)', () => {
  const span = tracer.startSpan('span');
  span.addEvent('evt', manySpanAttributes);
  span.end();
});

suite.add('addLink (128 attributes)', () => {
  const span = tracer.startSpan('span');
  span.addLink({ context: benchLinkContext, attributes: manySpanAttributes });
  span.end();
});

suite.run();

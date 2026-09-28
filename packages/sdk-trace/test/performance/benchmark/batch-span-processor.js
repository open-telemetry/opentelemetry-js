/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const Benchmark = require('benchmark');
const { BatchSpanProcessor, TracerProvider } = require('../../../dist/index.cjs');
const { ExportResultCode } = require('@opentelemetry/core');

class NoopExporter {
  export(spans, resultCallback) {
    setTimeout(() => resultCallback({ code: ExportResultCode.SUCCESS }), 0);
  }

  shutdown() {
    return this.forceFlush();
  }

  forceFlush() {
    return Promise.resolve();
  }
}

const tracerProvider = new TracerProvider({
  spanProcessors: [new BatchSpanProcessor({ exporter: new NoopExporter() })],
});
const tracer = tracerProvider.getTracer('test');

function createSpan() {
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
}

const suite = new Benchmark.Suite();

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add('BatchSpanProcessor process span', () => {
  createSpan();
});

suite.run();

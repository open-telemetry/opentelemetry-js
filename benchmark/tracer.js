'use strict';

const benchmark = require('./benchmark');
const opentelemetry = require('@opentelemetry/core');
const { BasicTracer, BatchSpanProcessor, InMemorySpanExporter, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { NodeTracer } = require('@opentelemetry/node');

const exporter = new InMemorySpanExporter();
const logger = new opentelemetry.NoopLogger();

const setups = [
  {
    name: 'BasicTracer',
    tracer: new BasicTracer({ logger })
  },
  {
    name: 'NodeTracer',
    tracer: new NodeTracer({ logger })
  }
];

for (const setup of setups) {
  console.log(`Beginning ${setup.name} Benchmark...`);
  const tracer = setup.tracer;
  const suite = benchmark()
    .add('#startSpan', function () {
      const span = tracer.startSpan('op');
      span.end();
    })
    .add('#startSpan:parent', function () {
      const span = tracer.startSpan('op');
      const childSpan = tracer.startSpan('client-op', { parent: span });
      childSpan.end();
      span.end();
    })
    .add('#startSpan with attribute', function () {
      const span = tracer.startSpan('op');
      span.setAttribute('attr-key-one', 'attr-value-one');
      span.end();
    })
    .add('#startSpan with 30 attributes', function () {
      const span = tracer.startSpan('op');
      for (let j = 0; j < 30; j++) {
        span.setAttribute('attr-key-' + j, 'attr-value-' + j);
      }
      span.end();
    })
    .add('#startSpan with 100 attributes', function () {
      const span = tracer.startSpan('op');
      for (let j = 0; j < 100; j++) {
        span.setAttribute('attr-key-' + j, 'attr-value-' + j);
      }
      span.end();
    })
    .add('#startSpan with SimpleSpanProcessor', function () {
      const simpleSpanProcessor = new SimpleSpanProcessor(exporter);

      tracer.addSpanProcessor(simpleSpanProcessor);
      const span = tracer.startSpan('op');
      span.end();

      simpleSpanProcessor.shutdown();
    })
    .add('#startSpan with BatchSpanProcessor', function () {
      const batchSpanProcessor = new BatchSpanProcessor(exporter);

      tracer.addSpanProcessor(batchSpanProcessor);
      const span = tracer.startSpan('op');
      span.end();
      batchSpanProcessor.shutdown();
    });

  // run async
  suite.run({ async: false });
}

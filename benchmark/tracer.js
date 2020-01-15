'use strict';

const benchmark = require('./benchmark');
const opentelemetry = require('@opentelemetry/core');
const { BasicTracerProvider, BatchSpanProcessor, InMemorySpanExporter, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { NodeTracerProvider } = require('@opentelemetry/node');

const exporter = new InMemorySpanExporter();
const logger = new opentelemetry.NoopLogger();

const setups = [
  {
    name: 'BasicTracerProvider',
    provider: new BasicTracerProvider({ logger })
  },
  {
    name: 'NodeTracerProvider',
    provider: new NodeTracerProvider({ logger })
  }
];

for (const setup of setups) {
  console.log(`Beginning ${setup.name} Benchmark...`);
  const tracer = setup.provider.getTracer("benchmark");
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

      provider.addSpanProcessor(simpleSpanProcessor);
      const span = tracer.startSpan('op');
      span.end();

      simpleSpanProcessor.shutdown();
    })
    .add('#startSpan with BatchSpanProcessor', function () {
      const batchSpanProcessor = new BatchSpanProcessor(exporter);

      provider.addSpanProcessor(batchSpanProcessor);
      const span = tracer.startSpan('op');
      span.end();
      batchSpanProcessor.shutdown();
    });

  // run async
  suite.run({ async: false });
}

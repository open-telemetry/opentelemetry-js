'use strict';

const benchmark = require('./benchmark');
const opentelemetry = require('../packages/opentelemetry-core');
const { BasicTracerRegistry, BatchSpanProcessor, InMemorySpanExporter, SimpleSpanProcessor } = require('../packages/opentelemetry-tracing');

const logger = new opentelemetry.NoopLogger();

const setups = [
  {
    name: 'NoopTracerRegistry',
    registry: opentelemetry.getTracerRegistry()
  },
  {
    name: 'BasicTracerRegistry',
    registry: new BasicTracerRegistry({ logger })
  },
  {
    name: 'BasicTracerRegistry with SimpleSpanProcessor',
    registry: getRegistry(new SimpleSpanProcessor(new InMemorySpanExporter()))
  },
  {
    name: 'BasicTracerRegistry with BatchSpanProcessor',
    registry: getRegistry(new BatchSpanProcessor(new InMemorySpanExporter()))
  }
];

for (const setup of setups) {
  console.log(`Beginning ${setup.name} Benchmark...`);
  const tracer = setup.registry.getTracer("benchmark");
  const suite = benchmark(20)
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
    });

  // run async
  suite.run({ async: false });
}
function getRegistry(processor) {
  const registry = new BasicTracerRegistry({ logger });
  registry.addSpanProcessor(processor);
  return registry;
}


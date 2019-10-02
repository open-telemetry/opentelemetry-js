'use strict';

const benchmark = require('./benchmark');
const opentelemetry = require('@opentelemetry/core');
const { BasicTracer } = require('@opentelemetry/tracer-basic');
const { NodeTracer } = require('@opentelemetry/node-sdk');

let tracer;

const setups = [
  {
    name: 'NoopTracer'
  },
  {
    name: 'BasicTracer',
    tracer: new BasicTracer()
  },
  {
    name: 'NodeTracer',
    tracer: new NodeTracer()
  }
];

for (const setup of setups) {
  console.log(`Beginning ${setup.name} Benchmark...`);
  const suite = benchmark()
    .add('#startSpan', function () {
      if (setup.tracer) {
        opentelemetry.initGlobalTracer(setup.tracer);
      }
      tracer = opentelemetry.getTracer();
      tracer.startSpan('test-op');
    })
    .add('#startSpan:parent', function () {
      const span = tracer.startSpan('test-op');
      tracer.startSpan('test-op', { parent: span });
    });

  // run async
  suite.run({ async: false });
}

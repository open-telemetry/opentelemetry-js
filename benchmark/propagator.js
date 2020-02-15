'use strict';

const benchmark = require('./benchmark');
const opentelemetry = require('../packages/opentelemetry-core');

const setups = [
  {
    name: 'B3Format',
    propagator: new opentelemetry.B3Format(),
    injectCarrier: {},
    extractCarrier: {
      'x-b3-traceid': 'd4cda95b652f4a1592b449d5929fda1b',
      'x-b3-spanid': '6e0c63257de34c92'
    }
  },
  {
    name: 'HttpTraceContext',
    propagator: new opentelemetry.HttpTraceContext(),
    injectCarrier: {},
    extractCarrier: {
      traceparent: '00-d4cda95b652f4a1592b449d5929fda1b-6e0c63257de34c92-00'
    }
  }
];

const traceId = Uint8Array.from(Buffer.from('d4cda95b652f4a1592b449d5929fda1b', 'hex'));
const spanId = Uint8Array.from(Buffer.from('6e0c63257de34c92', 'hex'));

for (const setup of setups) {
  console.log(`Beginning ${setup.name} Benchmark...`);
  const propagator = setup.propagator;
  const suite = benchmark(100)
    .add('#Inject', function () {
      propagator.inject({
        traceId,
        spanId
      }, setup.name, setup.injectCarrier);
    })
    .add('#Extract', function () {
      propagator.extract(setup.name, setup.extractCarrier);
    });

  // run async
  suite.run({ async: false });
}

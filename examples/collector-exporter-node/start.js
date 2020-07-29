'use strict';

const opentelemetry = require('@opentelemetry/api');
// const { ConsoleLogger,  LogLevel} = require('@opentelemetry/core');
const { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { CollectorTraceExporter, CollectorMetricExporter, CollectorProtocolNode } = require('@opentelemetry/exporter-collector');
const { MeterProvider } = require('@opentelemetry/metrics');

const exporter = new CollectorTraceExporter({
  serviceName: 'basic-service',
  // logger: new ConsoleLogger(LogLevel.DEBUG),
  // headers: {
  //   foo: 'bar'
  // },
  protocolNode: CollectorProtocolNode.HTTP_PROTO,
  // protocolNode: CollectorProtocolNode.HTTP_JSON,
});

const metricExporter = new CollectorMetricExporter({
  serviceName: 'basic-metric-service',
  // logger: new ConsoleLogger(LogLevel.DEBUG),
});

const provider = new BasicTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();

const tracer = opentelemetry.trace.getTracer('example-collector-exporter-node');

// Create a span. A span must be closed.
const parentSpan = tracer.startSpan('main');
for (let i = 0; i < 10; i += 1) {
  doWork(parentSpan);
}
// Be sure to end the span.
parentSpan.end();

// give some time before it is closed
setTimeout(() => {
  // flush and close the connection.
  exporter.shutdown();
}, 2000);

function doWork(parent) {
  // Start another span. In this example, the main method already started a
  // span, so that'll be the parent span, and this will be a child span.
  const span = tracer.startSpan('doWork', {
    parent,
  });

  // simulate some random work.
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    // empty
  }
  // Set attributes to the span.
  span.setAttribute('key', 'value');

  span.setAttribute('mapAndArrayValue', [
    0, 1, 2.25, 'otel', {
      foo: 'bar',
      baz: 'json',
      array: [1, 2, 'boom'],
    },
  ]);

  // Annotate our span to capture metadata about our operation
  span.addEvent('invoking doWork');

  // end span
  span.end();
}

const meter = new MeterProvider({
  exporter: metricExporter,
  interval: 1000,
}).getMeter('example-prometheus');

const requestCounter = meter.createCounter('requests', {
  description: 'Example of a Counter',
});

const upDownCounter = meter.createUpDownCounter('test_up_down_counter', {
  description: 'Example of a UpDownCounter',
});

const labels = { pid: process.pid, environment: 'staging' };

setInterval(() => {
  requestCounter.bind(labels).add(1);
  upDownCounter.bind(labels).add(Math.random() > 0.5 ? 1 : -1);
}, 1000);

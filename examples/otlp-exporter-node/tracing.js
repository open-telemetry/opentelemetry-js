'use strict';

const {
  trace,
  context,
} = require('@opentelemetry/api');

// Metrics SDK and exporter were registered globally in ./opentelemetry-traces.js, so you can access it via `trace`
// from `@opentelemetry/api` - in your application code outside of setup, you should never refer to any
// `@opentelemetry/sdk-trace-*` types.
// Note: getting a tracer may be an expensive operation - so you should create it once, and then hold on to it for the
// lifetime of your process. You should avoid getting new tracers on hot-paths.
const tracer = trace.getTracer('example-otlp-exporter-node');

// Create a span. A span MUST be ended eventually.
const parentSpan = tracer.startSpan('main');
for (let i = 0; i < 10; i += 1) {
  doWork(parentSpan);
}

// Be sure to end the span - this makes it ready for export. Not ending spans may cause memory leaks.
parentSpan.end();

function doWork(parent) {
  // Start another span. In this example, the main method already started a
  // span, so that'll be the parent span, and this will be a child span.
  const ctx = trace.setSpan(context.active(), parent);
  const span = tracer.startSpan('doWork', undefined, ctx);

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

'use strict';

const opentelemetry = require('@opentelemetry/core');
const { BasicTracerRegistry, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { CanonicalCode } = require('@opentelemetry/types');
const { StackdriverTraceExporter } = require('@opentelemetry/exporter-stackdriver-trace');

// Initialize an exporter
const exporter = new StackdriverTraceExporter({
  projectId: '<PROJECT_ID>',
});

const registry = new BasicTracerRegistry();

// Configure span processor to send spans to the provided exporter
registry.addSpanProcessor(new SimpleSpanProcessor(exporter));

// Initialize the OpenTelemetry APIs to use the BasicTracerRegistry bindings
opentelemetry.initGlobalTracerRegistry(registry);
const tracer = opentelemetry.getTracer('stackdriver-basic');

// Create a span. A span must be closed.
const root = tracer.startSpan('main');
const related = tracer.startSpan('related', {
  links: [{ spanContext: root.context() }],
});

for (let i = 0; i < 10; i += 1) {
  doWork(root);
  doWork(related);
}
// Be sure to end the span.
root.setStatus({
  code: CanonicalCode.UNKNOWN,
});
root.end();
related.end();

// flush and close the connection.
exporter.shutdown();

function doWork(parent) {
  // Start another span. In this example, the main method already started a
  // span, so that'll be the parent span, and this will be a child span.
  const span = tracer.startSpan('doWork', { parent });

  // simulate some random work.
  const work = Math.floor(Math.random() * 40000000);
  for (let i = 0; i <= work; i += 1) {
    // empty
  }

  if (work % 2 === 1) {
    span.setStatus({
      code: CanonicalCode.UNKNOWN,
    });
  }

  // Set attributes to the span.
  span.setAttribute('key', 'value');

  // Annotate our span to capture metadata about our operation
  span.addEvent('invoking doWork').end();
}

'use strict';

const opentelemetry = require('@opentelemetry/core');
const { BasicTracer, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { CanonicalCode } = require('@opentelemetry/types');
const { StackdriverTraceExporter } = require('@opentelemetry/exporter-stackdriver-trace');

// Initialize an exporter
const exporter = new StackdriverTraceExporter({
  serviceName: 'basic-service',
  logger: new opentelemetry.ConsoleLogger()
});

const tracer = new BasicTracer();

// Configure span processor to send spans to the provided exporter
tracer.addSpanProcessor(new SimpleSpanProcessor(exporter));

// Initialize the OpenTelemetry APIs to use the BasicTracer bindings
opentelemetry.initGlobalTracer(tracer);

// Create a span. A span must be closed.
const root = opentelemetry.getTracer().startSpan('main');
const related = opentelemetry.getTracer().startSpan('related', {
  links: [{ spanContext: root.context() }]
});

for (let i = 0; i < 10; i++) {
  doWork(root);
  doWork(related);
}
// Be sure to end the span.
root.setStatus({
  code: CanonicalCode.UNKNOWN
})
root.end();
related.end();

// flush and close the connection.
exporter.shutdown();

function doWork(parent) {
  // Start another span. In this example, the main method already started a
  // span, so that'll be the parent span, and this will be a child span.
  const span = opentelemetry.getTracer().startSpan('doWork', {
    parent: parent
  });

  // simulate some random work.
  const work = Math.floor(Math.random() * 40000000);
  for (let i = 0; i <= work; i++) { }

  if (work % 2 === 1) {
    span.setStatus({
      code: CanonicalCode.UNKNOWN
    })
  }

  // Set attributes to the span.
  span.setAttribute('key', 'value');

  // Annotate our span to capture metadata about our operation
  span.addEvent('invoking doWork').end();
}

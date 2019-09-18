'use strict';

const opentelemetry = require('@opentelemetry/core');
const { BasicTracer } = require('@opentelemetry/basic-tracer');

// Initialize the OpenTelemetry APIs to use the BasicTracer bindings
opentelemetry.initGlobalTracer(new BasicTracer());

// Create a span. A span must be closed.
const span = opentelemetry.getTracer().startSpan('main');
for (let i = 0; i < 10; i++) {
  doWork(span);
}
// Be sure to end the span.
span.end();

function doWork (parent) {
  // Start another span. In this example, the main method already started a
  // span, so that'll be the parent span, and this will be a child span.
  const span = opentelemetry.getTracer().startSpan('doWork', {
    parent: parent
  });

  for (let i = 0; i <= 40000000; i++) {} // short delay

  // Set attributes to the span.
  span.setAttribute('key', 'value');

  // Annotate our span to capture metadata about our operation
  span.addEvent('invoking doWork').end();
}

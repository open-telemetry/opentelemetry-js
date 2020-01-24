'use strict';

const opentelemetry = require('@opentelemetry/core');
const { BasicTracerRegistry, BatchSpanProcessor, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { CollectorExporter } = require('@opentelemetry/exporter-collector');

const registry = new BasicTracerRegistry();

const zipkinExporter = new ZipkinExporter({ serviceName: 'basic-service' });
const jaegerExporter = new JaegerExporter({
  serviceName: 'basic-service',
});
const collectorExporter = new CollectorExporter({ serviceName: 'basic-service' });

// It is recommended to use this BatchSpanProcessor for better performance
// and optimization, especially in production.
registry.addSpanProcessor(new BatchSpanProcessor(zipkinExporter, {
  // This is added for example, default size is 100.
  bufferSize: 10,
}));

const tracer = opentelemetry.getTracer('default');

tracer.addSpanProcessor(new BatchSpanProcessor(jaegerExporter), {
  bufferSize: 10,
});

registry.addSpanProcessor(new SimpleSpanProcessor(collectorExporter));

// Initialize the OpenTelemetry APIs to use the BasicTracerRegistry bindings
opentelemetry.initGlobalTracerRegistry(registry);

// Create a span. A span must be closed.
const parentSpan = tracer.startSpan('main');
for (let i = 0; i < 10; i += 1) {
  doWork(parentSpan);
}
// Be sure to end the span.
parentSpan.end();

// flush and close the connection.
zipkinExporter.shutdown();
jaegerExporter.shutdown();
collectorExporter.shutdown();

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

  // Annotate our span to capture metadata about our operation
  span.addEvent('invoking doWork').end();
}

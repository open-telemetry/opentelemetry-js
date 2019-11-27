const opentelemetry = require('@opentelemetry/core');
const { BasicTracer, BatchSpanProcessor, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

const tracer = new BasicTracer();

const zipkinExporter = new ZipkinExporter({serviceName: 'basic-service'});
const jaegerExporter = new JaegerExporter({
  serviceName: 'basic-service',
  // The default flush interval is 5 seconds.
  flushInterval: 2000
})

// It is recommended to use this BatchSpanProcessor for better performance
// and optimization, especially in production.
tracer.addSpanProcessor(new BatchSpanProcessor(zipkinExporter, {
  bufferSize: 10 // This is added for example, default size is 100.
}));

// It is recommended to use SimpleSpanProcessor in case of Jaeger exporter as
// it's internal client already handles the spans with batching logic.
tracer.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));

// Initialize the OpenTelemetry APIs to use the BasicTracer bindings
opentelemetry.initGlobalTracer(tracer);

// Create a span. A span must be closed.
const span = opentelemetry.getTracer().startSpan('main');
for (let i = 0; i < 10; i++) {
  doWork(span);
}
// Be sure to end the span.
span.end();

// flush and close the connection.
zipkinExporter.shutdown();
jaegerExporter.shutdown();

function doWork(parent) {
  // Start another span. In this example, the main method already started a
  // span, so that'll be the parent span, and this will be a child span.
  const span = opentelemetry.getTracer().startSpan('doWork', {
    parent: parent
  });

  // simulate some random work.
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i++) { }

  // Set attributes to the span.
  span.setAttribute('key', 'value');

  // Annotate our span to capture metadata about our operation
  span.addEvent('invoking doWork').end();
}

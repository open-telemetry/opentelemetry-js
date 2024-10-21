// tracer.js
const { NodeTracerProvider } = require('@opentelemetry/node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');

// Create a tracer provider
const provider = new NodeTracerProvider();

// Configure the Jaeger exporter
const jaegerExporter = new JaegerExporter({
  serviceName: 'my-axios-service', // Your service name
  host: 'localhost', // Jaeger host
  port: 6831, // Jaeger port for UDP
});

// Add the exporter to the provider
provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));

// Register the provider
provider.register();

// Get the tracer
const tracer = provider.getTracer('my-axios-service'); // Ensure your service name matches
module.exports = tracer;

'use strict';

const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node')
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
} = require('@opentelemetry/api');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
// const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
// const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');

// Optional: set up diagnostics logging, this can help in troubleshooting during development.
// - It is recommended to turn this off in production as the DiagConsoleLogger writes to stdout.
// - If writing to stdout is acceptable to you, it is recommended to change the log level to WARNING or ERROR.
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// Create an OTLP exporter. Not specifying a `url` in the constructor options will have it export to `localhost`
// and the OTLP port (4318 for HTTP, 4317 for gRPC). You can set additional headers via the constructor options.
const exporter = new OTLPTraceExporter();

const provider = new NodeTracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'basic-service',
  }),
  spanProcessors: [
    new SimpleSpanProcessor(exporter),
    new SimpleSpanProcessor(new ConsoleSpanExporter()),
  ]
});

// Set up shutdown behavior as OTel JS does NOT automatically shut down and flush data.
// By setting this up, you can ensure that previously written data is flushed before the process exits.
// By not setting this up, you risk data-loss on shutdown - especially on short-lived processes.

// Gracefully shutdown Trace SDK if a SIGTERM is received
process.on('SIGTERM', () => provider.shutdown());
// Gracefully shutdown Trace SDK if Node.js is exiting normally
process.once('beforeExit', () => provider.shutdown());

// Register the NodeTracerProvider as the global TracerProvider - this is what makes the NodeTracerProvider available via
// `trace.getTracerProvider()` or `trace.getTracer()`.
// From here on out, you should never have to refer to the SDK NodeTracerProvider again.
provider.register();

import { NodeTracerProvider } from '@opentelemetry/node';

import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
// For Jaeger, use the following line instead:
// import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const provider: NodeTracerProvider = new NodeTracerProvider();

provider.register();

provider.addSpanProcessor(
  new SimpleSpanProcessor(
    new ZipkinExporter({
      // For Jaeger, use the following line instead:
      // new JaegerExporter({
      serviceName: 'getting-started',
      // If you are running your tracing backend on another host,
      // you can point to it using the `url` parameter of the
      // exporter config.
    }),
  ),
);

console.log('tracing initialized');

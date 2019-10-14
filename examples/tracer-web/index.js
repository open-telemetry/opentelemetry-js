import { ConsoleExporter } from '@opentelemetry/exporter-console';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracer } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';

const webTracer = new WebTracer({
  plugins: [
    new DocumentLoad()
  ]
});

webTracer.addSpanProcessor(new SimpleSpanProcessor(new ConsoleExporter()));

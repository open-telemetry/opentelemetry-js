import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerFactory } from '@opentelemetry/web';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';

const webTracerFactory = new WebTracerFactory({
  plugins: [
    new DocumentLoad()
  ]
});

webTracerFactory.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

const webTracer = webTracerFactory.getTracer('example');

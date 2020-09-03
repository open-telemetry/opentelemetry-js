import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

const provider = new WebTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.addSpanProcessor(new SimpleSpanProcessor(new ZipkinExporter()));

provider.register();

const tracer = provider.getTracer('example-tracer-web');

const prepareClickEvent = () => {
  const element = document.getElementById('button1');

  const onClick = () => {
    const span = tracer.startSpan('foo');
    span.end();
  };
  element.addEventListener('click', onClick);
};

window.addEventListener('load', prepareClickEvent);

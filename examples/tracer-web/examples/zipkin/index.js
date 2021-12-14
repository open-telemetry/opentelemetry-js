import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

const provider = new WebTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.addSpanProcessor(new SimpleSpanProcessor(new ZipkinExporter({
  // testing interceptor
  // getExportRequestHeaders: ()=> {
  //   return {
  //     foo: 'bar',
  //   }
  // }
})));

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

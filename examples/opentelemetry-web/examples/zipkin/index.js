const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { WebTracerProvider } = require('@opentelemetry/sdk-trace-web');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

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

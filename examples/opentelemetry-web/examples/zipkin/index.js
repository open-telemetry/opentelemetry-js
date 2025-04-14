const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { WebTracerProvider } = require('@opentelemetry/sdk-trace-web');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

const provider = new WebTracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'zipkin-web-service'
  }),
  // Note: For production consider using the "BatchSpanProcessor" to reduce the number of requests
  // to your exporter. Using the SimpleSpanProcessor here as it sends the spans immediately to the
  // exporter without delay
  spanProcessors: [
    new SimpleSpanProcessor(new ConsoleSpanExporter()),
    new SimpleSpanProcessor(new ZipkinExporter({
      // testing interceptor
      // getExportRequestHeaders: () => {
      //   return {
      //     foo: 'bar',
      //   }
      // }
    })),
  ]
});

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

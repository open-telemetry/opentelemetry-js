const { context, trace } = require( '@opentelemetry/api');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require( '@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require( '@opentelemetry/exporter-trace-otlp-http');
const { WebTracerProvider } = require( '@opentelemetry/sdk-trace-web');
const { FetchInstrumentation } = require( '@opentelemetry/instrumentation-fetch');
const { ZoneContextManager } = require( '@opentelemetry/context-zone');
const { B3Propagator } = require( '@opentelemetry/propagator-b3');
const { registerInstrumentations } = require( '@opentelemetry/instrumentation');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

const provider = new WebTracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'fetch-web-service'
  }),
  // Note: For production consider using the "BatchSpanProcessor" to reduce the number of requests
  // to your exporter. Using the SimpleSpanProcessor here as it sends the spans immediately to the
  // exporter without delay
  spanProcessors:[
    new SimpleSpanProcessor(new ConsoleSpanExporter()),
    new SimpleSpanProcessor(new OTLPTraceExporter()),
  ]
});

provider.register({
  contextManager: new ZoneContextManager(),
  propagator: new B3Propagator(),
});

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      ignoreUrls: [/localhost:8090\/sockjs-node/],
      propagateTraceHeaderCorsUrls: [
        'https://cors-test.appspot.com/test',
        'https://httpbin.org/get',
      ],
      clearTimingResources: true,
    }),
  ],
});

const webTracerWithZone = provider.getTracer('example-tracer-web');

const getData = (url) => fetch(url, {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// example of keeping track of context between async operations
const prepareClickEvent = () => {
  const url = 'https://httpbin.org/get';

  const element = document.getElementById('button1');

  const onClick = () => {
    const singleSpan = webTracerWithZone.startSpan('files-series-info');
    context.with(trace.setSpan(context.active(), singleSpan), () => {
      getData(url).then((_data) => {
        trace.getSpan(context.active()).addEvent('fetching-single-span-completed');
        singleSpan.end();
      });
    });
    for (let i = 0, j = 5; i < j; i += 1) {
      const span = webTracerWithZone.startSpan(`files-series-info-${i}`);
      context.with(trace.setSpan(context.active(), span), () => {
        getData(url).then((_data) => {
          trace.getSpan(context.active()).addEvent(`fetching-span-${i}-completed`);
          span.end();
        });
      });
    }
  };
  element.addEventListener('click', onClick);
};

window.addEventListener('load', prepareClickEvent);

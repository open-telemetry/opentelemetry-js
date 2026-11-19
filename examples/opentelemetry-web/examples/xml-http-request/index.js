const { context, trace, propagation } = require('@opentelemetry/api');
const { ConsoleSpanExporter, SimpleSpanProcessor, TracerProvider } = require( '@opentelemetry/sdk-trace');
const { XMLHttpRequestInstrumentation } = require( '@opentelemetry/instrumentation-xml-http-request');
const { ZoneContextManager } = require( '@opentelemetry/context-zone');
const { OTLPTraceExporter } = require( '@opentelemetry/exporter-trace-otlp-http');
const { B3Propagator } = require( '@opentelemetry/propagator-b3');
const { registerInstrumentations } = require( '@opentelemetry/instrumentation');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

const providerWithZone = new TracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'xml-http-web-service'
  }),
  // Note: For production consider using the "BatchSpanProcessor" to reduce the number of requests
  // to your exporter. Using the SimpleSpanProcessor here as it sends the spans immediately to the
  // exporter without delay
  spanProcessors: [
    new SimpleSpanProcessor({ exporter: new ConsoleSpanExporter() }),
    new SimpleSpanProcessor({ exporter: new OTLPTraceExporter() }),
  ]
});

trace.setGlobalTracerProvider(providerWithZone);
propagation.setGlobalPropagator(new B3Propagator());
context.setGlobalContextManager(new ZoneContextManager().enable());

registerInstrumentations({
  instrumentations: [
    new XMLHttpRequestInstrumentation({
      ignoreUrls: [/localhost:8090\/sockjs-node/],
      propagateTraceHeaderCorsUrls: [
        'https://httpbin.org/get',
      ],
    }),
  ],
});

const tracerWithZone = providerWithZone.getTracer('example-tracer-web');

const getData = (url) => new Promise((resolve, reject) => {
  const req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.setRequestHeader('Accept', 'application/json');
  req.onload = () => {
    resolve();
  };
  req.onerror = () => {
    reject();
  };
  req.send();
});

// example of keeping track of context between async operations
const prepareClickEvent = () => {
  const url1 = 'https://httpbin.org/get';

  const element = document.getElementById('button1');

  const onClick = () => {
    for (let i = 0, j = 5; i < j; i += 1) {
      const span1 = tracerWithZone.startSpan(`files-series-info-${i}`);
      context.with(trace.setSpan(context.active(), span1), () => {
        getData(url1).then((_data) => {
          trace.getSpan(context.active()).addEvent('fetching-span1-completed');
          span1.end();
        }, () => {
          trace.getSpan(context.active()).addEvent('fetching-error');
          span1.end();
        });
      });
    }
  };
  element.addEventListener('click', onClick);
};

window.addEventListener('load', prepareClickEvent);

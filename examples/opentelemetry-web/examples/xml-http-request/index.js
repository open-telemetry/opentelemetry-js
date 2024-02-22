const { context, trace } = require('@opentelemetry/api');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require( '@opentelemetry/sdk-trace-base');
const { WebTracerProvider } = require( '@opentelemetry/sdk-trace-web');
const { XMLHttpRequestInstrumentation } = require( '@opentelemetry/instrumentation-xml-http-request');
const { ZoneContextManager } = require( '@opentelemetry/context-zone');
const { OTLPTraceExporter } = require( '@opentelemetry/exporter-trace-otlp-http');
const { CompressionAlgorithm } = require('@opentelemetry/otlp-exporter-base');
const { B3Propagator } = require( '@opentelemetry/propagator-b3');
const { registerInstrumentations } = require( '@opentelemetry/instrumentation');

const providerWithZone = new WebTracerProvider();

// Note: For production consider using the "BatchSpanProcessor" to reduce the number of requests
// to your exporter. Using the SimpleSpanProcessor here as it sends the spans immediately to the
// exporter without delay
providerWithZone.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

const exporterOptions = {};
// Note: to use GZIP compression during export, use the following exporterOptions
// const exporterOptions = { compression: CompressionAlgorithm.GZIP, headers:  { 'force-xhr': 'custom header is required to force xhr use' } };
providerWithZone.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter( exporterOptions)));

providerWithZone.register({
  contextManager: new ZoneContextManager(),
  propagator: new B3Propagator(),
});

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

const webTracerWithZone = providerWithZone.getTracer('example-tracer-web');

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
      const span1 = webTracerWithZone.startSpan(`files-series-info-${i}`);
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

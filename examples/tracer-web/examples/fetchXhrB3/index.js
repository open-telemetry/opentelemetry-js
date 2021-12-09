import { context, trace } from '@opentelemetry/api';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const provider = new WebTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter()));
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

const webTracerWithZone = provider.getTracer('example-tracer-web');

// eslint-disable-next-line no-undef
const getData = (url) => fetch(url, {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const getDataXhr = (url) => new Promise((resolve, reject) => {
  // eslint-disable-next-line no-undef
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
  const url = 'https://httpbin.org/get';

  // eslint-disable-next-line no-undef
  const element1 = document.getElementById('button1');

  // eslint-disable-next-line no-undef
  const element2 = document.getElementById('button2');

  const clickHandler = (fetchFn) => () => {
    const singleSpan = webTracerWithZone.startSpan('files-series-info');
    context.with(trace.setSpan(context.active(), singleSpan), () => {
      fetchFn(url).then((_data) => {
        trace.getSpan(context.active()).addEvent('fetching-single-span-completed');
        singleSpan.end();
      });
    });
    for (let i = 0, j = 5; i < j; i += 1) {
      const span = webTracerWithZone.startSpan(`files-series-info-${i}`);
      context.with(trace.setSpan(context.active(), span), () => {
        fetchFn(url).then((_data) => {
          trace.getSpan(context.active()).addEvent(`fetching-span-${i}-completed`);
          span.end();
        });
      });
    }
  };
  element1.addEventListener('click', clickHandler(getData));
  element2.addEventListener('click', clickHandler(getDataXhr));
};

// eslint-disable-next-line no-undef
window.addEventListener('load', prepareClickEvent);

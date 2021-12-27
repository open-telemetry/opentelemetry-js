import { context, trace } from '@opentelemetry/api';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const providerWithZone = new WebTracerProvider();

// Note: For production consider using the "BatchSpanProcessor" to reduce the number of requests
// to your exporter. Using the SimpleSpanProcessor here as it sends the spans immediately to the
// exporter without delay
providerWithZone.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
providerWithZone.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter()));

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

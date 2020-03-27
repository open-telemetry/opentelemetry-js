import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';
import { XMLHttpRequestPlugin } from '@opentelemetry/plugin-xml-http-request';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { CollectorExporter } from '@opentelemetry/exporter-collector';
import { B3Propagator } from '@opentelemetry/core';

const providerWithZone = new WebTracerProvider({
  plugins: [
    new XMLHttpRequestPlugin({
      ignoreUrls: [/localhost:8090\/sockjs-node/],
      propagateTraceHeaderCorsUrls: [
        'https://httpbin.org/get',
      ],
    }),
  ],
});

providerWithZone.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
providerWithZone.addSpanProcessor(new SimpleSpanProcessor(new CollectorExporter()));

providerWithZone.register({
  contextManager: new ZoneContextManager(),
  propagator: new B3Propagator(),
});

const webTracerWithZone = providerWithZone.getTracer('example-tracer-web');

const getData = (url) => new Promise((resolve, _reject) => {
  // eslint-disable-next-line no-undef
  const req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.setRequestHeader('Accept', 'application/json');
  req.send();
  req.onload = () => {
    resolve();
  };
});

// example of keeping track of context between async operations
const prepareClickEvent = () => {
  const url1 = 'https://httpbin.org/get';

  const element = document.getElementById('button1');

  const onClick = () => {
    for (let i = 0, j = 5; i < j; i += 1) {
      const span1 = webTracerWithZone.startSpan(`files-series-info-${i}`, {
        parent: webTracerWithZone.getCurrentSpan(),
      });
      webTracerWithZone.withSpan(span1, () => {
        getData(url1).then((_data) => {
          webTracerWithZone.getCurrentSpan().addEvent('fetching-span1-completed');
          span1.end();
        });
      });
    }
  };
  element.addEventListener('click', onClick);
};

window.addEventListener('load', prepareClickEvent);

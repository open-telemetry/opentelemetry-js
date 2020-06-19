'use strict';

import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { CollectorExporter } from '@opentelemetry/exporter-collector';
import { WebTracerProvider } from '@opentelemetry/web';
import { FetchPlugin } from '@opentelemetry/plugin-fetch';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { B3Propagator } from '@opentelemetry/core';

const provider = new WebTracerProvider({
  plugins: [
    new FetchPlugin({
      ignoreUrls: [/localhost:8090\/sockjs-node/],
      propagateTraceHeaderCorsUrls: [
        'https://cors-test.appspot.com/test',
        'https://httpbin.org/get',
      ],
      clearTimingResources: true
    }),
  ],
});

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.addSpanProcessor(new SimpleSpanProcessor(new CollectorExporter()));
provider.register({
  contextManager: new ZoneContextManager(),
  propagator: new B3Propagator(),
});

const webTracerWithZone = provider.getTracer('example-tracer-web');

const getData = (url) => fetch(url, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// example of keeping track of context between async operations
const prepareClickEvent = () => {
  const url1 = 'https://httpbin.org/get';

  const element = document.getElementById('button1');

  const onClick = () => {
    const span1 = webTracerWithZone.startSpan(`files-series-info`, {
      parent: webTracerWithZone.getCurrentSpan(),
    });
    webTracerWithZone.withSpan(span1, () => {
      getData(url1).then((_data) => {
        webTracerWithZone.getCurrentSpan().addEvent('fetching-span1-completed');
        span1.end();
      });
    });
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

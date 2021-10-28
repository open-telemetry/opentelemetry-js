'use strict';
import '../helper';

import { context, trace } from '@opentelemetry/api';

import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { loadOtel } from '../tracing';

const provider = loadOtel([
  new XMLHttpRequestInstrumentation({
    ignoreUrls: [/localhost:8090\/sockjs-node/],
    propagateTraceHeaderCorsUrls: [
      'https://httpbin.org/get',
    ],
    clearTimingResources: true,
  }),
]);

const webTracerWithZone = provider.getTracer('example-tracer-web');

const getData = (url) => new Promise((resolve, reject) => {
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

  const element = document.getElementById('button1');

  const onClick = () => {
    const singleSpan = webTracerWithZone.startSpan(`files-series-info`);
    context.with(trace.setSpan(context.active(), singleSpan), () => {
      getData(url).then((_data) => {
        trace.getSpan(context.active()).addEvent('fetching-single-span-completed');
        singleSpan.end();
      }).finally(() => {
        otel.OTELSeleniumDone();
      });
    });
  };
  element.addEventListener('click', onClick);
};

window.addEventListener('load', prepareClickEvent);

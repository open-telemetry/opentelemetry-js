'use strict';
import '../helper';

import { context, trace } from '@opentelemetry/api';

import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { loadOtel } from '../tracing';

const provider = loadOtel([
  new FetchInstrumentation({
    ignoreUrls: [/localhost:8090\/sockjs-node/],
    propagateTraceHeaderCorsUrls: [
      'https://cors-test.appspot.com/test',
      'https://httpbin.org/get',
    ],
    clearTimingResources: true,
  }),
]);

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
  const url = 'https://httpbin.org/get';

  const element = document.getElementById('button1');

  const onClick = () => {
    const singleSpan = webTracerWithZone.startSpan(`files-series-info`);
    context.with(trace.setSpan(context.active(), singleSpan), () => {
      getData(url).then((_data) => {
        trace.getSpan(context.active()).addEvent('fetching-single-span-completed');
        singleSpan.end();
      }).finally(()=> {
        otel.OTELSeleniumDone();
        console.log(otel.memoryExporter.getFinishedSpans());
      });
    });
  };
  element.addEventListener('click', onClick);
};

window.addEventListener('load', prepareClickEvent);

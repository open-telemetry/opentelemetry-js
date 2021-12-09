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
}).then(resp => resp.text());

// example of keeping track of context between async operations
const onMessage = ({ data }) => {
  console.log('onmessage', data);
  switch (data.type) {
    case 'run': {
      const url = 'https://httpbin.org/get';
      const singleSpan = webTracerWithZone.startSpan(`files-series-info`);
      context.with(trace.setSpan(context.active(), singleSpan), () => {
        getData(url)
          .then(_data => {
            trace.getSpan(context.active()).addEvent('fetching-single-span-completed');
            singleSpan.end();
          }, err => console.error(err))
          .finally(() => {
            // notify main thread that work has done.
            postMessage({
              type: 'done',
            });
          })
      });
      break;
    }
    case 'get-finished-spans': {
      postMessage({
        type: 'finished-spans',
        finishedSpans: otel.memoryExporter.getFinishedSpans(),
      });
    }
  }
};
addEventListener('message', onMessage);

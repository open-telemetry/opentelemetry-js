'use strict';

// eslint-disable-next-line import/order
const tracer = require('./tracer')('example-redis-client');
const types = require('@opentelemetry/types');
const axios = require('axios').default;

function makeRequest() {
  const span = tracer.startSpan('client.makeRequest()', {
    parent: tracer.getCurrentSpan(),
    kind: types.SpanKind.CLIENT,
  });

  tracer.withSpan(span, async () => {
    try {
      const res = await axios.get('http://localhost:8080/run_test');
      span.setStatus({ code: types.CanonicalCode.OK });
      console.log(res.statusText);
    } catch (e) {
      span.setStatus({ code: types.CanonicalCode.UNKNOWN, message: e.message });
    }
    span.end();
    console.log('Sleeping 5 seconds before shutdown to ensure all records are flushed.');
    setTimeout(() => { console.log('Completed.'); }, 5000);
  });
}

makeRequest();

'use strict';

const tracer = require('./tracer')('example-dns');
// eslint-disable-next-line import/order
const dns = require('dns').promises;

/** A function which makes a dns lookup and handles response. */
function makeLookup() {
  // span corresponds to dns lookup. Here, we have manually created
  // the span, which is created to track work that happens outside of the
  // dns lookup query.
  const span = tracer.startSpan('dnsLookup');
  tracer.withSpan(span, async () => {
    try {
      await dns.lookup('montreal.ca');
    } catch (error) {
      span.setAttributes({
        'error.name': error.name,
        'error.message': error.message,
      });
    } finally {
      console.log(`traceid: ${span.context().traceId}`);
      span.end();
    }
  });

  // The process must live for at least the interval past any traces that
  // must be exported, or some risk being lost if they are recorded after the
  // last export.
  console.log('Sleeping 5 seconds before shutdown to ensure all records are flushed.');
  setTimeout(() => { console.log('Completed.'); }, 5000);
}

makeLookup();

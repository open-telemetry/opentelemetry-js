'use strict';

const undici = require('undici');
const tracer = require('./tracer')('example-undici-client');

/** A function which makes requests and handles response. */
async function makeRequests(type) {
  tracer.startActiveSpan('makeRequests with global fetch', async (span) => {
      const fetchResponse = await fetch('localhost:8080/helloworld');    
      console.log('response with global fetch: ' + await fetchResponse.text());

      const undiciResponse = await undici.fetch('localhost:8080/helloworld');
      console.log('response with undici fetch: ' + await undiciResponse.text());
      span.end();
  });

  // The process must live for at least the interval past any traces that
  // must be exported, or some risk being lost if they are recorded after the
  // last export.
  console.log('Sleeping 5 seconds before shutdown to ensure all records are flushed.');
  setTimeout(() => { console.log('Completed.'); }, 5000);
}

makeRequests();

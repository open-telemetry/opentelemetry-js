'use strict';

const https = require('https');
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('example-https');

// Disable TLS certificate validate.
// This is necessary for this example because `npm run server` is using
// a self-signed certificate ("server-cert.pem"). A client talking to a
// production HTTP service should never use this environment variable.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/** A function which makes requests and handles response. */
function makeRequest() {
  // span corresponds to outgoing requests. Here, we have manually created
  // the span, which is created to track work that happens outside of the
  // request lifecycle entirely.
  tracer.startActiveSpan('makeRequest', (span) => {
    https.get({
      host: 'localhost',
      port: 8443,
      path: '/helloworld',
    }, (response) => {
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => {
        console.log(body.toString());
        span.end();
      });
    });
  });

  // The process must live for at least the interval past any traces that
  // must be exported, or some risk being lost if they are recorded after the
  // last export.
  console.log('Sleeping 5 seconds before shutdown to ensure all records are flushed.');
  setTimeout(() => { console.log('Completed.'); }, 5000);
}

makeRequest();

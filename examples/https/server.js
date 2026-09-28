'use strict';

const fs = require('fs');
const https = require('https');
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('example-https');

/** Starts a HTTPS server that receives requests on sample server port. */
function startServer(port) {
  const options = {
    key: fs.readFileSync('./server-key.pem'),
    cert: fs.readFileSync('./server-cert.pem'),
  };
  const server = https.createServer(options, handleRequest);
  server.listen(port, (err) => {
    if (err) {
      throw err;
    }
    console.log(`HTTPS server listening on ${port}`);
  });
}

/** A function which handles requests and send response. */
function handleRequest(request, response) {
  // We can look at the current span (created by instrumentation-http).
  const currentSpan = trace.getActiveSpan();
  console.log(`traceId: ${currentSpan.spanContext().traceId}`);

  // We can start a new span for the processing `handleRequest`.
  const span = tracer.startSpan('handleRequest', {
    attributes: { key: 'value' },
  });

  const body = [];
  request.on('error', (err) => console.log(err));
  request.on('data', (chunk) => body.push(chunk));
  request.on('end', () => {
    // deliberately sleeping to mock some action.
    setTimeout(() => {
      span.end();
      response.end('Hello World!');
    }, 2000);
  });
}

startServer(8443);

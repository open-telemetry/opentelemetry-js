'use strict';

const http = require('http');
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('example-http');

/** Starts a HTTP server that receives requests on sample server port. */
function startServer(port) {
  const server = http.createServer(handleRequest);
  server.listen(port, (err) => {
    if (err) {
      throw err;
    }
    console.log(`Node HTTP listening on ${port}`);
  });
}

/** A function which handles requests and send response. */
function handleRequest(request, response) {
  // We can look at the current span (created by instrumentation-http).
  const currentSpan = trace.getActiveSpan();
  const traceId = currentSpan.spanContext().traceId;
  console.log(`traceId: ${traceId}`);

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

startServer(8080);

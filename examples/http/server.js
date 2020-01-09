'use strict';

const opentelemetry = require('@opentelemetry/core');
const config = require('./setup');
/**
 * The trace instance needs to be initialized first, if you want to enable
 * automatic tracing for built-in plugins (HTTP in this case).
 */
config.setupTracerAndExporters('http-server-service');

const http = require('http');
const tracer = opentelemetry.getTracer();

/** Starts a HTTP server that receives requests on sample server port. */
function startServer (port) {
  // Creates a server
  const server = http.createServer(handleRequest);
  // Starts the server
  server.listen(port, err => {
    if (err) {
      throw err;
    }
    console.log(`Node HTTP listening on ${port}`);
  });
}

/** A function which handles requests and send response. */
function handleRequest (request, response) {
  const currentSpan = tracer.getCurrentSpan();
  // display traceid in the terminal
  console.log(`traceid: ${currentSpan.context().traceId}`);
  const span = tracer.startSpan('handleRequest', {
    parent: currentSpan,
    kind: 1, // server
    attributes: { key:'value' }
  });
  // Annotate our span to capture metadata about the operation
  span.addEvent('invoking handleRequest');
  try {
    let body = [];
    request.on('error', err => console.log(err));
    request.on('data', chunk => body.push(chunk));
    request.on('end', () => {
      // deliberately sleeping to mock some action.
      setTimeout(() => {
        span.end();
        response.end('Hello World!');
      }, 2000);
    });
  } catch (err) {
    console.log(err);
    span.end();
  }
}

startServer(8080);

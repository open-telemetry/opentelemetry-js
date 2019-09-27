'use strict';

const opentelemetry = require('@opentelemetry/core');
const config = require('./setup');

/**
 * The trace instance needs to be initialized first, if you want to enable
 * automatic tracing for built-in plugins (gRPC in this case).
 */
config.setupTracerAndExporters('grpc-client-service');

const grpc = require('grpc');

const messages = require('./helloworld_pb');
const services = require('./helloworld_grpc_pb');
const PORT = 50051;
const tracer = opentelemetry.getTracer();

/** A function which makes requests and handles response. */
function main() {
  // span corresponds to outgoing requests. Here, we have manually created
  // the span, which is created to track work that happens outside of the
  // request lifecycle entirely.
  const span = tracer.startSpan('client.js:main()');
  tracer.withSpan(span, () => {
    console.log('Client traceId ', span.context().traceId);
    const client = new services.GreeterClient(
      `localhost:${PORT}`,
      grpc.credentials.createInsecure()
    );
    const request = new messages.HelloRequest();
    let user;
    if (process.argv.length >= 3) {
      user = process.argv[2];
    } else {
      user = 'world';
    }
    request.setName(user);
    client.sayHello(request, function(err, response) {
      span.end();
      if (err) throw err;
      console.log('Greeting:', response.getMessage());
    });
  });
}

main();

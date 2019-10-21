'use strict';

const opentelemetry = require('@opentelemetry/core');
const config = require('./setup');

/**
 * The trace instance needs to be initialized first, if you want to enable
 * automatic tracing for built-in plugins (gRPC in this case).
 */
config.setupTracerAndExporters('grpc-client-service');

const path = require('path');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const tracer = opentelemetry.getTracer();

const PROTO_PATH = path.join(__dirname, 'protos/defs.proto');
const PROTO_OPTIONS = { keepCase: true, enums: String, defaults: true, oneofs: true };
const definition = protoLoader.loadSync(PROTO_PATH, PROTO_OPTIONS);
const rpcProto = grpc.loadPackageDefinition(definition).rpc;

function main() {
  const client = new rpcProto.Fetch('localhost:50051',
    grpc.credentials.createInsecure());
  const data = process.argv[2] || 'opentelemetry';
  console.log('> ', data);

  const span = tracer.startSpan('tutorialsClient.capitalize');
  tracer.withSpan(span, () => {
    client.capitalize({ data: Buffer.from(data) }, function (err, response) {
      if (err) {
        console.log('could not get grpc response');
        return;
      }
      console.log('< ', response.data.toString('utf8'));
      // display traceid in the terminal
      console.log(`traceid: ${span.context().traceId}`);
      span.end();
    });
  });

  // The process must live for at least the interval past any traces that
  // must be exported, or some risk being lost if they are recorded after the
  // last export.
  console.log('Sleeping 5 seconds before shutdown to ensure all records are flushed.')
  setTimeout(() => { console.log('Completed.'); }, 5000);
}

main();

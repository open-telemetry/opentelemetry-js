'use strict';

const { SpanKind } = require('@opentelemetry/types');
const opentelemetry = require('@opentelemetry/core');

/**
 * The trace instance needs to be initialized first, if you want to enable
 * automatic tracing for built-in plugins (gRPC in this case).
 */
const config = require('./setup');
config.setupTracerAndExporters('grpc-server-service');

const path = require('path');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.join(__dirname, 'protos/defs.proto');
const PROTO_OPTIONS = { keepCase: true, enums: String, defaults: true, oneofs: true };
const definition = protoLoader.loadSync(PROTO_PATH, PROTO_OPTIONS);
const rpcProto = grpc.loadPackageDefinition(definition).rpc;

const tracer = opentelemetry.getTracer('example-grpc-capitalize-server');

/** Implements the Capitalize RPC method. */
function capitalize(call, callback) {
  const currentSpan = tracer.getCurrentSpan();
  // display traceid in the terminal
  console.log(`traceid: ${currentSpan.context().traceId}`);

  const span = tracer.startSpan('tutorials.FetchImpl.capitalize', {
    parent: currentSpan,
    kind: SpanKind.SERVER,
  });

  const data = call.request.data.toString('utf8');
  const capitalized = data.toUpperCase();
  for (let i = 0; i < 100000000; i++) {}
  span.end();
  callback(null, { data: Buffer.from(capitalized) });
}

/**
 * Starts an RPC server that receives requests for the Fetch service at the
 * sample server port.
 */
function main() {
  const server = new grpc.Server();
  server.addService(rpcProto.Fetch.service, { capitalize: capitalize });
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();

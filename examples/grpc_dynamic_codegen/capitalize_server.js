'use strict';

// eslint-disable-next-line import/order
const tracer = require('./tracer')('example-grpc-capitalize-server');
const { SpanKind } = require('@opentelemetry/api');
const path = require('path');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.join(__dirname, 'protos/defs.proto');
const PROTO_OPTIONS = {
  keepCase: true, enums: String, defaults: true, oneofs: true,
};
const definition = protoLoader.loadSync(PROTO_PATH, PROTO_OPTIONS);
const rpcProto = grpc.loadPackageDefinition(definition).rpc;

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
  for (let i = 0; i < 100000000; i += 1) {
    // empty
  }
  span.end();
  callback(null, { data: Buffer.from(capitalized) });
}

/**
 * Starts an RPC server that receives requests for the Fetch service at the
 * sample server port.
 */
function main() {
  const server = new grpc.Server();
  server.addService(rpcProto.Fetch.service, { capitalize });
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();

'use strict';

const tracer = require('./tracer')(('example-grpc-server'));
// eslint-disable-next-line import/order
const grpc = require('@grpc/grpc-js');

const messages = require('./helloworld_pb');
const services = require('./helloworld_grpc_pb');

const PORT = 50051;

/** Starts a gRPC server that receives requests on sample server port. */
function startServer() {
  // Creates a server
  const server = new grpc.Server();
  server.addService(services.GreeterService, { sayHello });
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`binding server on 0.0.0.0:${PORT}`);
    server.start();
  });
}

function sayHello(call, callback) {
  const currentSpan = tracer.getCurrentSpan();
  // display traceid in the terminal
  console.log(`traceid: ${currentSpan.context().traceId}`);
  const span = tracer.startSpan('server.js:sayHello()', {
    parent: currentSpan,
    kind: 1, // server
    attributes: { key: 'value' },
  });
  span.addEvent(`invoking sayHello() to ${call.request.getName()}`);
  const reply = new messages.HelloReply();
  reply.setMessage(`Hello ${call.request.getName()}`);
  callback(null, reply);
  span.end();
}

startServer();

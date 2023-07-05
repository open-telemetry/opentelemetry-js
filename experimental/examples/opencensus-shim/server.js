'use strict';

const { SpanStatusCode } = require('@opentelemetry/api');
const setup = require('./setup');
const utils = require('./utils');
const { trace } = require('@opentelemetry/api');

setup('opencensus-shim-example-server');
const http = require('http');

const otelTracer = trace.getTracer('opencensus-shim-example');

function startServer(port) {
  // requests are traced by OpenCensus http instrumentation
  const server = http.createServer(async (req, res) => {
    // you can mix OTel and OC instrumentation

    // deliberately sleeping to mock some action
    await otelTracer.startActiveSpan('sleep', async span => {
      await utils.sleep(1000);
      span.end();
    });

    trace.getActiveSpan()?.addEvent('write headers');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    trace.getActiveSpan()?.addEvent('write json response');
    res.write(JSON.stringify({ status: 'OK', message: 'Hello World!' }));
    trace.getActiveSpan()?.setStatus(SpanStatusCode.OK);
    res.end();
  });

  server.listen(port, err => {
    if (err) throw err;

    console.log(`Server is listening on ${port}`);
  });
}

startServer(3000);

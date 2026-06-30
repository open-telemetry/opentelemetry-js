/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerInstrumentations } from '@opentelemetry/instrumentation';
import {
  trace,
  DiagConsoleLogger,
  DiagLogLevel,
  diag,
  context,
  propagation,
} from '@opentelemetry/api';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  TracerProvider,
} from '@opentelemetry/sdk-trace';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import http from 'http';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

context.setGlobalContextManager(new AsyncLocalStorageContextManager());

const propagator = new CompositePropagator({
  propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
});
propagation.setGlobalPropagator(propagator);

const exporter = new ConsoleSpanExporter();
const processor = new SimpleSpanProcessor(exporter);
const tracerProvider = new TracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'esm-http-ts-example',
  }),
  spanProcessors: [processor],
});
trace.setGlobalTracerProvider(tracerProvider);

registerInstrumentations({
  instrumentations: [new HttpInstrumentation()],
});

const hostname = '0.0.0.0';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  const tracer = trace.getTracer('esm-tracer');
  tracer.startActiveSpan('manual', span => {
    span.end();
  });
  res.end('Hello, World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

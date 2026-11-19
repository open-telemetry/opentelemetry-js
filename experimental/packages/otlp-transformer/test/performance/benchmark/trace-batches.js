/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

const Benchmark = require('benchmark');
const { TracerProvider } = require('@opentelemetry/sdk-trace');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { SpanStatusCode } = require('@opentelemetry/api');
const { ProtobufTraceSerializer } = require('../../../dist/index.cjs');

const provider = new TracerProvider({
  resource: resourceFromAttributes({
    'service.name': 'checkout',
    'service.version': '1.0.0',
    'deployment.environment.name': 'production',
    'host.name': 'checkout-01',
  }),
});
const tracers = [
  provider.getTracer('http', '1.0.0'),
  provider.getTracer('database', '1.0.0'),
];
const suite = new Benchmark.Suite();
const exceptions = [
  { name: 'short ASCII', frames: 1, suffix: '' },
  { name: 'long ASCII', frames: 20, suffix: '' },
  {
    name: 'short Unicode',
    frames: 1,
    suffix: ': \u00e9chec \u4ed8\u6b3e \ud83d\udeab',
  },
  {
    name: 'long Unicode',
    frames: 20,
    suffix: ': \u00e9chec \u4ed8\u6b3e \ud83d\udeab',
  },
].map(({ name, frames, suffix }) => {
  const message = `Payment rejected${suffix}`;
  return {
    name,
    message,
    stack:
      `PaymentError: ${message}\n` +
      Array.from(
        { length: frames },
        (_, frame) =>
          `    at checkout${frame} (/app/checkout.js:${100 + frame}:15)`
      ).join('\n'),
  };
});

// Fixtures are prepared outside timing. Each operation sizes, groups, allocates,
// and writes a complete export request, as a batch span processor would.
for (const size of [10, 100, 512]) {
  for (const errorPercent of [0, 10, 100]) {
    for (const exception of errorPercent === 0 ? [null] : exceptions) {
      const spans = Array.from({ length: size }, (_, i) => {
        const failed =
          errorPercent === 100 || (errorPercent === 10 && i % 10 === 0);
        const span = tracers[i % tracers.length].startSpan('GET /checkout');
        span.setAttributes({
          'http.request.method': 'GET',
          'url.full': `https://shop.example/checkout?order=${i}`,
          'http.response.status_code': failed ? 500 : 200,
          'server.address': 'shop.example',
          'server.port': 443,
          'order.id': `order-${i}`,
          'user.authenticated': true,
        });
        if (failed) {
          span.recordException({
            name: 'PaymentError',
            message: exception.message,
            stack: exception.stack,
          });
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: exception.message,
          });
        }
        span.end();
        return span;
      });
      const bytes = ProtobufTraceSerializer.serializeRequest(spans).length;
      suite.add(
        `protobuf: ${size} spans, ${errorPercent}% exceptions${exception ? ` (${exception.name})` : ''}, ${bytes} bytes`,
        () => {
          ProtobufTraceSerializer.serializeRequest(spans);
        },
        { maxTime: 1, minSamples: 10 }
      );
    }
  }
}

// Multi-megabyte export requests, from spans carrying a large attribute such
// as a request body. These grow the writer's buffer well past its initial size.
for (const payloadSize of [4096, 16384, 65536]) {
  const payload = 'x'.repeat(payloadSize);
  const spans = Array.from({ length: 512 }, (_, i) => {
    const span = tracers[i % tracers.length].startSpan('POST /checkout');
    span.setAttributes({
      'http.request.method': 'POST',
      'url.full': `https://shop.example/checkout?order=${i}`,
      'http.response.status_code': 200,
      'http.request.body': payload,
    });
    span.end();
    return span;
  });
  const bytes = ProtobufTraceSerializer.serializeRequest(spans).length;
  suite.add(
    `protobuf: 512 spans, ${payloadSize}-byte attribute, ${bytes} bytes`,
    () => {
      ProtobufTraceSerializer.serializeRequest(spans);
    },
    { maxTime: 1, minSamples: 10 }
  );
}

suite.on('cycle', event => console.log(String(event.target)));
suite.run();

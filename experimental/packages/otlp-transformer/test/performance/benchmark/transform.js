/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Benchmark = require('benchmark');
const { BasicTracerProvider } = require('@opentelemetry/sdk-trace-base');
const {
  ProtobufTraceSerializer,
  JsonTraceSerializer,
  ProtobufLogsSerializer,
  JsonLogsSerializer,
} = require('../../../build/src');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { TraceFlags } = require('@opentelemetry/api');
const { SeverityNumber } = require('@opentelemetry/api-logs');

// shared concepts
const resource = resourceFromAttributes({
  'service.name': 'benchmark-service',
  'service.version': '1.0.0',
});

const instrumentationScope = {
  name: 'benchmark-otlp-transformer',
  version: '1.0.0',
  schemaUrl: 'https://opentelemetry.io/schemas/1.24.0',
};

// setup traces
const tracerProvider = new BasicTracerProvider({
  resource,
});
const tracer = tracerProvider.getTracer(
  instrumentationScope.name,
  instrumentationScope.version,
  {
    schemaUrl: 'https://opentelemetry.io/schemas/1.24.0',
  }
);

function createSpan() {
  const span = tracer.startSpan('span');
  span.setAttributes({
    'attribute.string': 'some string value',
    'attribute.number': 12345,
    'attribute.boolean': true,
    'attribute.array': ['value1', 'value2', 'value3'],
    'http.method': 'GET',
    'http.url': 'https://example.com/api/endpoint',
    'http.status_code': 200,
    'user.id': 'user-12345',
    'request.id': 'req-67890',
    'session.id': 'sess-abcdef',
  });
  span.end();
  return span;
}

const spans = [];
for (let i = 0; i < 512; i++) {
  spans.push(createSpan());
}

// setup logs
function createLogRecord() {
  const now = Date.now();
  const seconds = Math.floor(now / 1000);
  const nanos = (now % 1000) * 1000000;

  return {
    hrTime: [seconds, nanos],
    hrTimeObserved: [seconds, nanos],
    severityNumber: SeverityNumber.INFO,
    severityText: 'INFO',
    body: 'This is a log message with some content for benchmarking purposes',
    attributes: {
      'attribute.string': 'some string value',
      'attribute.number': 12345,
      'attribute.boolean': true,
      'attribute.array': ['value1', 'value2', 'value3'],
      'http.method': 'GET',
      'http.url': 'https://example.com/api/endpoint',
      'http.status_code': 200,
      'user.id': 'user-12345',
      'request.id': 'req-67890',
      'session.id': 'sess-abcdef',
    },
    droppedAttributesCount: 0,
    resource: resource,
    instrumentationScope: instrumentationScope,
    spanContext: {
      traceId: '00000000000000000000000000000001',
      spanId: '0000000000000002',
      traceFlags: TraceFlags.SAMPLED,
    },
  };
}

const logs = [];
for (let i = 0; i < 512; i++) {
  logs.push(createLogRecord());
}

// setup benchmark suite
const suite = new Benchmark.Suite();

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add('transform 512 spans (protobuf)', function () {
  ProtobufTraceSerializer.serializeRequest(spans);
});

suite.add('transform 512 spans (json)', function () {
  JsonTraceSerializer.serializeRequest(spans);
});

suite.add('transform 512 logs (protobuf)', function () {
  ProtobufLogsSerializer.serializeRequest(logs);
});

suite.add('transform 512 logs (json)', function () {
  JsonLogsSerializer.serializeRequest(logs);
});

suite.run();

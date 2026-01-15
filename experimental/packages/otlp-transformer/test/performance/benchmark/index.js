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
const {
  createExportTraceServiceRequest,
} = require('../../../build/src/trace/internal');
const { BasicTracerProvider } = require('@opentelemetry/sdk-trace-base');
const { ProtobufTraceSerializer } = require('../../../build/src');

const tracerProvider = new BasicTracerProvider();
const tracer = tracerProvider.getTracer('test');

const suite = new Benchmark.Suite();

const span = createSpan();
const spans = [];
for (let i = 0; i < 100; i++) {
  spans.push(createSpan());
}

suite.on('cycle', event => {
  console.log(String(event.target));
});

suite.add('transform 1 span', function () {
  createExportTraceServiceRequest([span]);
});

suite.add('transform 100 spans', function () {
  createExportTraceServiceRequest(spans);
});

suite.add('transform 100 spans to protobuf', function () {
  ProtobufTraceSerializer.serializeRequest(spans);
});

suite.run();

function createSpan() {
  const span = tracer.startSpan('span');
  span.setAttribute('aaaaaaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaaaaaa');
  span.setAttribute('bbbbbbbbbbbbbbbbbbbb', 'bbbbbbbbbbbbbbbbbbbb');
  span.setAttribute('cccccccccccccccccccc', 'cccccccccccccccccccc');
  span.setAttribute('dddddddddddddddddddd', 'dddddddddddddddddddd');
  span.setAttribute('eeeeeeeeeeeeeeeeeeee', 'eeeeeeeeeeeeeeeeeeee');
  span.setAttribute('ffffffffffffffffffff', 'ffffffffffffffffffff');
  span.setAttribute('gggggggggggggggggggg', 'gggggggggggggggggggg');
  span.setAttribute('hhhhhhhhhhhhhhhhhhhh', 'hhhhhhhhhhhhhhhhhhhh');
  span.setAttribute('iiiiiiiiiiiiiiiiiiii', 'iiiiiiiiiiiiiiiiiiii');
  span.setAttribute('jjjjjjjjjjjjjjjjjjjj', 'jjjjjjjjjjjjjjjjjjjj');
  span.end();

  return span;
}

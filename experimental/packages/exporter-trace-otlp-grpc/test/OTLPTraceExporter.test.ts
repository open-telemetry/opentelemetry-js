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

import { OTLPTraceExporter } from '../src';
import { ServerTestContext, startServer } from './utils';
import * as assert from 'assert';
import {
  SimpleSpanProcessor,
  BasicTracerProvider,
} from '@opentelemetry/sdk-trace-base';

const testServiceDefinition = {
  export: {
    path: '/opentelemetry.proto.collector.trace.v1.TraceService/Export',
    requestStream: false,
    responseStream: false,
    requestSerialize: (arg: Buffer) => {
      return arg;
    },
    requestDeserialize: (arg: Buffer) => {
      return arg;
    },
    responseSerialize: (arg: Buffer) => {
      return arg;
    },
    responseDeserialize: (arg: Buffer) => {
      return arg;
    },
  },
};

/*
 * NOTE: Tests here are not intended to test the underlying components directly. They are intended as a quick
 * check if the correct components are used. Use the following packages to test details:
 * - `@opentelemetry/oltp-exporter-base`: OTLP common exporter logic (handling of concurrent exports, ...)
 * - `@opentelemetry/otlp-transformer`: Everything regarding serialization and transforming internal representations to OTLP
 * - `@opentelemetry/otlp-grpc-exporter-base`: gRPC transport
 */
describe('OTLPTraceExporter', function () {
  let shutdownHandle: () => void | undefined;
  const serverTestContext: ServerTestContext = {
    requests: [],
    serverResponseProvider: () => {
      return { error: null, buffer: Buffer.from([]) };
    },
  };

  beforeEach(async function () {
    shutdownHandle = await startServer(
      'localhost:1501',
      testServiceDefinition,
      serverTestContext
    );
  });

  afterEach(function () {
    shutdownHandle();

    // clear context
    serverTestContext.requests = [];
    serverTestContext.serverResponseProvider = () => {
      return { error: null, buffer: Buffer.from([]) };
    };
  });

  it('successfully exports data', async () => {
    // arrange
    const tracerProvider = new BasicTracerProvider({
      spanProcessors: [
        new SimpleSpanProcessor(
          new OTLPTraceExporter({
            url: 'http://localhost:1501',
          })
        ),
      ],
    });

    // act
    tracerProvider.getTracer('test-tracer').startSpan('test-span').end();
    await tracerProvider.shutdown();

    // assert
    assert.strictEqual(serverTestContext.requests.length, 1);
  });
});

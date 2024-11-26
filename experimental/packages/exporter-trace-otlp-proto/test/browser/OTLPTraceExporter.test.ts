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

import {
  BasicTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { OTLPTraceExporter } from '../../src/platform/browser/index';

/*
 * NOTE: Tests here are not intended to test the underlying components directly. They are intended as a quick
 * check if the correct components are used. Use the following packages to test details:
 * - `@opentelemetry/oltp-exporter-base`: OTLP common exporter logic (handling of concurrent exports, ...)
 * - `@opentelemetry/otlp-transformer`: Everything regarding serialization and transforming internal representations to OTLP
 * - `@opentelemetry/otlp-grpc-exporter-base`: gRPC transport
 */

describe('OTLPTraceExporter', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('export', function () {
    describe('when sendBeacon is available', function () {
      it('should successfully send data using sendBeacon', async function () {
        // arrange
        const stubBeacon = sinon.stub(navigator, 'sendBeacon');
        const tracerProvider = new BasicTracerProvider({
          spanProcessors: [new SimpleSpanProcessor(new OTLPTraceExporter())],
        });

        // act
        tracerProvider.getTracer('test-tracer').startSpan('test-span').end();
        await tracerProvider.shutdown();

        // assert
        const args = stubBeacon.args[0];
        const blob: Blob = args[1] as unknown as Blob;
        const body = await blob.text();
        assert.throws(
          () => JSON.parse(body),
          'expected requestBody to be in protobuf format, but parsing as JSON succeeded'
        );
      });
    });

    describe('when sendBeacon is not available', function () {
      beforeEach(function () {
        // fake sendBeacon not being available
        (window.navigator as any).sendBeacon = false;
      });

      it('should successfully send data using XMLHttpRequest', async function () {
        // arrange
        const server = sinon.fakeServer.create();
        const tracerProvider = new BasicTracerProvider({
          spanProcessors: [new SimpleSpanProcessor(new OTLPTraceExporter())],
        });

        // act
        tracerProvider.getTracer('test-tracer').startSpan('test-span').end();
        queueMicrotask(() => {
          // simulate success response
          server.requests[0].respond(200, {}, '');
        });
        await tracerProvider.shutdown();

        // assert
        const request = server.requests[0];
        const body = request.requestBody as unknown as Uint8Array;
        assert.throws(
          () => JSON.parse(new TextDecoder().decode(body)),
          'expected requestBody to be in protobuf format, but parsing as JSON succeeded'
        );
      });
    });
  });
});

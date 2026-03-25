/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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
    it('should successfully send data using fetch', async function () {
      // arrange
      const stubFetch = sinon
        .stub(window, 'fetch')
        .resolves(new Response('', { status: 200 }));
      const tracerProvider = new BasicTracerProvider({
        spanProcessors: [new SimpleSpanProcessor(new OTLPTraceExporter())],
      });

      // act
      tracerProvider.getTracer('test-tracer').startSpan('test-span').end();
      await tracerProvider.shutdown();

      // assert
      const request = new Request(...stubFetch.args[0]);
      const body = await request.text();
      assert.throws(
        () => JSON.parse(body),
        'expected request body to be in protobuf format, but parsing as JSON succeeded'
      );
    });
  });
});

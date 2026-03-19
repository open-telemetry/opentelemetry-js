/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as http from 'http';
import * as sinon from 'sinon';
import { Stream } from 'stream';

import {
  BasicTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '../../src/platform/node';

/*
 * NOTE: Tests here are not intended to test the underlying components directly. They are intended as a quick
 * check if the correct components are used. Use the following packages to test details:
 * - `@opentelemetry/oltp-exporter-base`: OTLP common exporter logic (handling of concurrent exports, ...), HTTP transport code
 * - `@opentelemetry/otlp-transformer`: Everything regarding serialization and transforming internal representations to OTLP
 */

describe('OTLPTraceExporter', () => {
  describe('export', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('successfully exports data', done => {
      const fakeRequest = new Stream.PassThrough();
      Object.defineProperty(fakeRequest, 'setTimeout', {
        value: function (_timeout: number) {},
      });

      sinon.stub(http, 'request').returns(fakeRequest as any);
      let buff = Buffer.from('');
      fakeRequest.on('finish', () => {
        try {
          const requestBody = buff.toString();
          assert.doesNotThrow(() => {
            JSON.parse(requestBody);
          }, 'expected requestBody to be in JSON format, but parsing failed');
          done();
        } catch (e) {
          done(e);
        }
      });

      fakeRequest.on('data', chunk => {
        buff = Buffer.concat([buff, chunk]);
      });

      new BasicTracerProvider({
        spanProcessors: [new SimpleSpanProcessor(new OTLPTraceExporter())],
      })
        .getTracer('test-tracer')
        .startSpan('test-span')
        .end();
    });
  });
});

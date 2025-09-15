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

import * as assert from 'assert';
import * as http from 'http';
import * as sinon from 'sinon';
import { Stream } from 'stream';

import {
  BasicTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '../../src/platform/node';
import { VERSION } from '../../src/version';

/*
 * NOTE: Tests here are not intended to test the underlying components directly. They are intended as a quick
 * check if the correct components are used. Use the following packages to test details:
 * - `@opentelemetry/oltp-exporter-base`: OTLP common exporter logic (handling of concurrent exports, ...), HTTP transport code
 * - `@opentelemetry/otlp-transformer`: Everything regarding serialization and transforming internal representations to OTLP
 */

describe('OTLPTraceExporter', () => {
  describe('export', () => {
    afterEach(() => {
      // Note: this does seem to have an issue so if we add another test
      // `http.request` is not properly stubbed and fails
      // ref: https://github.com/sinonjs/sinon/issues/2384
      sinon.restore();
    });

    it('successfully exports data', done => {
      const fakeRequest = new Stream.PassThrough();
      Object.defineProperty(fakeRequest, 'setTimeout', {
        value: function (_timeout: number) {},
      });

      const reqStub = sinon.stub(http, 'request').returns(fakeRequest as any);
      let buff = Buffer.from('');
      fakeRequest.on('finish', () => {
        try {
          // Check dats has the right format
          const requestBody = buff.toString();
          assert.doesNotThrow(() => {
            JSON.parse(requestBody);
          }, 'expected requestBody to be in JSON format, but parsing failed');

          // Check we can append a user agent string to the exporter one.
          const httpRequestOptions = reqStub.args[0][0] as http.RequestOptions;
          const headers =
            httpRequestOptions.headers as http.OutgoingHttpHeaders;
          const userAgents = `${headers['User-Agent']}`.split(' ');
          assert.equal(userAgents[0], 'Custom-User-Agent/1.2.3');
          assert.equal(
            userAgents[1],
            `OTel-OTLP-Exporter-JavaScript/${VERSION}`
          );
          done();
        } catch (e) {
          done(e);
        }
      });

      fakeRequest.on('data', chunk => {
        buff = Buffer.concat([buff, chunk]);
      });

      new BasicTracerProvider({
        spanProcessors: [
          new SimpleSpanProcessor(
            new OTLPTraceExporter({ userAgent: 'Custom-User-Agent/1.2.3' })
          ),
        ],
      })
        .getTracer('test-tracer')
        .startSpan('test-span')
        .end();
    });
  });
});

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

import * as sinon from 'sinon';
import * as assert from 'assert';
import { createXhrTransport } from '../../src/platform/browser/xhr-transport';
import {
  ExportResponseRetryable,
  ExportResponseFailure,
  ExportResponseSuccess,
} from '../../src';
import { ensureHeadersContain } from '../testHelper';

const testTransportParameters = {
  url: 'http://example.test',
  headers: {
    foo: 'foo-value',
    bar: 'bar-value',
    'Content-Type': 'application/json',
  },
};

const requestTimeout = 1000;
const testPayload = Uint8Array.from([1, 2, 3]);

describe('XhrTransport', function () {
  afterEach(() => {
    sinon.restore();
  });

  describe('send', function () {
    it('returns success when request succeeds', function (done) {
      // arrange
      const server = sinon.fakeServer.create();
      const transport = createXhrTransport(testTransportParameters);

      let request: sinon.SinonFakeXMLHttpRequest;
      queueMicrotask(() => {
        // this executes after the act block
        request = server.requests[0];
        request.respond(200, {}, 'test response');
      });

      //act
      transport.send(testPayload, requestTimeout).then(response => {
        // assert
        try {
          assert.strictEqual(response.status, 'success');
          // currently we don't do anything with the response yet, so it's dropped by the transport.
          assert.strictEqual(
            (response as ExportResponseSuccess).data,
            undefined
          );
          assert.strictEqual(request.url, testTransportParameters.url);
          assert.strictEqual(
            (request.requestBody as unknown as Blob).type,
            'application/json'
          );
          ensureHeadersContain(request.requestHeaders, {
            foo: 'foo-value',
            bar: 'bar-value',
            // ;charset=utf-8 is applied by sinon.fakeServer
            'Content-Type': 'application/json;charset=utf-8',
          });
        } catch (e) {
          done(e);
        }
        done();
      }, done /* catch any rejections */);
    });

    it('returns failure when request fails', function (done) {
      // arrange
      const server = sinon.fakeServer.create();
      const transport = createXhrTransport(testTransportParameters);

      queueMicrotask(() => {
        // this executes after the act block
        const request = server.requests[0];
        request.respond(404, {}, '');
      });

      //act
      transport.send(testPayload, requestTimeout).then(response => {
        // assert
        try {
          assert.strictEqual(response.status, 'failure');
        } catch (e) {
          done(e);
        }
        done();
      }, done /* catch any rejections */);
    });

    it('returns retryable when request is retryable', function (done) {
      // arrange
      const server = sinon.fakeServer.create();
      const transport = createXhrTransport(testTransportParameters);

      queueMicrotask(() => {
        // this executes after the act block
        const request = server.requests[0];
        request.respond(503, { 'Retry-After': 5 }, '');
      });

      //act
      transport.send(testPayload, requestTimeout).then(response => {
        // assert
        try {
          assert.strictEqual(response.status, 'retryable');
          assert.strictEqual(
            (response as ExportResponseRetryable).retryInMillis,
            5000
          );
        } catch (e) {
          done(e);
        }
        done();
      }, done /* catch any rejections */);
    });

    it('returns failure when request times out', function (done) {
      // arrange
      // A fake server needed, otherwise the message will not be a timeout but a failure to connect.
      sinon.useFakeServer();
      const clock = sinon.useFakeTimers();
      const transport = createXhrTransport(testTransportParameters);

      //act
      transport.send(testPayload, requestTimeout).then(response => {
        // assert
        try {
          assert.strictEqual(response.status, 'failure');
          assert.strictEqual(
            (response as ExportResponseFailure).error.message,
            'XHR request timed out'
          );
        } catch (e) {
          done(e);
        }
        done();
      }, done /* catch any rejections */);
      clock.tick(requestTimeout + 100);
    });

    it('returns failure when no server exists', function (done) {
      // arrange
      const clock = sinon.useFakeTimers();
      const transport = createXhrTransport(testTransportParameters);

      //act
      transport.send(testPayload, requestTimeout).then(response => {
        // assert
        try {
          assert.strictEqual(response.status, 'failure');
          assert.strictEqual(
            (response as ExportResponseFailure).error.message,
            'XHR request errored'
          );
        } catch (e) {
          done(e);
        }
        done();
      }, done /* catch any rejections */);
      clock.tick(requestTimeout + 100);
    });
  });
});

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
import { createFetchTransport } from '../../src/transport/fetch-transport';
import {
  ExportResponseRetryable,
  ExportResponseFailure,
  ExportResponseSuccess,
} from '../../src';

const testTransportParameters = {
  url: 'http://example.test',
  headers: async () => ({
    foo: 'foo-value',
    bar: 'bar-value',
    'Content-Type': 'application/json',
  }),
};

const requestTimeout = 1000;
const testPayload = Uint8Array.from([1, 2, 3]);

describe('FetchTransport', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('send', function () {
    it.only('it uses global fetch API and is not affected by patching', function (done) {
      // arrange
      const transport = createFetchTransport(testTransportParameters);
      // We patch after the transport is created simulating what an
      // instrumentation would do
      const fetchStub = sinon
        .stub(globalThis, 'fetch')
        .resolves(new Response('test response', { status: 200 }));

      //act
      transport.send(testPayload, requestTimeout).then(response => {
        // assert
        try {
          assert.strictEqual(response.status, 'retryable');
          sinon.assert.notCalled(fetchStub);
        } catch (e) {
          done(e);
        }
        done();
      }, done /* catch any rejections */);
    });
    it('returns success when request succeeds', function (done) {
      // arrange
      const fetchStub = sinon
        .stub(globalThis, 'fetch')
        .resolves(new Response('test response', { status: 200 }));
      const transport = createFetchTransport(testTransportParameters);

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
          sinon.assert.calledOnceWithMatch(
            fetchStub,
            testTransportParameters.url,
            {
              method: 'POST',
              headers: {
                foo: 'foo-value',
                bar: 'bar-value',
                'Content-Type': 'application/json',
              },
              body: testPayload,
            }
          );
        } catch (e) {
          done(e);
        }
        done();
      }, done /* catch any rejections */);
    });

    it('returns failure when request fails', function (done) {
      // arrange
      sinon
        .stub(globalThis, 'fetch')
        .resolves(new Response('', { status: 404 }));
      const transport = createFetchTransport(testTransportParameters);

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
      sinon
        .stub(globalThis, 'fetch')
        .resolves(
          new Response('', { status: 503, headers: { 'Retry-After': '5' } })
        );
      const transport = createFetchTransport(testTransportParameters);

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

    it('returns failure when request is aborted', function (done) {
      // arrange
      const abortError = new Error('aborted request');
      abortError.name = 'AbortError';
      sinon.stub(globalThis, 'fetch').rejects(abortError);
      const clock = sinon.useFakeTimers();
      const transport = createFetchTransport(testTransportParameters);

      //act
      transport.send(testPayload, requestTimeout).then(response => {
        // assert
        try {
          assert.strictEqual(response.status, 'failure');
          assert.strictEqual(
            (response as ExportResponseFailure).error.message,
            'Fetch request errored'
          );
        } catch (e) {
          done(e);
        }
        done();
      }, done /* catch any rejections */);
      clock.tick(requestTimeout + 100);
    });

    it('returns failure when fetch throws non-network error', function (done) {
      // arrange
      sinon.stub(globalThis, 'fetch').throws(new Error('fetch failed'));
      const clock = sinon.useFakeTimers();
      const transport = createFetchTransport(testTransportParameters);

      //act
      transport.send(testPayload, requestTimeout).then(response => {
        // assert
        try {
          assert.strictEqual(response.status, 'failure');
          assert.strictEqual(
            (response as ExportResponseFailure).error.message,
            'Fetch request errored'
          );
        } catch (e) {
          done(e);
        }
        done();
      }, done /* catch any rejections */);
      clock.tick(requestTimeout + 100);
    });

    it('returns retryable when browser fetch throws network error', function (done) {
      // arrange
      // Browser fetch throws TypeError for network errors
      sinon.stub(globalThis, 'fetch').rejects(new TypeError('Failed to fetch'));
      const transport = createFetchTransport(testTransportParameters);

      //act
      transport.send(testPayload, requestTimeout).then(response => {
        // assert
        try {
          assert.strictEqual(response.status, 'retryable');
          assert.strictEqual(
            response.error?.message,
            'Fetch request encountered a network error'
          );
        } catch (e) {
          done(e);
        }
        done();
      }, done /* catch any rejections */);
    });
  });
});

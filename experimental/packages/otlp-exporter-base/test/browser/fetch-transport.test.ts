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
import { createRetryingTransport } from '../../src/retrying-transport';
import { registerMockDiagLogger } from '../common/test-utils';
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

// 60KB is the max cumulative body size for keepalive
const MAX_KEEPALIVE_BODY_SIZE = 60 * 1024;
// 9 is the max concurrent keepalive requests
const MAX_KEEPALIVE_REQUESTS = 9;

describe('FetchTransport', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('send', function () {
    it('uses global fetch API and is not affected by patching', function (done) {
      // arrange
      const fetchStub = sinon
        .stub(globalThis, 'fetch')
        .resolves(new Response('test response', { status: 200 }));
      const transport = createFetchTransport(testTransportParameters);
      // We patch fetch simulating what an instrumentation would do
      const patchedStub = sinon.stub().callsFake(fetchStub);
      globalThis.fetch = patchedStub;
      (globalThis.fetch as any).__original = fetchStub;

      //act
      transport.send(testPayload, requestTimeout).then(response => {
        // assert
        try {
          assert.strictEqual(response.status, 'success');
          sinon.assert.notCalled(patchedStub);
          sinon.assert.called(fetchStub);
        } catch (e) {
          done(e);
        }
        done();
      }, done /* catch any rejections */);
    });

    it('uses provided fetch API and does not call global fetch', function (done) {
      // arrange
      const fetchStub = sinon
        .stub(globalThis, 'fetch')
        .resolves(new Response('test response', { status: 200 }));
      const customStub = sinon.stub().callsFake(fetchStub);
      const transport = createFetchTransport({
        ...testTransportParameters,
        fetch: customStub as unknown as typeof globalThis.fetch,
      });

      //act
      transport.send(testPayload, requestTimeout).then(response => {
        // assert
        try {
          assert.strictEqual(response.status, 'success');
          sinon.assert.called(customStub);
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

    it('returns failure when fetch throws TypeError with cause', async function () {
      // arrange - TypeError with cause is NOT a network error (cause indicates wrapped error)
      const errorWithCause = new TypeError('Failed');
      (errorWithCause as any).cause = new Error('underlying');
      sinon.stub(globalThis, 'fetch').rejects(errorWithCause);
      const transport = createFetchTransport(testTransportParameters);

      // act
      const result = await transport.send(testPayload, requestTimeout);

      // assert - should be failure, not retryable
      assert.strictEqual(result.status, 'failure');
      assert.strictEqual(
        (result as ExportResponseFailure).error.message,
        'Fetch request errored'
      );
    });
  });

  describe('keepalive queue tracking', function () {
    it('enables keepalive for small requests under limits', async function () {
      // arrange
      const fetchStub = sinon
        .stub(globalThis, 'fetch')
        .resolves(new Response('', { status: 200 }));
      const transport = createFetchTransport(testTransportParameters);

      // act
      await transport.send(testPayload, requestTimeout);

      // assert
      const requestInit = fetchStub.firstCall.args[1] as RequestInit;
      assert.strictEqual(requestInit.keepalive, true);
    });

    it('disables keepalive when cumulative body size would exceed limit', async function () {
      // arrange
      // Create payload that's just over half the limit
      const largePayload = new Uint8Array(MAX_KEEPALIVE_BODY_SIZE / 2 + 1);

      let resolveFirst!: (value: Response) => void;
      const firstPromise = new Promise<Response>(r => {
        resolveFirst = r;
      });

      const fetchStub = sinon.stub(globalThis, 'fetch');
      fetchStub.onCall(0).returns(firstPromise);
      fetchStub.onCall(1).resolves(new Response('', { status: 200 }));

      const { debug } = registerMockDiagLogger();
      const transport = createFetchTransport(testTransportParameters);

      // act - start first request (doesn't resolve yet)
      const p1 = transport.send(largePayload, requestTimeout);

      // Start second request while first is pending
      // Combined size would exceed 60KB limit
      const p2 = transport.send(largePayload, requestTimeout);

      // Wait for second request to complete (it resolves immediately)
      await p2;

      // assert - second request should have keepalive disabled
      const secondRequestInit = fetchStub.secondCall.args[1] as RequestInit;
      assert.strictEqual(
        secondRequestInit.keepalive,
        false,
        'keepalive should be false when cumulative size exceeds limit'
      );

      // assert - diag.debug should log keepalive disabled with size reason
      sinon.assert.calledWith(
        debug,
        `keepalive disabled: ${(largePayload.byteLength / 1024).toFixed(1)}KB payload, 1 pending (size limit)`
      );

      // cleanup - resolve first request
      resolveFirst(new Response('', { status: 200 }));
      await p1;
    });

    it('disables keepalive when concurrent request count exceeds limit', async function () {
      // arrange
      const pendingResolvers: Array<(value: Response) => void> = [];
      const fetchStub = sinon.stub(globalThis, 'fetch').callsFake(() => {
        return new Promise<Response>(resolve => {
          pendingResolvers.push(resolve);
        });
      });

      const { debug } = registerMockDiagLogger();
      const transport = createFetchTransport(testTransportParameters);

      // act - start MAX_KEEPALIVE_REQUESTS requests (all pending)
      const pendingRequests: Promise<unknown>[] = [];
      for (let i = 0; i < MAX_KEEPALIVE_REQUESTS; i++) {
        pendingRequests.push(transport.send(testPayload, requestTimeout));
      }

      // Wait for all fetch calls to be made
      while (fetchStub.callCount < MAX_KEEPALIVE_REQUESTS) {
        await new Promise(r => setTimeout(r, 0));
      }

      // Start one more request - should exceed the limit
      const extraRequest = transport.send(testPayload, requestTimeout);

      // Wait for the extra fetch call
      while (fetchStub.callCount < MAX_KEEPALIVE_REQUESTS + 1) {
        await new Promise(r => setTimeout(r, 0));
      }

      // assert - the 10th request should have keepalive disabled
      const tenthRequestInit = fetchStub.getCall(MAX_KEEPALIVE_REQUESTS)
        .args[1] as RequestInit;
      assert.strictEqual(
        tenthRequestInit.keepalive,
        false,
        'keepalive should be false when request count exceeds limit'
      );

      // assert - diag.debug should log keepalive disabled with count reason
      sinon.assert.calledWith(
        debug,
        `keepalive disabled: ${(testPayload.byteLength / 1024).toFixed(1)}KB payload, ${MAX_KEEPALIVE_REQUESTS} pending (count limit)`
      );

      // cleanup - resolve all pending requests
      pendingResolvers.forEach(resolve =>
        resolve(new Response('', { status: 200 }))
      );
      await Promise.all([...pendingRequests, extraRequest]);
    });

    it('decrements counters after request completes successfully', async function () {
      // arrange
      let resolveFirst!: (value: Response) => void;
      const firstPromise = new Promise<Response>(r => {
        resolveFirst = r;
      });

      const fetchStub = sinon.stub(globalThis, 'fetch');
      fetchStub.onCall(0).returns(firstPromise);
      fetchStub.onCall(1).resolves(new Response('', { status: 200 }));
      fetchStub.onCall(2).resolves(new Response('', { status: 200 }));

      // Use payload just over half the limit
      const largePayload = new Uint8Array(MAX_KEEPALIVE_BODY_SIZE / 2 + 1);
      const transport = createFetchTransport(testTransportParameters);

      // act - start first request
      const p1 = transport.send(largePayload, requestTimeout);

      // Second request while first pending - should disable keepalive
      const p2 = transport.send(largePayload, requestTimeout);
      await p2; // Wait for second to complete

      const secondInit = fetchStub.secondCall.args[1] as RequestInit;
      assert.strictEqual(secondInit.keepalive, false);

      // Complete first request
      resolveFirst(new Response('', { status: 200 }));
      await p1;

      // Third request after first completed - counter should be decremented
      await transport.send(largePayload, requestTimeout);
      const thirdInit = fetchStub.thirdCall.args[1] as RequestInit;
      assert.strictEqual(
        thirdInit.keepalive,
        true,
        'keepalive should be re-enabled after pending request completes'
      );
    });

    it('decrements counters after request fails', async function () {
      // arrange
      let rejectFirst!: (error: Error) => void;
      const firstPromise = new Promise<Response>((_, reject) => {
        rejectFirst = reject;
      });

      const fetchStub = sinon.stub(globalThis, 'fetch');
      fetchStub.onCall(0).returns(firstPromise);
      fetchStub.onCall(1).resolves(new Response('', { status: 200 }));
      fetchStub.onCall(2).resolves(new Response('', { status: 200 }));

      const largePayload = new Uint8Array(MAX_KEEPALIVE_BODY_SIZE / 2 + 1);
      const transport = createFetchTransport(testTransportParameters);

      // act - start first request
      const p1 = transport.send(largePayload, requestTimeout);

      // Second request while first pending - should disable keepalive
      const p2 = transport.send(largePayload, requestTimeout);
      await p2; // Wait for second to complete

      const secondInit = fetchStub.secondCall.args[1] as RequestInit;
      assert.strictEqual(secondInit.keepalive, false);

      // Fail first request
      rejectFirst(new Error('network error'));
      await p1; // This should resolve (transport catches errors)

      // Third request after first failed - counter should be decremented
      await transport.send(largePayload, requestTimeout);
      const thirdInit = fetchStub.thirdCall.args[1] as RequestInit;
      assert.strictEqual(
        thirdInit.keepalive,
        true,
        'keepalive should be re-enabled after failed request completes'
      );
    });
  });

  describe('retry integration', function () {
    it('retries when server returns 503 then succeeds', async function () {
      // arrange
      const fetchStub = sinon.stub(globalThis, 'fetch');
      fetchStub.onCall(0).resolves(new Response('', { status: 503 }));
      fetchStub.onCall(1).resolves(new Response('', { status: 200 }));

      const transport = createRetryingTransport({
        transport: createFetchTransport(testTransportParameters),
      });

      // act
      const result = await transport.send(testPayload, 10000);

      // assert
      assert.strictEqual(result.status, 'success');
      assert.strictEqual(fetchStub.callCount, 2, 'should have retried once');
    });

    it('retries when server returns 429 then succeeds', async function () {
      // arrange
      const fetchStub = sinon.stub(globalThis, 'fetch');
      fetchStub.onCall(0).resolves(new Response('', { status: 429 }));
      fetchStub.onCall(1).resolves(new Response('', { status: 200 }));

      const transport = createRetryingTransport({
        transport: createFetchTransport(testTransportParameters),
      });

      // act
      const result = await transport.send(testPayload, 10000);

      // assert
      assert.strictEqual(result.status, 'success');
      assert.strictEqual(fetchStub.callCount, 2, 'should have retried once');
    });

    it('retries on network error then succeeds', async function () {
      // arrange
      const fetchStub = sinon.stub(globalThis, 'fetch');
      fetchStub.onCall(0).rejects(new TypeError('Failed to fetch'));
      fetchStub.onCall(1).resolves(new Response('', { status: 200 }));

      const transport = createRetryingTransport({
        transport: createFetchTransport(testTransportParameters),
      });

      // act
      const result = await transport.send(testPayload, 10000);

      // assert
      assert.strictEqual(result.status, 'success');
      assert.strictEqual(fetchStub.callCount, 2, 'should have retried once');
    });

    it('does not retry on 404', async function () {
      // arrange
      const fetchStub = sinon.stub(globalThis, 'fetch');
      fetchStub.resolves(new Response('', { status: 404 }));

      const transport = createRetryingTransport({
        transport: createFetchTransport(testTransportParameters),
      });

      // act
      const result = await transport.send(testPayload, 10000);

      // assert
      assert.strictEqual(result.status, 'failure');
      assert.strictEqual(fetchStub.callCount, 1, 'should not have retried');
    });
  });
});

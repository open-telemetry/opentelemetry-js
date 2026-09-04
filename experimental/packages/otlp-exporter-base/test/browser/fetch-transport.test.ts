/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as sinon from 'sinon';
import * as assert from 'assert';
import { createFetchTransport } from '../../src/transport/fetch-transport';
import { createRetryingTransport } from '../../src/retrying-transport';
import { registerMockDiagLogger, withResolvers } from '../common/test-utils';
import type {
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

// Delivers one chunk, then stays open until the request is aborted.
function neverEndingBodyAbortedBy(
  signal: AbortSignal | null | undefined
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(Uint8Array.from([1, 2, 3]));
      const abort = () =>
        controller.error(
          new DOMException('The user aborted a request.', 'AbortError')
        );
      // An abort that already happened fires no event, and the body would
      // then stay open until the test times out instead of failing.
      if (signal?.aborted) {
        abort();
        return;
      }
      signal?.addEventListener('abort', abort);
    },
  });
}

// The drain settles after `send()` resolves; a macrotask turn flushes it.
function flushBodyDrain(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Body stays open until the test closes or errors it.
function responseWithPendingBody(status = 200): {
  response: Response;
  closeBody: () => void;
  failBody: (error: Error) => void;
} {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
  });
  return {
    response: new Response(body, { status }),
    closeBody: () => controller.close(),
    failBody: (error: Error) => controller.error(error),
  };
}

describe('FetchTransport', function () {
  // Budget is module state, so an unsettled drain leaks into the next test.
  afterEach(async function () {
    // Restore first: a test's fake clock would swallow the flush.
    sinon.restore();
    await flushBodyDrain();
  });

  describe('send', function () {
    it('it uses global fetch API and is not affected by patching', function (done) {
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

  describe('response body handling', function () {
    it('reads the response body of a successful export', async function () {
      // arrange
      let cancelled = false;
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(Uint8Array.from([1, 2, 3]));
          controller.close();
        },
        cancel() {
          cancelled = true;
        },
      });
      const response = new Response(body, { status: 200 });
      sinon.stub(globalThis, 'fetch').resolves(response);
      const transport = createFetchTransport(testTransportParameters);

      // act
      const result = await transport.send(testPayload, requestTimeout);
      await flushBodyDrain();

      // assert - the body has to be read to its end, cancelling it releases
      // the quota far more slowly
      assert.strictEqual(result.status, 'success');
      assert.strictEqual(response.bodyUsed, true);
      assert.strictEqual(cancelled, false);
    });

    it('settles the export before the response body reaches its end', async function () {
      // arrange - a body that stays open until this test closes it. The status
      // already decides the outcome, so a collector that stalls mid-body must
      // not hold up the caller.
      const bodyClosed = withResolvers<void>();
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(Uint8Array.from([1, 2, 3]));
          void bodyClosed.promise.then(() => controller.close());
        },
      });
      sinon
        .stub(globalThis, 'fetch')
        .resolves(new Response(body, { status: 200 }));
      const transport = createFetchTransport(testTransportParameters);

      // act
      const result = await transport.send(testPayload, requestTimeout);

      // assert
      assert.strictEqual(result.status, 'success');
      bodyClosed.resolve();
      await flushBodyDrain();
    });

    it('reads the response body of a retryable export', async function () {
      // arrange
      const response = new Response('test response', {
        status: 503,
        headers: { 'Retry-After': '5' },
      });
      sinon.stub(globalThis, 'fetch').resolves(response);
      const transport = createFetchTransport(testTransportParameters);

      // act
      const result = await transport.send(testPayload, requestTimeout);
      await flushBodyDrain();

      // assert
      assert.strictEqual(result.status, 'retryable');
      assert.strictEqual(response.bodyUsed, true);
    });

    it('releases the reader lock after draining the body', async function () {
      // arrange - a held reader would keep the body locked, and a later export
      // handed the same response could then not drain it
      const response = new Response('test response', { status: 200 });
      sinon.stub(globalThis, 'fetch').resolves(response);
      const transport = createFetchTransport(testTransportParameters);

      // act
      const first = await transport.send(testPayload, requestTimeout);
      await flushBodyDrain();
      const second = await transport.send(testPayload, requestTimeout);
      await flushBodyDrain();

      // assert
      assert.strictEqual(first.status, 'success');
      assert.strictEqual(second.status, 'success');
      assert.strictEqual(response.bodyUsed, true);
      assert.strictEqual(response.body?.locked, false);
    });

    it('returns success when the response body is locked by another reader', async function () {
      // arrange - a fetch wrapper may hold the body's reader. The export
      // already reached the collector, so a body that cannot be drained must
      // not turn into a network error and have the export retried.
      const response = new Response('test response', { status: 200 });
      response.body?.getReader();
      sinon.stub(globalThis, 'fetch').resolves(response);
      const { debug } = registerMockDiagLogger();
      const transport = createFetchTransport(testTransportParameters);

      // act
      const result = await transport.send(testPayload, requestTimeout);
      await flushBodyDrain();

      // assert
      assert.strictEqual(result.status, 'success');
      sinon.assert.calledWithMatch(debug, /error reading export response body/);
    });

    it('returns success when the response body cannot be read', async function () {
      // arrange
      const erroringBody = new ReadableStream({
        start(controller) {
          controller.error(new Error('body read failed'));
        },
      });
      sinon
        .stub(globalThis, 'fetch')
        .resolves(new Response(erroringBody, { status: 200 }));
      const { debug } = registerMockDiagLogger();
      const transport = createFetchTransport(testTransportParameters);

      // act
      const result = await transport.send(testPayload, requestTimeout);
      await flushBodyDrain();

      // assert - the export reached the collector, the read is best effort
      assert.strictEqual(result.status, 'success');
      sinon.assert.calledWithMatch(debug, /error reading export response body/);
    });

    // The timeout keeps running while the body is drained, so a collector that
    // holds the response open long enough gets the request aborted mid-read.
    // The headers are in by then, so the collector's status still decides.
    for (const { status, expected } of [
      { status: 200, expected: 'success' },
      { status: 503, expected: 'retryable' },
    ]) {
      it(`returns ${expected} when the timeout aborts the export while its ${status} response body is being read`, async function () {
        // arrange
        sinon
          .stub(globalThis, 'fetch')
          .callsFake(
            async (_input, init) =>
              new Response(neverEndingBodyAbortedBy(init?.signal), { status })
          );
        const { debug } = registerMockDiagLogger();
        const transport = createFetchTransport(testTransportParameters);

        // act
        const result = await transport.send(testPayload, 1);
        await new Promise(resolve => setTimeout(resolve, 20));

        // assert
        assert.strictEqual(result.status, expected);
        sinon.assert.calledWithMatch(
          debug,
          /error reading export response body/
        );
      });
    }
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
      await flushBodyDrain();

      // Third request after first completed - counter should be decremented
      await transport.send(largePayload, requestTimeout);
      await flushBodyDrain();
      const thirdInit = fetchStub.thirdCall.args[1] as RequestInit;
      assert.strictEqual(
        thirdInit.keepalive,
        true,
        'keepalive should be re-enabled after pending request completes'
      );
    });

    it('holds keepalive budget until the response body drains', async function () {
      // arrange
      const { response, closeBody } = responseWithPendingBody();
      const fetchStub = sinon.stub(globalThis, 'fetch');
      fetchStub.onCall(0).resolves(response);
      fetchStub.onCall(1).resolves(new Response('', { status: 200 }));
      fetchStub.onCall(2).resolves(new Response('', { status: 200 }));

      const largePayload = new Uint8Array(MAX_KEEPALIVE_BODY_SIZE / 2 + 1);
      const transport = createFetchTransport(testTransportParameters);

      // act - first request resolves while its body is still undrained
      await transport.send(largePayload, requestTimeout);
      // A bare macrotask turn, so the assertion cannot pass on a race.
      await flushBodyDrain();
      await transport.send(largePayload, requestTimeout);

      // assert
      const secondInit = fetchStub.secondCall.args[1] as RequestInit;
      assert.strictEqual(
        secondInit.keepalive,
        false,
        'budget should still be held while the first body is undrained'
      );

      // act - drain the body
      closeBody();
      await flushBodyDrain();
      await transport.send(largePayload, requestTimeout);
      await flushBodyDrain();

      // assert
      const thirdInit = fetchStub.thirdCall.args[1] as RequestInit;
      assert.strictEqual(
        thirdInit.keepalive,
        true,
        'budget should be released once the body drains'
      );
    });

    it('releases keepalive budget when the response body drain fails', async function () {
      // arrange
      const { response, failBody } = responseWithPendingBody();
      const fetchStub = sinon.stub(globalThis, 'fetch');
      fetchStub.onCall(0).resolves(response);
      fetchStub.onCall(1).resolves(new Response('', { status: 200 }));

      const { debug } = registerMockDiagLogger();
      const largePayload = new Uint8Array(MAX_KEEPALIVE_BODY_SIZE / 2 + 1);
      const transport = createFetchTransport(testTransportParameters);

      // act
      await transport.send(largePayload, requestTimeout);
      failBody(new Error('body errored'));
      await flushBodyDrain();
      await transport.send(largePayload, requestTimeout);
      await flushBodyDrain();

      // assert
      const secondInit = fetchStub.secondCall.args[1] as RequestInit;
      assert.strictEqual(
        secondInit.keepalive,
        true,
        'budget should be released when the drain rejects'
      );
      sinon.assert.calledWithMatch(debug, /error reading export response body/);
    });

    it('lets the abort timer unstick a stalled response body', async function () {
      // arrange
      const { response, failBody } = responseWithPendingBody();
      const fetchStub = sinon.stub(globalThis, 'fetch');
      fetchStub.onCall(0).callsFake((_url, init) => {
        // Mirror the browser: aborting errors the response body.
        const abortError = new Error('aborted request');
        abortError.name = 'AbortError';
        (init as RequestInit).signal?.addEventListener('abort', () =>
          failBody(abortError)
        );
        return Promise.resolve(response);
      });
      fetchStub.onCall(1).resolves(new Response('', { status: 200 }));

      const largePayload = new Uint8Array(MAX_KEEPALIVE_BODY_SIZE / 2 + 1);
      const transport = createFetchTransport(testTransportParameters);
      const shortTimeout = 10;

      // act - body never closes, so only the abort timer frees the budget
      await transport.send(largePayload, shortTimeout);
      await new Promise(resolve => setTimeout(resolve, shortTimeout + 10));
      await flushBodyDrain();
      await transport.send(largePayload, requestTimeout);
      await flushBodyDrain();

      // assert
      const secondInit = fetchStub.secondCall.args[1] as RequestInit;
      assert.strictEqual(
        secondInit.keepalive,
        true,
        'a stalled body should not hold the budget past the request timeout'
      );
    });

    it('clears the abort timer on return when keepalive is not used', async function () {
      // arrange
      const first = responseWithPendingBody();
      const second = responseWithPendingBody();
      const fetchStub = sinon.stub(globalThis, 'fetch');
      fetchStub.onCall(0).resolves(first.response);
      fetchStub.onCall(1).resolves(second.response);

      const largePayload = new Uint8Array(MAX_KEEPALIVE_BODY_SIZE / 2 + 1);
      const transport = createFetchTransport(testTransportParameters);
      const shortTimeout = 10;

      // act - first request holds the whole budget, so the second cannot
      // use keepalive
      await transport.send(largePayload, requestTimeout);
      await transport.send(largePayload, shortTimeout);
      const secondInit = fetchStub.secondCall.args[1] as RequestInit;
      assert.strictEqual(secondInit.keepalive, false);

      await new Promise(resolve => setTimeout(resolve, shortTimeout + 10));

      // assert
      assert.strictEqual(
        secondInit.signal?.aborted,
        false,
        'a non-keepalive request should not stay abortable after it returns'
      );

      // cleanup
      first.closeBody();
      second.closeBody();
      await flushBodyDrain();
    });

    it('releases keepalive budget for a non-2xx response', async function () {
      // arrange
      const fetchStub = sinon.stub(globalThis, 'fetch');
      fetchStub.onCall(0).resolves(new Response('', { status: 503 }));
      fetchStub.onCall(1).resolves(new Response('', { status: 200 }));

      const largePayload = new Uint8Array(MAX_KEEPALIVE_BODY_SIZE / 2 + 1);
      const transport = createFetchTransport(testTransportParameters);

      // act
      const result = await transport.send(largePayload, requestTimeout);
      await flushBodyDrain();
      await transport.send(largePayload, requestTimeout);

      // assert
      assert.strictEqual(result.status, 'retryable');
      const secondInit = fetchStub.secondCall.args[1] as RequestInit;
      assert.strictEqual(
        secondInit.keepalive,
        true,
        'a retryable response should still free its budget'
      );
    });

    it('releases keepalive budget exactly once per request', async function () {
      // arrange
      const pendingResolvers: Array<(value: Response) => void> = [];
      const fetchStub = sinon.stub(globalThis, 'fetch').callsFake(() => {
        return new Promise<Response>(resolve => {
          pendingResolvers.push(resolve);
        });
      });
      fetchStub.onCall(0).resolves(new Response('', { status: 200 }));

      const transport = createFetchTransport(testTransportParameters);

      // act - one released request, then saturate the request count
      await transport.send(testPayload, requestTimeout);
      await flushBodyDrain();

      const pendingRequests: Promise<unknown>[] = [];
      for (let i = 0; i < MAX_KEEPALIVE_REQUESTS; i++) {
        pendingRequests.push(transport.send(testPayload, requestTimeout));
      }
      while (fetchStub.callCount < MAX_KEEPALIVE_REQUESTS + 1) {
        await new Promise(r => setTimeout(r, 0));
      }

      const extraRequest = transport.send(testPayload, requestTimeout);
      while (fetchStub.callCount < MAX_KEEPALIVE_REQUESTS + 2) {
        await new Promise(r => setTimeout(r, 0));
      }

      // assert - a double release drives the count negative, letting this
      // request slip past Chrome's concurrency cap
      const extraInit = fetchStub.getCall(MAX_KEEPALIVE_REQUESTS + 1)
        .args[1] as RequestInit;
      assert.strictEqual(
        extraInit.keepalive,
        false,
        'the pending count must not go negative after a released request'
      );

      // cleanup
      pendingResolvers.forEach(resolve =>
        resolve(new Response('', { status: 200 }))
      );
      await Promise.all([...pendingRequests, extraRequest]);
      await flushBodyDrain();
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

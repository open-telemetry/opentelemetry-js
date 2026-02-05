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
import { createFetchLaterTransport } from '../../src/transport/fetch-later-transport';
import { ExportResponseFailure } from '../../src';

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

describe('FetchLaterTransport', function () {
  afterEach(function () {
    sinon.restore();
    delete (globalThis as Record<string, unknown>).fetchLater;
  });

  describe('send', function () {
    it('returns success when fetchLater queues successfully (activated: true)', async function () {
      // arrange
      const fetchLaterStub = sinon.stub().returns({ activated: true });
      (globalThis as Record<string, unknown>).fetchLater = fetchLaterStub;

      const transport = createFetchLaterTransport(testTransportParameters);

      // act
      const result = await transport.send(testPayload, requestTimeout);

      // assert
      assert.strictEqual(result.status, 'success');
      sinon.assert.calledOnce(fetchLaterStub);
      sinon.assert.calledWithMatch(
        fetchLaterStub,
        testTransportParameters.url,
        {
          method: 'POST',
          headers: {
            foo: 'foo-value',
            bar: 'bar-value',
            'Content-Type': 'application/json',
          },
          body: testPayload,
          activateAfter: 0,
        }
      );
    });

    it('returns success when fetchLater queues successfully (activated: false)', async function () {
      // arrange
      const fetchLaterStub = sinon.stub().returns({ activated: false });
      (globalThis as Record<string, unknown>).fetchLater = fetchLaterStub;

      const transport = createFetchLaterTransport(testTransportParameters);

      // act
      const result = await transport.send(testPayload, requestTimeout);

      // assert
      assert.strictEqual(result.status, 'success');
      sinon.assert.calledOnce(fetchLaterStub);
    });

    it('returns failure when fetchLater throws', async function () {
      // arrange
      const fetchLaterStub = sinon
        .stub()
        .throws(new Error('fetchLater failed'));
      (globalThis as Record<string, unknown>).fetchLater = fetchLaterStub;

      const transport = createFetchLaterTransport(testTransportParameters);

      // act
      const result = await transport.send(testPayload, requestTimeout);

      // assert
      assert.strictEqual(result.status, 'failure');
      assert.strictEqual(
        (result as ExportResponseFailure).error.message,
        'FetchLater request queued failed'
      );
    });

    it('returns failure when QuotaExceededError is thrown', async function () {
      // arrange
      const quotaError = new DOMException(
        'Quota exceeded',
        'QuotaExceededError'
      );
      const fetchLaterStub = sinon.stub().throws(quotaError);
      (globalThis as Record<string, unknown>).fetchLater = fetchLaterStub;

      const transport = createFetchLaterTransport(testTransportParameters);

      // act
      const result = await transport.send(testPayload, requestTimeout);

      // assert
      assert.strictEqual(result.status, 'failure');
      assert.strictEqual(
        (result as ExportResponseFailure).error.message,
        'FetchLater request queued failed'
      );
      assert.strictEqual(
        (result as ExportResponseFailure).error.cause,
        quotaError
      );
    });

    it('passes AbortSignal to fetchLater', async function () {
      // arrange
      const fetchLaterStub = sinon.stub().returns({ activated: true });
      (globalThis as Record<string, unknown>).fetchLater = fetchLaterStub;

      const transport = createFetchLaterTransport(testTransportParameters);

      // act
      await transport.send(testPayload, requestTimeout);

      // assert
      sinon.assert.calledOnce(fetchLaterStub);
      const callArgs = fetchLaterStub.firstCall.args[1];
      assert.ok(callArgs.signal instanceof AbortSignal);
    });

    it('clears timeout when request is already activated', async function () {
      // arrange
      const clock = sinon.useFakeTimers();
      const fetchLaterStub = sinon.stub().returns({ activated: true });
      (globalThis as Record<string, unknown>).fetchLater = fetchLaterStub;

      const transport = createFetchLaterTransport(testTransportParameters);

      // act
      const resultPromise = transport.send(testPayload, requestTimeout);
      const result = await resultPromise;

      // assert - timeout should be cleared, advancing clock should not cause issues
      assert.strictEqual(result.status, 'success');
      clock.tick(requestTimeout + 100);
      clock.restore();
    });

    it('does not clear timeout when request is queued but not activated', async function () {
      // arrange
      const clock = sinon.useFakeTimers();
      let capturedSignal: AbortSignal | undefined;
      const fetchLaterStub = sinon.stub().callsFake((_url, options) => {
        capturedSignal = options?.signal;
        return { activated: false };
      });
      (globalThis as Record<string, unknown>).fetchLater = fetchLaterStub;

      const transport = createFetchLaterTransport(testTransportParameters);

      // act
      const result = await transport.send(testPayload, requestTimeout);

      // assert - result should still be success (queued successfully)
      assert.strictEqual(result.status, 'success');
      assert.ok(capturedSignal);
      assert.strictEqual(capturedSignal!.aborted, false);

      // Advance time past the timeout - signal should be aborted
      clock.tick(requestTimeout + 100);
      assert.strictEqual(capturedSignal!.aborted, true);
      clock.restore();
    });
  });
});

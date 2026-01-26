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
import { IExporterTransport } from '../../src';
import { createRetryingTransport } from '../../src/retrying-transport';
import { ExportResponse } from '../../src';
import { diag } from '@opentelemetry/api';

const timeoutMillis = 1000000;

describe('RetryingTransport', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('send', function () {
    it('does not retry when underlying transport succeeds', async function () {
      // arrange
      const expectedResponse: ExportResponse = {
        status: 'success',
      };
      const mockData = Uint8Array.from([1, 2, 3]);

      const transportStubs = {
        // make transport succeed
        send: sinon.stub().returns(Promise.resolve(expectedResponse)),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;
      const transport = createRetryingTransport({ transport: mockTransport });

      // act
      const actualResponse = await transport.send(mockData, timeoutMillis);

      // assert
      sinon.assert.calledOnceWithExactly(
        transportStubs.send,
        mockData,
        timeoutMillis
      );
      assert.deepEqual(actualResponse, expectedResponse);
    });

    it('does not retry when underlying transport fails', async function () {
      // arrange
      const expectedResponse: ExportResponse = {
        status: 'failure',
        error: new Error(),
      };
      const mockData = Uint8Array.from([1, 2, 3]);

      const transportStubs = {
        // make transport fail
        send: sinon.stub().returns(Promise.resolve(expectedResponse)),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;
      const transport = createRetryingTransport({ transport: mockTransport });

      // act
      const actualResponse = await transport.send(mockData, timeoutMillis);

      // assert
      sinon.assert.calledOnceWithExactly(
        transportStubs.send,
        mockData,
        timeoutMillis
      );
      assert.deepEqual(actualResponse, expectedResponse);
    });

    it('does not retry when underlying transport rejects', async function () {
      // arrange
      const expectedError = new Error('error');
      const mockData = Uint8Array.from([1, 2, 3]);

      const transportStubs = {
        // make transport reject
        send: sinon.stub().rejects(expectedError),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;
      const transport = createRetryingTransport({ transport: mockTransport });

      // act
      await assert.rejects(() => transport.send(mockData, timeoutMillis));

      // assert
      sinon.assert.calledOnceWithExactly(
        transportStubs.send,
        mockData,
        timeoutMillis
      );
    });

    it('does retry when the underlying transport returns retryable', async function () {
      // arrange
      const retryResponse: ExportResponse = {
        status: 'retryable',
      };
      const successResponse: ExportResponse = {
        status: 'success',
      };
      const mockData = Uint8Array.from([1, 2, 3]);

      const transportStubs = {
        send: sinon
          .stub()
          .onFirstCall()
          .returns(Promise.resolve(retryResponse))
          .onSecondCall()
          .returns(Promise.resolve(successResponse)),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;
      const transport = createRetryingTransport({ transport: mockTransport });

      // act
      const actualResponse = await transport.send(mockData, timeoutMillis);

      // assert
      sinon.assert.calledTwice(transportStubs.send);
      sinon.assert.alwaysCalledWithMatch(
        transportStubs.send,
        mockData,
        sinon.match.number.and(
          sinon.match(value => {
            return value <= timeoutMillis;
          })
        )
      );
      assert.deepEqual(actualResponse, successResponse);
    });

    it('does reject when the underlying transport rejects on retry', async function () {
      // arrange
      const expectedError = new Error('error');
      const retryResponse: ExportResponse = {
        status: 'retryable',
      };

      const mockData = Uint8Array.from([1, 2, 3]);

      const transportStubs = {
        send: sinon
          .stub()
          .onFirstCall()
          .resolves(retryResponse)
          .onSecondCall()
          .rejects(expectedError),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;
      const transport = createRetryingTransport({ transport: mockTransport });

      // act
      await assert.rejects(() => transport.send(mockData, timeoutMillis));

      // assert
      sinon.assert.calledTwice(transportStubs.send);
      sinon.assert.alwaysCalledWithMatch(
        transportStubs.send,
        mockData,
        sinon.match.number.and(
          sinon.match(value => {
            return value <= timeoutMillis;
          })
        )
      );
    });

    it('does retry 5 times, then resolves as retryable', async function () {
      // arrange
      // make random return a negative value so that what's passed to setTimeout() is negative and therefore gets executed immediately.
      Math.random = sinon.stub().returns(-Infinity);

      const retryResponse: ExportResponse = {
        status: 'retryable',
      };

      const mockData = Uint8Array.from([1, 2, 3]);

      const transportStubs = {
        send: sinon.stub().resolves(retryResponse),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;
      const transport = createRetryingTransport({ transport: mockTransport });

      // act
      const result = await transport.send(mockData, timeoutMillis);

      // assert
      sinon.assert.callCount(transportStubs.send, 6); // 1 initial try and 5 retries
      sinon.assert.alwaysCalledWithMatch(
        transportStubs.send,
        mockData,
        sinon.match.number.and(
          sinon.match(value => {
            return value <= timeoutMillis;
          })
        )
      );
      assert.strictEqual(result, retryResponse);
    });

    it('does not retry when retryInMillis takes place after timeoutMillis', async function () {
      // arrange
      const retryResponse: ExportResponse = {
        status: 'retryable',
        retryInMillis: timeoutMillis + 100,
      };

      const mockData = Uint8Array.from([1, 2, 3]);

      const transportStubs = {
        send: sinon.stub().resolves(retryResponse),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;
      const transport = createRetryingTransport({ transport: mockTransport });

      // act
      const result = await transport.send(mockData, timeoutMillis);

      // assert
      // initial try, no retries.
      sinon.assert.calledOnceWithExactly(
        transportStubs.send,
        mockData,
        timeoutMillis
      );
      assert.strictEqual(result, retryResponse);
    });
  });

  describe('forceFlush', function () {
    it('cancels pending retries and returns retryable', async function () {
      // arrange
      const timer = sinon.useFakeTimers();
      const retryResponse: ExportResponse = {
        status: 'retryable',
        retryInMillis: 100,
      };
      const mockData = Uint8Array.from([1, 2, 3]);

      const transportStubs = {
        send: sinon.stub().resolves(retryResponse),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;
      const transport = createRetryingTransport({ transport: mockTransport });

      // Start a send that will retry
      const sendPromise = transport.send(mockData, timeoutMillis);

      // Break event loop to allow initial send to complete
      await timer.tickAsync(1);

      // act - forceFlush while retry is pending (this should cancel the pending timeout)
      transport.forceFlush?.();

      // assert - the send promise should resolve with retryable status immediately
      await timer.runAllAsync();
      const result = await sendPromise;
      assert.strictEqual(result.status, 'retryable');
      assert.strictEqual(
        result.error?.message,
        'Retry cancelled due to forceFlush()'
      );
      sinon.assert.calledOnce(transportStubs.send); // Only initial attempt, retry was cancelled
    });

    it('allows new retries after forceFlush', async function () {
      // arrange
      const timer = sinon.useFakeTimers();
      const retryResponse: ExportResponse = {
        status: 'retryable',
      };
      const successResponse: ExportResponse = {
        status: 'success',
      };
      const mockData = Uint8Array.from([1, 2, 3]);

      const transportStubs = {
        send: sinon
          .stub()
          .onFirstCall()
          .resolves(retryResponse)
          .onSecondCall()
          .resolves(successResponse),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;
      const transport = createRetryingTransport({ transport: mockTransport });

      // act - forceFlush first
      transport.forceFlush?.();

      // Start a send after forceFlush()
      const sendPromise = transport.send(mockData, timeoutMillis);

      // Wait for first attempt to complete
      await timer.runAllAsync();

      // assert
      const result = await sendPromise;
      assert.strictEqual(result.status, 'success');
      sinon.assert.calledTwice(transportStubs.send); // Initial attempt + one retry
    });

    it('cancels multiple pending retries', async function () {
      // arrange
      const timer = sinon.useFakeTimers();
      const retryResponse: ExportResponse = {
        status: 'retryable',
        retryInMillis: 100, // Short retry delay
      };
      const mockData1 = Uint8Array.from([1, 2, 3]);
      const mockData2 = Uint8Array.from([4, 5, 6]);

      const transportStubs = {
        send: sinon.stub().resolves(retryResponse),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;
      const transport = createRetryingTransport({ transport: mockTransport });

      // Start multiple sends that will retry
      const sendPromise1 = transport.send(mockData1, timeoutMillis);
      const sendPromise2 = transport.send(mockData2, timeoutMillis);

      // Break event loop to allow initial sends to complete
      await timer.tickAsync(1);

      // act - forceFlush while retries are pending (cancel pending retries)
      transport.forceFlush?.();

      // assert - the send promises should resolve with retryable status immediately
      const result1 = await sendPromise1;
      const result2 = await sendPromise2;

      assert.strictEqual(result1.status, 'retryable');
      assert.strictEqual(
        result1.error?.message,
        'Retry cancelled due to forceFlush()'
      );
      assert.strictEqual(result2.status, 'retryable');
      assert.strictEqual(
        result2.error?.message,
        'Retry cancelled due to forceFlush()'
      );

      // Only 2 initial attempts (one for each send), all retries were cancelled
      sinon.assert.calledTwice(transportStubs.send);
    });

    it('cancels retries that have not been scheduled yet', async function () {
      // arrange
      const timer = sinon.useFakeTimers();
      const infoSpy = sinon.spy(diag, 'info');
      const originalError = new Error();
      const retryResponse: ExportResponse = {
        status: 'retryable',
        retryInMillis: 100, // Short retry delay
        error: originalError, // include an error to verify it's retained in the response
      };
      const mockData = Uint8Array.from([1, 2, 3]);

      const transportStubs = {
        send: sinon.stub().resolves(retryResponse),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;
      const transport = createRetryingTransport({ transport: mockTransport });

      // send, but do not break event loop yet, so retry is not yet scheduled
      const sendPromise = transport.send(mockData, timeoutMillis);

      // act - forceFlush, no retries are pending but send is still in progress
      transport.forceFlush?.();

      // assert
      // let everything play out
      await timer.runAllAsync();
      const result = await sendPromise;
      assert.strictEqual(result.status, 'retryable');
      assert.strictEqual(result.error, originalError);
      infoSpy.calledOnceWithExactly(
        'foregoing retry as operation was forceFlushed'
      );

      // Only 1 attempt (initial send, no retry)
      sinon.assert.calledOnce(transportStubs.send);
    });

    it('calls forceFlush on underlying transport', function () {
      // arrange
      const transportStubs = {
        send: sinon.stub(),
        shutdown: sinon.stub(),
        forceFlush: sinon.stub().resolves(),
      };
      const mockTransport = <IExporterTransport>transportStubs;
      const transport = createRetryingTransport({ transport: mockTransport });

      // act
      transport.forceFlush?.();

      // assert
      sinon.assert.calledOnce(transportStubs.forceFlush);
    });
  });

  describe('shutdown', function () {
    it('calls shutdown on underlying transport', function () {
      // arrange
      const transportStubs = {
        send: sinon.stub(),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;
      const transport = createRetryingTransport({ transport: mockTransport });

      // act
      transport.shutdown();

      // assert
      sinon.assert.calledOnce(transportStubs.shutdown);
    });

    it('allows initial send attempt to complete even during shutdown', async function () {
      // arrange
      const successResponse: ExportResponse = {
        status: 'success',
      };
      const mockData = Uint8Array.from([1, 2, 3]);

      let resolveTransportSend: (value: ExportResponse) => void;
      const transportSendPromise = new Promise<ExportResponse>(resolve => {
        resolveTransportSend = resolve;
      });

      const transportStubs = {
        send: sinon.stub().returns(transportSendPromise),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;
      const transport = createRetryingTransport({ transport: mockTransport });

      // Start a send
      const sendPromise = transport.send(mockData, timeoutMillis);

      // Shutdown while initial send is in progress
      transport.shutdown();

      // Complete the initial send
      resolveTransportSend!(successResponse);

      // assert - initial send should complete successfully
      const result = await sendPromise;
      assert.strictEqual(result.status, 'success');
    });
  });
});

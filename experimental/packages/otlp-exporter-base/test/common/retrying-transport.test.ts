/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as sinon from 'sinon';
import * as assert from 'assert';
import { IExporterTransport } from '../../src';
import { createRetryingTransport } from '../../src/retrying-transport';
import { ExportResponse } from '../../src';

const timeoutMillis = 1000000;

describe('RetryingTransport', function () {
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
});

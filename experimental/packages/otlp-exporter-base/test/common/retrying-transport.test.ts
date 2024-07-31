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
import { createRetryingTransport } from '../../src/retryable-transport';
import { ExportResponse } from '../../src';
import { assertRejects } from '../testHelper';

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
      const actualResponse = await transport.send(mockData);

      // assert
      sinon.assert.calledOnceWithExactly(transportStubs.send, mockData);
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
      const actualResponse = await transport.send(mockData);

      // assert
      sinon.assert.calledOnceWithExactly(transportStubs.send, mockData);
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
      await assertRejects(() => transport.send(mockData));

      // assert
      sinon.assert.calledOnceWithExactly(transportStubs.send, mockData);
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
      const actualResponse = await transport.send(mockData);

      // assert
      sinon.assert.calledTwice(transportStubs.send);
      sinon.assert.alwaysCalledWithExactly(transportStubs.send, mockData);
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
      await assertRejects(() => transport.send(mockData));

      // assert
      sinon.assert.calledTwice(transportStubs.send);
      sinon.assert.alwaysCalledWithExactly(transportStubs.send, mockData);
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
      const result = await transport.send(mockData);

      // assert
      sinon.assert.callCount(transportStubs.send, 6); // 1 initial try and 5 retries
      sinon.assert.alwaysCalledWithExactly(transportStubs.send, mockData);
      assert.strictEqual(result, retryResponse);
    });
  });
});

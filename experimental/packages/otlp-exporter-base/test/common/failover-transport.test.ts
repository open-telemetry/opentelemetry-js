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
import { createFailoverTransport } from '../../src/transport/failover-transport';
import { IExporterTransport, ExportResponse } from '../../src';

const testPayload = Uint8Array.from([1, 2, 3]);
const timeoutMillis = 1000;

describe('FailoverTransport', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('send', function () {
    it('returns primary result when primary succeeds', async function () {
      // arrange
      const expectedResponse: ExportResponse = { status: 'success' };
      const primaryStubs = {
        send: sinon.stub().resolves(expectedResponse),
        shutdown: sinon.stub(),
      };
      const failoverStubs = {
        send: sinon.stub().resolves({ status: 'success' }),
        shutdown: sinon.stub(),
      };
      const transport = createFailoverTransport({
        primary: primaryStubs as IExporterTransport,
        failover: failoverStubs as IExporterTransport,
      });

      // act
      const result = await transport.send(testPayload, timeoutMillis);

      // assert
      assert.deepEqual(result, expectedResponse);
      sinon.assert.calledOnceWithExactly(
        primaryStubs.send,
        testPayload,
        timeoutMillis
      );
      sinon.assert.notCalled(failoverStubs.send);
    });

    it('returns primary result when primary returns retryable', async function () {
      // arrange
      const expectedResponse: ExportResponse = { status: 'retryable' };
      const primaryStubs = {
        send: sinon.stub().resolves(expectedResponse),
        shutdown: sinon.stub(),
      };
      const failoverStubs = {
        send: sinon.stub().resolves({ status: 'success' }),
        shutdown: sinon.stub(),
      };
      const transport = createFailoverTransport({
        primary: primaryStubs as IExporterTransport,
        failover: failoverStubs as IExporterTransport,
      });

      // act
      const result = await transport.send(testPayload, timeoutMillis);

      // assert
      assert.deepEqual(result, expectedResponse);
      sinon.assert.calledOnceWithExactly(
        primaryStubs.send,
        testPayload,
        timeoutMillis
      );
      sinon.assert.notCalled(failoverStubs.send);
    });

    it('switches to failover when primary fails', async function () {
      // arrange
      const failureResponse: ExportResponse = {
        status: 'failure',
        error: new Error('Primary failed'),
      };
      const successResponse: ExportResponse = { status: 'success' };
      const primaryStubs = {
        send: sinon.stub().resolves(failureResponse),
        shutdown: sinon.stub(),
      };
      const failoverStubs = {
        send: sinon.stub().resolves(successResponse),
        shutdown: sinon.stub(),
      };
      const transport = createFailoverTransport({
        primary: primaryStubs as IExporterTransport,
        failover: failoverStubs as IExporterTransport,
      });

      // act
      const result = await transport.send(testPayload, timeoutMillis);

      // assert
      assert.deepEqual(result, successResponse);
      sinon.assert.calledOnceWithExactly(
        primaryStubs.send,
        testPayload,
        timeoutMillis
      );
      sinon.assert.calledOnceWithExactly(
        failoverStubs.send,
        testPayload,
        timeoutMillis
      );
    });

    it('returns failover failure when both fail', async function () {
      // arrange
      const primaryFailure: ExportResponse = {
        status: 'failure',
        error: new Error('Primary failed'),
      };
      const failoverFailure: ExportResponse = {
        status: 'failure',
        error: new Error('Failover failed'),
      };
      const primaryStubs = {
        send: sinon.stub().resolves(primaryFailure),
        shutdown: sinon.stub(),
      };
      const failoverStubs = {
        send: sinon.stub().resolves(failoverFailure),
        shutdown: sinon.stub(),
      };
      const transport = createFailoverTransport({
        primary: primaryStubs as IExporterTransport,
        failover: failoverStubs as IExporterTransport,
      });

      // act
      const result = await transport.send(testPayload, timeoutMillis);

      // assert
      assert.deepEqual(result, failoverFailure);
      sinon.assert.calledOnceWithExactly(
        primaryStubs.send,
        testPayload,
        timeoutMillis
      );
      sinon.assert.calledOnceWithExactly(
        failoverStubs.send,
        testPayload,
        timeoutMillis
      );
    });

    it('rejects when primary rejects', async function () {
      // arrange
      const expectedError = new Error('Primary rejected');
      const primaryStubs = {
        send: sinon.stub().rejects(expectedError),
        shutdown: sinon.stub(),
      };
      const failoverStubs = {
        send: sinon.stub().resolves({ status: 'success' }),
        shutdown: sinon.stub(),
      };
      const transport = createFailoverTransport({
        primary: primaryStubs as IExporterTransport,
        failover: failoverStubs as IExporterTransport,
      });

      // act & assert
      await assert.rejects(() => transport.send(testPayload, timeoutMillis));
      sinon.assert.calledOnceWithExactly(
        primaryStubs.send,
        testPayload,
        timeoutMillis
      );
      sinon.assert.notCalled(failoverStubs.send);
    });

    it('rejects when failover rejects after primary fails', async function () {
      // arrange
      const primaryFailure: ExportResponse = {
        status: 'failure',
        error: new Error('Primary failed'),
      };
      const failoverError = new Error('Failover rejected');
      const primaryStubs = {
        send: sinon.stub().resolves(primaryFailure),
        shutdown: sinon.stub(),
      };
      const failoverStubs = {
        send: sinon.stub().rejects(failoverError),
        shutdown: sinon.stub(),
      };
      const transport = createFailoverTransport({
        primary: primaryStubs as IExporterTransport,
        failover: failoverStubs as IExporterTransport,
      });

      // act & assert
      await assert.rejects(() => transport.send(testPayload, timeoutMillis));
      sinon.assert.calledOnceWithExactly(
        primaryStubs.send,
        testPayload,
        timeoutMillis
      );
      sinon.assert.calledOnceWithExactly(
        failoverStubs.send,
        testPayload,
        timeoutMillis
      );
    });
  });

  describe('shutdown', function () {
    it('shuts down both transports', function () {
      // arrange
      const primaryStubs = {
        send: sinon.stub(),
        shutdown: sinon.stub(),
      };
      const failoverStubs = {
        send: sinon.stub(),
        shutdown: sinon.stub(),
      };
      const transport = createFailoverTransport({
        primary: primaryStubs as IExporterTransport,
        failover: failoverStubs as IExporterTransport,
      });

      // act
      transport.shutdown();

      // assert
      sinon.assert.calledOnce(primaryStubs.shutdown);
      sinon.assert.calledOnce(failoverStubs.shutdown);
    });
  });
});

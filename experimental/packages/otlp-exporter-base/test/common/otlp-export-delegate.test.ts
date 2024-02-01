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
import { ISerializer } from '../../src';
import { IExportPromiseQueue } from '../../src';
import { IOTLPResponseHandler } from '../../src';
import { ITransformer } from '../../src';
import { ExportResultCode } from '@opentelemetry/core';
import { diag } from '@opentelemetry/api';
import { createOtlpExportDelegate } from '../../src';
import { ExportResponse } from '../../src';

interface FakeInternalRepresentation {
  foo: string;
}

interface FakeSignalRequest {
  bar: string;
}

interface FakeSignalResponse {
  baz: string;
}

type FakeSerializer = ISerializer<FakeSignalRequest, FakeSignalResponse>;
type FakeResponseHandler = IOTLPResponseHandler<FakeSignalResponse>;
type FakeTransformer = ITransformer<
  FakeInternalRepresentation,
  FakeSignalRequest
>;

const internalRepresentation: FakeInternalRepresentation = {
  foo: 'internal',
};

const requestRepresentation: FakeSignalRequest = {
  bar: 'request',
};

describe('OTLPExportDelegate', function () {
  describe('forceFlush', function () {
    afterEach(function () {
      sinon.restore();
    });

    it('awaits promise queue', async function () {
      // transport does not need to do anything in this case.
      const transportStubs = {
        send: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      const serializerStubs = {
        serializeRequest: sinon.stub(),
        deserializeResponse: sinon.stub(),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // promise queue has not reached capacity yet
      const promiseQueueStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub(),
        awaitAll: sinon.stub().returns(Promise.resolve()),
      };
      const promiseQueue = <IExportPromiseQueue>promiseQueueStubs;

      const responseHandlerStubs = {
        handleResponse: sinon.stub(),
      };
      const responseHandler = <FakeResponseHandler>responseHandlerStubs;

      const transformerStubs = {
        transform: sinon.stub(),
      };
      const transformer = <FakeTransformer>transformerStubs;

      const exporter = createOtlpExportDelegate({
        promiseQueue,
        transformer,
        serializer: mockSerializer,
        responseHandler,
        transport: mockTransport,
      });

      await exporter.forceFlush();
      sinon.assert.calledOnce(promiseQueueStubs.awaitAll);
    });
  });

  describe('shutdown', function () {
    afterEach(function () {
      sinon.restore();
    });

    it('awaits promise queue', async function () {
      // transport does not need to do anything in this case.
      const transportStubs = {
        send: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      const serializerStubs = {
        serializeRequest: sinon.stub(),
        deserializeResponse: sinon.stub(),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // promise queue has not reached capacity yet
      const promiseQueueStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub(),
        awaitAll: sinon.stub().returns(Promise.resolve()),
      };
      const promiseQueue = <IExportPromiseQueue>promiseQueueStubs;

      const responseHandlerStubs = {
        handleResponse: sinon.stub(),
      };
      const responseHandler = <FakeResponseHandler>responseHandlerStubs;

      const transformerStubs = {
        transform: sinon.stub(),
      };
      const transformer = <FakeTransformer>transformerStubs;

      const exporter = createOtlpExportDelegate({
        promiseQueue,
        transformer,
        serializer: mockSerializer,
        responseHandler,
        transport: mockTransport,
      });

      await exporter.shutdown();
      sinon.assert.calledOnce(promiseQueueStubs.awaitAll);
    });
  });

  describe('export', function () {
    afterEach(function () {
      sinon.restore();
    });

    // TODO: add assertions for newly introduced message handler/transformer
    it('fails if serializer returns undefined', function (done) {
      // transport does not need to do anything in this case.
      const transportStubs = {
        send: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      const serializerStubs = {
        serializeRequest: sinon.stub().returns(undefined),
        deserializeResponse: sinon.stub(),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // promise queue has not reached capacity yet
      const promiseQueueStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseQueue = <IExportPromiseQueue>promiseQueueStubs;

      const responseHandlerStubs = {
        handleResponse: sinon.stub(),
      };
      const responseHandler = <FakeResponseHandler>responseHandlerStubs;

      const transformerStubs = {
        transform: sinon.stub().returns(requestRepresentation),
      };
      const transformer = <FakeTransformer>transformerStubs;

      const exporter = createOtlpExportDelegate({
        promiseQueue,
        transformer,
        serializer: mockSerializer,
        responseHandler,
        transport: mockTransport,
      });

      exporter.export(internalRepresentation, result => {
        try {
          assert.strictEqual(result.code, ExportResultCode.FAILED);
          assert.ok(result.error);
        } catch (err) {
          // ensures we throw if there are more calls to result;
          done(err);
        }
      });

      sinon.assert.calledOnceWithExactly(
        serializerStubs.serializeRequest,
        requestRepresentation
      );
      sinon.assert.notCalled(serializerStubs.deserializeResponse);
      sinon.assert.notCalled(transportStubs.send);
      sinon.assert.notCalled(promiseQueueStubs.pushPromise);
      sinon.assert.calledOnce(promiseQueueStubs.hasReachedLimit);
      sinon.assert.notCalled(promiseQueueStubs.awaitAll);
      done();
    });

    it('fails if promise queue is full', function (done) {
      // transport does not need to do anything in this case.
      const transportStubs = {
        send: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      // serializer should be never used when the queue is full, so it does not need to do anything.
      const serializerStubs = {
        serializeRequest: sinon.stub(),
        deserializeResponse: sinon.stub(),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // make queue signal that it is full.
      const promiseQueueStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(true),
        awaitAll: sinon.stub(),
      };
      const promiseQueue = <IExportPromiseQueue>promiseQueueStubs;

      const responseHandlerStubs = {
        handleResponse: sinon.stub(),
      };
      const responseHandler = <FakeResponseHandler>responseHandlerStubs;

      const transformerStubs = {
        transform: sinon.stub().returns(requestRepresentation),
      };
      const transformer = <FakeTransformer>transformerStubs;

      const exporter = createOtlpExportDelegate({
        promiseQueue,
        transformer,
        serializer: mockSerializer,
        responseHandler,
        transport: mockTransport,
      });

      exporter.export(internalRepresentation, result => {
        try {
          assert.strictEqual(result.code, ExportResultCode.FAILED);
          assert.ok(result.error);
        } catch (err) {
          // ensures we throw if there are more calls to result;
          done(err);
        }
      });

      sinon.assert.notCalled(serializerStubs.serializeRequest);
      sinon.assert.notCalled(serializerStubs.deserializeResponse);
      sinon.assert.notCalled(transportStubs.send);
      sinon.assert.notCalled(promiseQueueStubs.pushPromise);
      sinon.assert.calledOnce(promiseQueueStubs.hasReachedLimit);
      sinon.assert.notCalled(promiseQueueStubs.awaitAll);
      done();
    });

    it('returns success if send promise resolves with success', function (done) {
      const exportResponse: ExportResponse = {
        data: Uint8Array.from([]),
        status: 'success',
      };
      // transport fakes empty response
      const transportStubs = {
        send: sinon.stub().returns(Promise.resolve(exportResponse)),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      const serializerStubs = {
        // simulate that the serializer returns something to send
        serializeRequest: sinon.stub().returns(Uint8Array.from([1])),
        // simulate that it returns a full success (empty response)
        deserializeResponse: sinon.stub().returns({}),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // mock a queue that has not yet reached capacity
      const promiseQueueStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseQueue = <IExportPromiseQueue>promiseQueueStubs;

      const responseHandlerStubs = {
        handleResponse: sinon.stub(),
      };
      const responseHandler = <FakeResponseHandler>responseHandlerStubs;

      const transformerStubs = {
        transform: sinon.stub().returns(requestRepresentation),
      };
      const transformer = <FakeTransformer>transformerStubs;

      const exporter = createOtlpExportDelegate({
        promiseQueue,
        transformer,
        serializer: mockSerializer,
        responseHandler,
        transport: mockTransport,
      });

      exporter.export(internalRepresentation, result => {
        try {
          assert.strictEqual(result.code, ExportResultCode.SUCCESS);
          assert.strictEqual(result.error, undefined);

          // assert here as otherwise the promise will not have executed yet
          // TODO: assert correct values are passed to the stubs.
          sinon.assert.calledOnce(serializerStubs.serializeRequest);
          sinon.assert.calledOnce(serializerStubs.deserializeResponse);
          sinon.assert.calledOnce(transportStubs.send);
          sinon.assert.calledOnce(promiseQueueStubs.pushPromise);
          sinon.assert.calledOnce(promiseQueueStubs.hasReachedLimit);
          sinon.assert.notCalled(promiseQueueStubs.awaitAll);
          done();
        } catch (err) {
          // ensures we throw if there are more calls to result;
          done(err);
        }
      });
    });

    it('returns failure if send promise resolves with failure', function (done) {
      const exportResponse: ExportResponse = {
        data: Uint8Array.from([]),
        status: 'failure',
      };
      // transport fakes empty response
      const transportStubs = {
        send: sinon.stub().returns(Promise.resolve(exportResponse)),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      const serializerStubs = {
        // simulate that the serializer returns something to send
        serializeRequest: sinon.stub().returns(Uint8Array.from([1])),
        // simulate that it returns a full success (empty response)
        deserializeResponse: sinon.stub().returns({}),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // mock a queue that has not yet reached capacity
      const promiseQueueStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseQueue = <IExportPromiseQueue>promiseQueueStubs;

      const responseHandlerStubs = {
        handleResponse: sinon.stub(),
      };
      const responseHandler = <FakeResponseHandler>responseHandlerStubs;

      const transformerStubs = {
        transform: sinon.stub().returns(requestRepresentation),
      };
      const transformer = <FakeTransformer>transformerStubs;

      const exporter = createOtlpExportDelegate({
        promiseQueue,
        transformer,
        serializer: mockSerializer,
        responseHandler,
        transport: mockTransport,
      });

      exporter.export(internalRepresentation, result => {
        try {
          assert.strictEqual(result.code, ExportResultCode.FAILED);
          assert.strictEqual(result.error, undefined);

          // assert here as otherwise the promise will not have executed yet
          // TODO: assert correct values are passed to the stubs.
          sinon.assert.calledOnce(serializerStubs.serializeRequest);
          sinon.assert.calledOnce(serializerStubs.deserializeResponse);
          sinon.assert.calledOnce(transportStubs.send);
          sinon.assert.calledOnce(promiseQueueStubs.pushPromise);
          sinon.assert.calledOnce(promiseQueueStubs.hasReachedLimit);
          sinon.assert.notCalled(promiseQueueStubs.awaitAll);
          done();
        } catch (err) {
          // ensures we throw if there are more calls to result;
          done(err);
        }
      });
    });

    it('returns failure if send promise resolves with retryable', function (done) {
      const exportResponse: ExportResponse = {
        data: Uint8Array.from([]),
        status: 'retryable',
      };
      // transport fakes empty response
      const transportStubs = {
        send: sinon.stub().returns(Promise.resolve(exportResponse)),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      const serializerStubs = {
        // simulate that the serializer returns something to send
        serializeRequest: sinon.stub().returns(Uint8Array.from([1])),
        // simulate that it returns a full success (empty response)
        deserializeResponse: sinon.stub().returns({}),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // mock a queue that has not yet reached capacity
      const promiseQueueStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseQueue = <IExportPromiseQueue>promiseQueueStubs;

      const responseHandlerStubs = {
        handleResponse: sinon.stub(),
      };
      const responseHandler = <FakeResponseHandler>responseHandlerStubs;

      const transformerStubs = {
        transform: sinon.stub().returns(requestRepresentation),
      };
      const transformer = <FakeTransformer>transformerStubs;

      const exporter = createOtlpExportDelegate({
        promiseQueue,
        transformer,
        serializer: mockSerializer,
        responseHandler,
        transport: mockTransport,
      });

      exporter.export(internalRepresentation, result => {
        try {
          assert.strictEqual(result.code, ExportResultCode.FAILED);
          assert.strictEqual(result.error, undefined);

          // assert here as otherwise the promise will not have executed yet
          // TODO: assert correct values are passed to the stubs.
          sinon.assert.calledOnce(serializerStubs.serializeRequest);
          sinon.assert.calledOnce(serializerStubs.deserializeResponse);
          sinon.assert.calledOnce(transportStubs.send);
          sinon.assert.calledOnce(promiseQueueStubs.pushPromise);
          sinon.assert.calledOnce(promiseQueueStubs.hasReachedLimit);
          sinon.assert.notCalled(promiseQueueStubs.awaitAll);
          done();
        } catch (err) {
          // ensures we throw if there are more calls to result;
          done(err);
        }
      });
    });

    it('returns success if response is returned', function (done) {
      // returns full success response (empty body)
      const exportResponse: ExportResponse = {
        data: Uint8Array.from([]),
        status: 'success',
      };

      // transport does not need to do anything in this case.
      const transportStubs = {
        send: sinon.stub().returns(Promise.resolve(exportResponse)),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      const response: FakeSignalResponse = {
        baz: 'partial success',
      };

      const serializerStubs = {
        // simulate that the serializer returns something to send
        serializeRequest: sinon.stub().returns(Uint8Array.from([1])),
        // simulate that it returns a partial success (response with contents)
        deserializeResponse: sinon.stub().returns(response),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // mock a queue that has not yet reached capacity
      const promiseQueueStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseQueue = <IExportPromiseQueue>promiseQueueStubs;

      const responseHandlerStubs = {
        handleResponse: sinon.stub(),
      };
      const responseHandler = <FakeResponseHandler>responseHandlerStubs;

      const transformerStubs = {
        transform: sinon.stub().returns(requestRepresentation),
      };
      const transformer = <FakeTransformer>transformerStubs;

      const exporter = createOtlpExportDelegate({
        promiseQueue,
        transformer,
        serializer: mockSerializer,
        responseHandler,
        transport: mockTransport,
      });

      exporter.export(internalRepresentation, result => {
        try {
          assert.strictEqual(result.code, ExportResultCode.SUCCESS);
          assert.strictEqual(result.error, undefined);

          // assert here as otherwise the promise will not have executed yet
          sinon.assert.calledOnce(serializerStubs.serializeRequest);
          sinon.assert.calledOnce(serializerStubs.deserializeResponse);
          sinon.assert.calledOnce(transportStubs.send);
          sinon.assert.calledOnce(promiseQueueStubs.pushPromise);
          sinon.assert.calledOnce(promiseQueueStubs.hasReachedLimit);
          sinon.assert.notCalled(promiseQueueStubs.awaitAll);
          done();
        } catch (err) {
          // ensures we throw if there are more calls to result;
          done(err);
        }
      });
    });

    it('returns success and warns if deserializing partial success fails', function (done) {
      const spyLoggerError = sinon.stub(diag, 'error');

      // returns full success response (empty body)
      const exportResponse: ExportResponse = {
        data: Uint8Array.from([]),
        status: 'success',
      };
      // transport does not need to do anything in this case.
      const transportStubs = {
        send: sinon.stub().returns(Promise.resolve(exportResponse)),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      const mockSerializationError = new Error('deserialization failed');
      const serializerStubs = {
        // simulate that the serializer returns something to send
        serializeRequest: sinon.stub().returns(Uint8Array.from([1])),
        // simulate that it returns a full success (empty response)
        deserializeResponse: sinon.stub().throws(mockSerializationError),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // mock a queue that has not yet reached capacity
      const promiseQueueStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseQueue = <IExportPromiseQueue>promiseQueueStubs;

      const responseHandlerStubs = {
        handleResponse: sinon.stub(),
      };
      const responseHandler = <FakeResponseHandler>responseHandlerStubs;

      const transformerStubs = {
        transform: sinon.stub().returns(requestRepresentation),
      };
      const transformer = <FakeTransformer>transformerStubs;

      const exporter = createOtlpExportDelegate({
        promiseQueue,
        transformer,
        serializer: mockSerializer,
        responseHandler,
        transport: mockTransport,
      });

      exporter.export(internalRepresentation, result => {
        try {
          assert.strictEqual(result.code, ExportResultCode.SUCCESS);
          assert.strictEqual(result.error, undefined);

          // assert here as otherwise the promise will not have executed yet
          sinon.assert.calledWithExactly(
            spyLoggerError,
            'Invalid response from remote',
            mockSerializationError
          );
          sinon.assert.calledOnce(serializerStubs.serializeRequest);
          sinon.assert.calledOnce(serializerStubs.deserializeResponse);
          sinon.assert.calledOnce(transportStubs.send);
          sinon.assert.calledOnce(promiseQueueStubs.pushPromise);
          sinon.assert.calledOnce(promiseQueueStubs.hasReachedLimit);
          sinon.assert.notCalled(promiseQueueStubs.awaitAll);
          done();
        } catch (err) {
          // ensures we throw if there are more calls to result;
          done(err);
        }
      });
    });

    it('returns failure when send rejects', function (done) {
      const transportStubs = {
        // make transport reject
        send: sinon.stub().returns(Promise.reject(new Error())),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      const serializerStubs = {
        // simulate that the serializer returns something to send
        serializeRequest: sinon.stub().returns(Uint8Array.from([1])),
        // does not need to do anything, should never be called.
        deserializeResponse: sinon.stub(),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // mock a queue that has not yet reached capacity
      const promiseQueueStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseQueue = <IExportPromiseQueue>promiseQueueStubs;

      const responseHandlerStubs = {
        handleResponse: sinon.stub(),
      };
      const responseHandler = <FakeResponseHandler>responseHandlerStubs;

      const transformerStubs = {
        transform: sinon.stub().returns(requestRepresentation),
      };
      const transformer = <FakeTransformer>transformerStubs;

      const exporter = createOtlpExportDelegate({
        promiseQueue,
        transformer,
        serializer: mockSerializer,
        responseHandler,
        transport: mockTransport,
      });

      exporter.export(internalRepresentation, result => {
        try {
          assert.strictEqual(result.code, ExportResultCode.FAILED);
          assert.ok(result.error);

          // assert here as otherwise the promise will not have executed yet
          sinon.assert.calledOnce(serializerStubs.serializeRequest);
          sinon.assert.notCalled(serializerStubs.deserializeResponse);
          sinon.assert.calledOnce(transportStubs.send);
          sinon.assert.calledOnce(promiseQueueStubs.pushPromise);
          sinon.assert.calledOnce(promiseQueueStubs.hasReachedLimit);
          sinon.assert.notCalled(promiseQueueStubs.awaitAll);
          done();
        } catch (err) {
          // ensures we throw if there are more calls to result;
          done(err);
        }
      });
    });
  });
});

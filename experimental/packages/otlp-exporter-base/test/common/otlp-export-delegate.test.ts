/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as sinon from 'sinon';
import * as assert from 'assert';
import type { IExporterTransport } from '../../src';
import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode } from '@opentelemetry/core';
import { createOtlpExportDelegate } from '../../src/otlp-export-delegate';
import type { ExportResponse } from '../../src';
import type { ISerializer } from '@opentelemetry/otlp-transformer';
import type { IExportPromiseHandler } from '../../src/bounded-queue-export-promise-handler';
import { registerMockDiagLogger } from './test-utils';

interface FakeInternalRepresentation {
  foo: string;
}

interface FakeSignalResponse {
  partialSuccess?: { foo: string };
}

type FakeSerializer = ISerializer<
  FakeInternalRepresentation,
  FakeSignalResponse
>;

const internalRepresentation: FakeInternalRepresentation = {
  foo: 'internal',
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
        shutdown: sinon.stub(),
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
      const promiseQueue = <IExportPromiseHandler>promiseQueueStubs;

      const exporter = createOtlpExportDelegate(
        {
          promiseHandler: promiseQueue,
          serializer: mockSerializer,
          transport: mockTransport,
        },
        {
          timeout: 1000,
        }
      );

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
        shutdown: sinon.stub(),
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
      const promiseQueue = <IExportPromiseHandler>promiseQueueStubs;

      const exporter = createOtlpExportDelegate(
        {
          promiseHandler: promiseQueue,
          serializer: mockSerializer,
          transport: mockTransport,
        },
        {
          timeout: 1000,
        }
      );

      await exporter.shutdown();
      sinon.assert.calledOnce(promiseQueueStubs.awaitAll);
    });
  });

  describe('export', function () {
    afterEach(function () {
      sinon.restore();
    });

    it('fails if serializer returns undefined', async function () {
      // transport does not need to do anything in this case.
      const transportStubs = {
        send: sinon.stub(),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      const serializerStubs = {
        serializeRequest: sinon.stub().returns(undefined),
        deserializeResponse: sinon.stub(),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // promise queue has not reached capacity yet
      const promiseHandlerStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseHandler = <IExportPromiseHandler>promiseHandlerStubs;

      const exporter = createOtlpExportDelegate(
        {
          promiseHandler: promiseHandler,
          serializer: mockSerializer,
          transport: mockTransport,
        },
        {
          timeout: 1000,
        }
      );

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(internalRepresentation, resolve);
      });
      assert.strictEqual(result.code, ExportResultCode.FAILED);
      assert.ok(result.error);

      sinon.assert.calledOnceWithExactly(
        serializerStubs.serializeRequest,
        internalRepresentation
      );
      sinon.assert.notCalled(serializerStubs.deserializeResponse);
      sinon.assert.notCalled(transportStubs.send);
      sinon.assert.notCalled(promiseHandlerStubs.pushPromise);
      sinon.assert.calledOnce(promiseHandlerStubs.hasReachedLimit);
      sinon.assert.notCalled(promiseHandlerStubs.awaitAll);
    });

    it('fails if promise queue is full', async function () {
      // transport does not need to do anything in this case.
      const transportStubs = {
        send: sinon.stub(),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      // serializer should be never used when the queue is full, so it does not need to do anything.
      const serializerStubs = {
        serializeRequest: sinon.stub(),
        deserializeResponse: sinon.stub(),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // make queue signal that it is full.
      const promiseHandlerStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(true),
        awaitAll: sinon.stub(),
      };
      const promiseHandler = <IExportPromiseHandler>promiseHandlerStubs;

      const exporter = createOtlpExportDelegate(
        {
          promiseHandler: promiseHandler,
          serializer: mockSerializer,
          transport: mockTransport,
        },
        {
          timeout: 1000,
        }
      );

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(internalRepresentation, resolve);
      });
      assert.strictEqual(result.code, ExportResultCode.FAILED);
      assert.ok(result.error);

      sinon.assert.notCalled(serializerStubs.serializeRequest);
      sinon.assert.notCalled(serializerStubs.deserializeResponse);
      sinon.assert.notCalled(transportStubs.send);
      sinon.assert.notCalled(promiseHandlerStubs.pushPromise);
      sinon.assert.calledOnce(promiseHandlerStubs.hasReachedLimit);
      sinon.assert.notCalled(promiseHandlerStubs.awaitAll);
    });

    it('returns success if send promise resolves with success', async function () {
      const exportResponse: ExportResponse = {
        data: Uint8Array.from([]),
        status: 'success',
      };
      // transport fakes empty response
      const transportStubs = {
        send: sinon.stub().returns(Promise.resolve(exportResponse)),
        shutdown: sinon.stub(),
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
      const promiseHandlerStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseHandler = <IExportPromiseHandler>promiseHandlerStubs;

      const exporter = createOtlpExportDelegate(
        {
          promiseHandler: promiseHandler,
          serializer: mockSerializer,
          transport: mockTransport,
        },
        {
          timeout: 1000,
        }
      );

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(internalRepresentation, resolve);
      });
      {
        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
        assert.strictEqual(result.error, undefined);

        // assert here as otherwise the promise will not have executed yet
        sinon.assert.calledOnce(serializerStubs.serializeRequest);
        sinon.assert.calledOnce(transportStubs.send);
        sinon.assert.calledOnce(promiseHandlerStubs.pushPromise);
        sinon.assert.calledOnce(promiseHandlerStubs.hasReachedLimit);
        sinon.assert.notCalled(promiseHandlerStubs.awaitAll);
      }
    });

    it('returns failure if send promise resolves with failure', async function () {
      const exportResponse: ExportResponse = {
        status: 'failure',
        error: new Error('failure'),
      };
      // transport fakes empty response
      const transportStubs = {
        send: sinon.stub().returns(Promise.resolve(exportResponse)),
        shutdown: sinon.stub,
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
      const promiseHandlerStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseHandler = <IExportPromiseHandler>promiseHandlerStubs;

      const exporter = createOtlpExportDelegate(
        {
          promiseHandler: promiseHandler,
          serializer: mockSerializer,
          transport: mockTransport,
        },
        {
          timeout: 1000,
        }
      );

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(internalRepresentation, resolve);
      });
      {
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        assert.strictEqual(result.error, exportResponse.error);

        // assert here as otherwise the promise will not have executed yet
        sinon.assert.calledOnce(serializerStubs.serializeRequest);
        sinon.assert.calledOnce(transportStubs.send);
        sinon.assert.calledOnce(promiseHandlerStubs.pushPromise);
        sinon.assert.calledOnce(promiseHandlerStubs.hasReachedLimit);
        sinon.assert.notCalled(promiseHandlerStubs.awaitAll);
      }
    });

    it('returns unknown failure if send promise resolves with failure but no error', async function () {
      const exportResponse: ExportResponse = {
        status: 'failure',
        error: undefined as any,
      };
      // transport fakes empty response
      const transportStubs = {
        send: sinon.stub().returns(Promise.resolve(exportResponse)),
        shutdown: sinon.stub,
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
      const promiseHandlerStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseHandler = <IExportPromiseHandler>promiseHandlerStubs;

      const exporter = createOtlpExportDelegate(
        {
          promiseHandler: promiseHandler,
          serializer: mockSerializer,
          transport: mockTransport,
        },
        {
          timeout: 1000,
        }
      );

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(internalRepresentation, resolve);
      });
      {
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        assert.strictEqual(
          result.error?.message,
          'Export failed with unknown error'
        );

        // assert here as otherwise the promise will not have executed yet
        sinon.assert.calledOnce(serializerStubs.serializeRequest);
        sinon.assert.calledOnce(transportStubs.send);
        sinon.assert.calledOnce(promiseHandlerStubs.pushPromise);
        sinon.assert.calledOnce(promiseHandlerStubs.hasReachedLimit);
        sinon.assert.notCalled(promiseHandlerStubs.awaitAll);
      }
    });

    it('returns failure if send promise resolves with retryable', async function () {
      const exportResponse: ExportResponse = {
        status: 'retryable',
      };
      // transport fakes empty response
      const transportStubs = {
        send: sinon.stub().returns(Promise.resolve(exportResponse)),
        shutdown: sinon.stub(),
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
      const promiseHandlerStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseHandler = <IExportPromiseHandler>promiseHandlerStubs;

      const exporter = createOtlpExportDelegate(
        {
          promiseHandler: promiseHandler,
          serializer: mockSerializer,
          transport: mockTransport,
        },
        {
          timeout: 1000,
        }
      );

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(internalRepresentation, resolve);
      });
      {
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        assert.strictEqual(
          result.error?.message,
          'Export failed with retryable status'
        );

        // assert here as otherwise the promise will not have executed yet
        sinon.assert.calledOnce(serializerStubs.serializeRequest);
        sinon.assert.calledOnce(transportStubs.send);
        sinon.assert.calledOnce(promiseHandlerStubs.pushPromise);
        sinon.assert.calledOnce(promiseHandlerStubs.hasReachedLimit);
        sinon.assert.notCalled(promiseHandlerStubs.awaitAll);
      }
    });

    it('returns success if response is returned', async function () {
      // returns full success response (empty body)
      const exportResponse: ExportResponse = {
        data: Uint8Array.from([]),
        status: 'success',
      };

      // transport does not need to do anything in this case.
      const transportStubs = {
        send: sinon.stub().returns(Promise.resolve(exportResponse)),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      const response: FakeSignalResponse = {};

      const serializerStubs = {
        // simulate that the serializer returns something to send
        serializeRequest: sinon.stub().returns(Uint8Array.from([1])),
        // simulate that it returns a partial success (response with contents)
        deserializeResponse: sinon.stub().returns(response),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // mock a queue that has not yet reached capacity
      const promiseHandlerStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseHandler = <IExportPromiseHandler>promiseHandlerStubs;

      const exporter = createOtlpExportDelegate(
        {
          promiseHandler: promiseHandler,
          serializer: mockSerializer,
          transport: mockTransport,
        },
        {
          timeout: 1000,
        }
      );

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(internalRepresentation, resolve);
      });
      {
        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
        assert.strictEqual(result.error, undefined);

        // assert here as otherwise the promise will not have executed yet
        sinon.assert.calledOnce(serializerStubs.serializeRequest);
        sinon.assert.calledOnce(transportStubs.send);
        sinon.assert.calledOnce(promiseHandlerStubs.pushPromise);
        sinon.assert.calledOnce(promiseHandlerStubs.hasReachedLimit);
        sinon.assert.notCalled(promiseHandlerStubs.awaitAll);
      }
    });

    it('returns success even if response cannot be deserialized', async function () {
      const { warn } = registerMockDiagLogger();
      // returns mock success response (empty body)
      const exportResponse: ExportResponse = {
        data: Uint8Array.from([]),
        status: 'success',
      };

      // transport does not need to do anything in this case.
      const transportStubs = {
        send: sinon.stub().returns(Promise.resolve(exportResponse)),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      const serializerStubs = {
        // simulate that the serializer returns something to send
        serializeRequest: sinon.stub().returns(Uint8Array.from([1])),
        // simulate that it returns a partial success (response with contents)
        deserializeResponse: sinon.stub().throws(new Error()),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // mock a queue that has not yet reached capacity
      const promiseHandlerStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseHandler = <IExportPromiseHandler>promiseHandlerStubs;

      const exporter = createOtlpExportDelegate(
        {
          promiseHandler: promiseHandler,
          serializer: mockSerializer,
          transport: mockTransport,
        },
        {
          timeout: 1000,
        }
      );

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(internalRepresentation, resolve);
      });
      {
        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
        assert.strictEqual(result.error, undefined);

        // assert here as otherwise the promise will not have executed yet
        sinon.assert.calledOnceWithMatch(
          warn,
          'OTLPExportDelegate',
          'Export succeeded but could not deserialize response - is the response specification compliant?',
          sinon.match.instanceOf(Error),
          exportResponse.data
        );
        sinon.assert.calledOnce(serializerStubs.serializeRequest);
        sinon.assert.calledOnce(transportStubs.send);
        sinon.assert.calledOnce(promiseHandlerStubs.pushPromise);
        sinon.assert.calledOnce(promiseHandlerStubs.hasReachedLimit);
        sinon.assert.notCalled(promiseHandlerStubs.awaitAll);
      }
    });

    it('returns success and warns on partial success response', async function () {
      const { warn } = registerMockDiagLogger();
      // returns mock success response (empty body)
      const exportResponse: ExportResponse = {
        data: Uint8Array.from([]),
        status: 'success',
      };

      // transport does not need to do anything in this case.
      const transportStubs = {
        send: sinon.stub().returns(Promise.resolve(exportResponse)),
        shutdown: sinon.stub(),
      };
      const mockTransport = <IExporterTransport>transportStubs;

      const partialSuccessResponse: FakeSignalResponse = {
        partialSuccess: { foo: 'bar' },
      };

      const serializerStubs = {
        // simulate that the serializer returns something to send
        serializeRequest: sinon.stub().returns(Uint8Array.from([1])),
        // simulate that it returns a partial success (response with contents)
        deserializeResponse: sinon.stub().returns(partialSuccessResponse),
      };
      const mockSerializer = <FakeSerializer>serializerStubs;

      // mock a queue that has not yet reached capacity
      const promiseHandlerStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseHandler = <IExportPromiseHandler>promiseHandlerStubs;

      const exporter = createOtlpExportDelegate(
        {
          promiseHandler: promiseHandler,
          serializer: mockSerializer,
          transport: mockTransport,
        },
        {
          timeout: 1000,
        }
      );

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(internalRepresentation, resolve);
      });
      {
        assert.strictEqual(result.code, ExportResultCode.SUCCESS);
        assert.strictEqual(result.error, undefined);

        // assert here as otherwise the promise will not have executed yet
        sinon.assert.calledOnceWithMatch(
          warn,
          'Received Partial Success response:',
          JSON.stringify(partialSuccessResponse.partialSuccess)
        );
        sinon.assert.calledOnce(serializerStubs.serializeRequest);
        sinon.assert.calledOnce(transportStubs.send);
        sinon.assert.calledOnce(promiseHandlerStubs.pushPromise);
        sinon.assert.calledOnce(promiseHandlerStubs.hasReachedLimit);
        sinon.assert.notCalled(promiseHandlerStubs.awaitAll);
      }
    });

    it('returns failure when send rejects', async function () {
      const transportStubs = {
        // make transport reject
        send: sinon.stub().returns(Promise.reject(new Error())),
        shutdown: sinon.stub(),
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
      const promiseHandlerStubs = {
        pushPromise: sinon.stub(),
        hasReachedLimit: sinon.stub().returns(false),
        awaitAll: sinon.stub(),
      };
      const promiseHandler = <IExportPromiseHandler>promiseHandlerStubs;

      const exporter = createOtlpExportDelegate(
        {
          promiseHandler: promiseHandler,
          serializer: mockSerializer,
          transport: mockTransport,
        },
        {
          timeout: 1000,
        }
      );

      const result = await new Promise<ExportResult>(resolve => {
        exporter.export(internalRepresentation, resolve);
      });
      {
        assert.strictEqual(result.code, ExportResultCode.FAILED);
        assert.ok(result.error);

        // assert here as otherwise the promise will not have executed yet
        sinon.assert.calledOnce(serializerStubs.serializeRequest);
        sinon.assert.notCalled(serializerStubs.deserializeResponse);
        sinon.assert.calledOnce(transportStubs.send);
        sinon.assert.calledOnce(promiseHandlerStubs.pushPromise);
        sinon.assert.calledOnce(promiseHandlerStubs.hasReachedLimit);
        sinon.assert.notCalled(promiseHandlerStubs.awaitAll);
      }
    });
  });
});

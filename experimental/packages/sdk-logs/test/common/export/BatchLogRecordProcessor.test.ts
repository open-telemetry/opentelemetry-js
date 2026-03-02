/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  ExportResult,
  ExportResultCode,
  loggingErrorHandler,
  setGlobalErrorHandler,
} from '@opentelemetry/core';

import {
  BufferConfig,
  LogRecordLimits,
  SdkLogRecord,
  InMemoryLogRecordExporter,
  LogRecordExporter,
} from '../../../src';
import { BatchLogRecordProcessorBase } from '../../../src/export/BatchLogRecordProcessorBase';
import { LoggerProviderSharedState } from '../../../src/internal/LoggerProviderSharedState';
import {
  defaultResource,
  Resource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { LogRecordImpl } from '../../../src/LogRecordImpl';

class BatchLogRecordProcessor extends BatchLogRecordProcessorBase<BufferConfig> {
  onInit() {}
  onShutdown() {}
}

const createLogRecord = (
  limits?: LogRecordLimits,
  resource?: Resource
): SdkLogRecord => {
  const sharedState = new LoggerProviderSharedState(
    resource || defaultResource(),
    Infinity,
    {
      attributeCountLimit: limits?.attributeCountLimit ?? 128,
      attributeValueLengthLimit: limits?.attributeValueLengthLimit ?? Infinity,
    },
    []
  );
  return new LogRecordImpl(
    sharedState,
    {
      name: 'test name',
      version: 'test version',
      schemaUrl: 'test schema url',
    },
    {
      body: 'body',
    }
  );
};

describe('BatchLogRecordProcessorBase', () => {
  const defaultBufferConfig = {
    maxExportBatchSize: 5,
    scheduledDelayMillis: 2500,
  };
  let exporter: InMemoryLogRecordExporter;

  beforeEach(() => {
    exporter = new InMemoryLogRecordExporter();
  });

  afterEach(() => {
    exporter.reset();
    sinon.restore();
  });

  describe('constructor', () => {
    it('should create a BatchLogRecordProcessor instance', () => {
      const processor = new BatchLogRecordProcessor(exporter);
      assert.ok(processor instanceof BatchLogRecordProcessor);
      processor.shutdown();
    });

    it('should create a BatchLogRecordProcessor instance with config', () => {
      const bufferConfig = {
        maxExportBatchSize: 5,
        scheduledDelayMillis: 2500,
        exportTimeoutMillis: 2000,
        maxQueueSize: 200,
      };
      const processor = new BatchLogRecordProcessor(exporter, bufferConfig);
      assert.ok(processor instanceof BatchLogRecordProcessor);
      assert.strictEqual(
        processor['_maxExportBatchSize'],
        bufferConfig.maxExportBatchSize
      );
      assert.strictEqual(processor['_maxQueueSize'], bufferConfig.maxQueueSize);
      assert.strictEqual(
        processor['_scheduledDelayMillis'],
        bufferConfig.scheduledDelayMillis
      );
      assert.strictEqual(
        processor['_exportTimeoutMillis'],
        bufferConfig.exportTimeoutMillis
      );
      processor.shutdown();
    });

    it('should create a BatchLogRecordProcessor instance with empty config', () => {
      const processor = new BatchLogRecordProcessor(exporter);

      assert.ok(processor instanceof BatchLogRecordProcessor);
      assert.strictEqual(processor['_maxExportBatchSize'], 512);
      assert.strictEqual(processor['_maxQueueSize'], 2048);
      assert.strictEqual(processor['_scheduledDelayMillis'], 5000);
      assert.strictEqual(processor['_exportTimeoutMillis'], 30000);
      processor.shutdown();
    });

    it('maxExportBatchSize must be smaller or equal to maxQueueSize', () => {
      const bufferConfig = {
        maxExportBatchSize: 200,
        maxQueueSize: 100,
      };
      const processor = new BatchLogRecordProcessor(exporter, bufferConfig);
      assert.strictEqual(
        processor['_maxExportBatchSize'],
        processor['_maxQueueSize']
      );
    });
  });

  describe('onEmit', () => {
    it('should export the log records with buffer size reached', done => {
      const processor = new BatchLogRecordProcessor(
        exporter,
        defaultBufferConfig
      );
      // Add logs up to maxExportBatchSize - 1 (should not trigger export yet)
      for (let i = 0; i < defaultBufferConfig.maxExportBatchSize - 1; i++) {
        const logRecord = createLogRecord();
        assert.strictEqual(exporter.getFinishedLogRecords().length, 0);
        processor.onEmit(logRecord);
        assert.strictEqual(exporter.getFinishedLogRecords().length, 0);
      }
      // Add the final log that reaches maxExportBatchSize (should trigger immediate export)
      const logRecord = createLogRecord();
      processor.onEmit(logRecord);
      setTimeout(async () => {
        // Should now have exported the batch immediately
        assert.strictEqual(
          exporter.getFinishedLogRecords().length,
          defaultBufferConfig.maxExportBatchSize
        );
        await processor.shutdown();
        assert.strictEqual(exporter.getFinishedLogRecords().length, 0);
        done();
      }, 10); // Small delay to allow async export to complete
    });

    it('should export immediately when maxExportBatchSize is reached', async () => {
      const processor = new BatchLogRecordProcessor(
        exporter,
        defaultBufferConfig
      );
      const exportSpy = sinon.spy(exporter, 'export');

      // Add logs up to maxExportBatchSize - 1
      for (let i = 0; i < defaultBufferConfig.maxExportBatchSize - 1; i++) {
        const logRecord = createLogRecord();
        processor.onEmit(logRecord);
        assert.strictEqual(exporter.getFinishedLogRecords().length, 0);
        sinon.assert.notCalled(exportSpy);
      }

      // Add the final log that should trigger immediate export
      const logRecord = createLogRecord();
      processor.onEmit(logRecord);

      // Allow async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify export was called immediately
      sinon.assert.calledOnce(exportSpy);
      assert.strictEqual(
        exporter.getFinishedLogRecords().length,
        defaultBufferConfig.maxExportBatchSize
      );

      await processor.shutdown();
    });

    it('should export immediately without waiting for timer when batch size reached', async () => {
      const processor = new BatchLogRecordProcessor(
        exporter,
        { ...defaultBufferConfig, scheduledDelayMillis: 10000 } // Long delay
      );
      const exportSpy = sinon.spy(exporter, 'export');

      // Fill the batch completely
      for (let i = 0; i < defaultBufferConfig.maxExportBatchSize; i++) {
        const logRecord = createLogRecord();
        processor.onEmit(logRecord);
      }

      // Allow async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify export happened without waiting for the timer
      sinon.assert.calledOnce(exportSpy);
      assert.strictEqual(
        exporter.getFinishedLogRecords().length,
        defaultBufferConfig.maxExportBatchSize
      );

      await processor.shutdown();
    });

    it('should handle multiple immediate exports when batches fill up', async () => {
      const processor = new BatchLogRecordProcessor(
        exporter,
        defaultBufferConfig
      );
      const exportSpy = sinon.spy(exporter, 'export');

      // Fill up exactly 2 batches worth of logs
      const totalLogs = defaultBufferConfig.maxExportBatchSize * 2;
      for (let i = 0; i < totalLogs; i++) {
        const logRecord = createLogRecord();
        processor.onEmit(logRecord);
      }

      // Allow async operations to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should have called export twice (once per filled batch)
      sinon.assert.calledTwice(exportSpy);
      assert.strictEqual(exporter.getFinishedLogRecords().length, totalLogs);

      await processor.shutdown();
    });

    it('should still use timer for partial batches after immediate export', async () => {
      const processor = new BatchLogRecordProcessor(
        exporter,
        { ...defaultBufferConfig, scheduledDelayMillis: 100 } // Shorter delay for testing
      );
      const exportSpy = sinon.spy(exporter, 'export');

      // Fill one complete batch - should trigger immediate export
      for (let i = 0; i < defaultBufferConfig.maxExportBatchSize; i++) {
        const logRecord = createLogRecord();
        processor.onEmit(logRecord);
      }

      // Allow immediate export to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify first batch was exported immediately
      sinon.assert.calledOnce(exportSpy);
      const exportedSoFar = exporter.getFinishedLogRecords().length;
      assert.strictEqual(exportedSoFar, defaultBufferConfig.maxExportBatchSize);

      // Add one more log (partial batch)
      const logRecord = createLogRecord();
      processor.onEmit(logRecord);

      // Should not export yet (still waiting for timer)
      assert.strictEqual(exportSpy.callCount, 1); // Still only one call from the immediate export

      // Wait for timer to trigger the partial batch export
      await new Promise(resolve => setTimeout(resolve, 200)); // Wait longer than scheduledDelayMillis

      // Should have exported the partial batch
      sinon.assert.calledTwice(exportSpy);
      assert.strictEqual(
        exporter.getFinishedLogRecords().length,
        exportedSoFar + 1
      );

      await processor.shutdown();
    });

    it('should force flush when timeout exceeded for partial batches', done => {
      const clock = sinon.useFakeTimers();
      const processor = new BatchLogRecordProcessor(
        exporter,
        defaultBufferConfig
      );
      // Add only a partial batch (less than maxExportBatchSize)
      const partialBatchSize = Math.floor(
        defaultBufferConfig.maxExportBatchSize / 2
      );
      for (let i = 0; i < partialBatchSize; i++) {
        const logRecord = createLogRecord();
        processor.onEmit(logRecord);
        assert.strictEqual(exporter.getFinishedLogRecords().length, 0);
      }
      setTimeout(() => {
        // Should export the partial batch after timeout
        assert.strictEqual(
          exporter.getFinishedLogRecords().length,
          partialBatchSize
        );
        done();
      }, defaultBufferConfig.scheduledDelayMillis + 1000);
      clock.tick(defaultBufferConfig.scheduledDelayMillis + 1000);
      clock.restore();
    });

    it('should not export empty log record lists', done => {
      const spy = sinon.spy(exporter, 'export');
      const clock = sinon.useFakeTimers();
      new BatchLogRecordProcessor(exporter, defaultBufferConfig);
      setTimeout(() => {
        assert.strictEqual(exporter.getFinishedLogRecords().length, 0);
        sinon.assert.notCalled(spy);
        done();
      }, defaultBufferConfig.scheduledDelayMillis + 1000);
      assert.strictEqual(exporter.getFinishedLogRecords().length, 0);
      clock.tick(defaultBufferConfig.scheduledDelayMillis + 1000);

      clock.restore();
    });

    it('should export each log record exactly once with buffer size  reached multiple times', done => {
      const originalTimeout = setTimeout;
      const clock = sinon.useFakeTimers();
      const processor = new BatchLogRecordProcessor(
        exporter,
        defaultBufferConfig
      );
      const totalLogRecords = defaultBufferConfig.maxExportBatchSize * 2;
      for (let i = 0; i < totalLogRecords; i++) {
        const logRecord = createLogRecord();
        processor.onEmit(logRecord);
      }
      const logRecord = createLogRecord();
      processor.onEmit(logRecord);
      clock.tick(defaultBufferConfig.scheduledDelayMillis + 10);
      originalTimeout(() => {
        clock.tick(defaultBufferConfig.scheduledDelayMillis + 10);
        originalTimeout(async () => {
          clock.tick(defaultBufferConfig.scheduledDelayMillis + 10);
          clock.restore();
          assert.strictEqual(
            exporter.getFinishedLogRecords().length,
            totalLogRecords + 1
          );
          await processor.shutdown();
          assert.strictEqual(exporter.getFinishedLogRecords().length, 0);
          done();
        });
      });
    });

    it('should call globalErrorHandler when exporting fails', done => {
      const clock = sinon.useFakeTimers();
      const expectedError = new Error('Exporter failed');
      sinon.stub(exporter, 'export').callsFake((_, callback) => {
        setTimeout(() => {
          callback({ code: ExportResultCode.FAILED, error: expectedError });
        }, 0);
      });
      const errorHandlerSpy = sinon.spy();
      setGlobalErrorHandler(errorHandlerSpy);
      const processor = new BatchLogRecordProcessor(
        exporter,
        defaultBufferConfig
      );
      for (let i = 0; i < defaultBufferConfig.maxExportBatchSize; i++) {
        const logRecord = createLogRecord();
        processor.onEmit(logRecord);
      }
      clock.tick(defaultBufferConfig.scheduledDelayMillis + 1000);
      clock.restore();
      setTimeout(() => {
        assert.strictEqual(errorHandlerSpy.callCount, 1);
        const [[error]] = errorHandlerSpy.args;
        assert.deepStrictEqual(error, expectedError);
        // reset global error handler
        setGlobalErrorHandler(loggingErrorHandler());
        done();
      });
    });

    it('should drop logRecords when there are more logRecords than "maxQueueSize"', () => {
      // Use a large batch size to prevent automatic exports during this test
      const maxQueueSize = 6;
      const maxExportBatchSize = 20; // Will be clamped to maxQueueSize (6) by constructor
      const processor = new BatchLogRecordProcessor(exporter, {
        maxQueueSize,
        maxExportBatchSize,
      });

      // Verify that maxExportBatchSize was adjusted to maxQueueSize
      assert.strictEqual(processor['_maxExportBatchSize'], maxQueueSize);

      // Disable the processor temporarily to prevent exports during testing
      const originalMaybeStartTimer = processor['_maybeStartTimer'];
      processor['_maybeStartTimer'] = () => {}; // Do nothing

      const logRecord = createLogRecord();

      // Add more logs than the queue can hold
      for (let i = 0; i < maxQueueSize + 5; i++) {
        processor.onEmit(logRecord);
      }

      // Should only have maxQueueSize logs in the buffer, others should be dropped
      assert.strictEqual(processor['_finishedLogRecords'].length, maxQueueSize);

      // Restore original method
      processor['_maybeStartTimer'] = originalMaybeStartTimer;

      processor.shutdown();
    });
  });

  describe('forceFlush', () => {
    it('should force flush on demand', async () => {
      const processor = new BatchLogRecordProcessor(
        exporter,
        defaultBufferConfig
      );
      // Add partial batch (less than maxExportBatchSize) so it doesn't export automatically
      const partialBatchSize = Math.floor(
        defaultBufferConfig.maxExportBatchSize / 2
      );
      for (let i = 0; i < partialBatchSize; i++) {
        const logRecord = createLogRecord();
        processor.onEmit(logRecord);
      }
      assert.strictEqual(exporter.getFinishedLogRecords().length, 0);
      await processor.forceFlush();
      assert.strictEqual(
        exporter.getFinishedLogRecords().length,
        partialBatchSize
      );
    });

    it('should call an async callback when flushing is complete', async () => {
      const processor = new BatchLogRecordProcessor(exporter);
      const logRecord = createLogRecord();
      processor.onEmit(logRecord);
      await processor.forceFlush();
      assert.strictEqual(exporter.getFinishedLogRecords().length, 1);
    });

    it('should wait for pending resource on flush', async () => {
      const processor = new BatchLogRecordProcessor(exporter);
      const asyncResource = resourceFromAttributes({
        async: new Promise<string>(resolve =>
          setTimeout(() => resolve('fromasync'), 1)
        ),
      });
      const logRecord = createLogRecord(undefined, asyncResource);
      processor.onEmit(logRecord);
      await processor.forceFlush();
      const exportedLogs = exporter.getFinishedLogRecords();
      assert.strictEqual(exportedLogs.length, 1);
      assert.strictEqual(
        exportedLogs[0].resource.attributes['async'],
        'fromasync'
      );
    });
  });

  describe('shutdown', () => {
    it('should call onShutdown', async () => {
      const processor = new BatchLogRecordProcessor(exporter);
      const onShutdownSpy = sinon.stub(processor, 'onShutdown');
      assert.strictEqual(onShutdownSpy.callCount, 0);
      await processor.shutdown();
      assert.strictEqual(onShutdownSpy.callCount, 1);
    });

    it('should call an async callback when shutdown is complete', async () => {
      let exportedLogRecords = 0;
      sinon.stub(exporter, 'export').callsFake((logRecords, callback) => {
        setTimeout(() => {
          exportedLogRecords = exportedLogRecords + logRecords.length;
          callback({ code: ExportResultCode.SUCCESS });
        }, 0);
      });
      const processor = new BatchLogRecordProcessor(exporter);
      const logRecord = createLogRecord();
      processor.onEmit(logRecord);
      await processor.shutdown();
      assert.strictEqual(exporter.getFinishedLogRecords().length, 0);
      assert.strictEqual(exportedLogRecords, 1);
    });
  });

  describe('Concurrency', () => {
    it('should only send a single batch at a time', async () => {
      const callbacks: ((result: ExportResult) => void)[] = [];
      const logRecords: SdkLogRecord[] = [];
      const exporter: LogRecordExporter = {
        export: async (
          exportedLogRecords: SdkLogRecord[],
          resultCallback: (result: ExportResult) => void
        ) => {
          callbacks.push(resultCallback);
          logRecords.push(...exportedLogRecords);
        },
        shutdown: async () => {},
      };
      const processor = new BatchLogRecordProcessor(exporter, {
        maxExportBatchSize: 5,
        maxQueueSize: 6,
      });
      const totalLogRecords = 50;
      for (let i = 0; i < totalLogRecords; i++) {
        const logRecord = createLogRecord();
        processor.onEmit(logRecord);
      }
      assert.equal(callbacks.length, 1);
      assert.equal(logRecords.length, 5);
      callbacks[0]({ code: ExportResultCode.SUCCESS });
      await new Promise(resolve => setTimeout(resolve, 0));
      // After the first batch completes we will have dropped a number
      // of log records and the next batch will be smaller
      assert.equal(callbacks.length, 2);
      assert.equal(logRecords.length, 10);
      callbacks[1]({ code: ExportResultCode.SUCCESS });

      // We expect that all the other log records have been dropped
      await new Promise(resolve => setTimeout(resolve, 0));
      assert.equal(callbacks.length, 2);
      assert.equal(logRecords.length, 10);
    });
  });
});

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

import { context, diag } from '@opentelemetry/api';
import {
  ExportResultCode,
  globalErrorHandler,
  BindOnceFuture,
  suppressTracing,
} from '@opentelemetry/core';

import type { BufferConfig } from '../types';
import type { SdkLogRecord } from './SdkLogRecord';
import type { LogRecordExporter } from './LogRecordExporter';
import type { LogRecordProcessor } from '../LogRecordProcessor';

/**
 * Waits for all pending async resources in the log records to be resolved.
 */
async function waitForResources(logRecords: SdkLogRecord[]): Promise<void> {
  const pendingResources: Array<Promise<void>> = [];
  for (let i = 0, len = logRecords.length; i < len; i++) {
    const logRecord = logRecords[i];
    if (
      logRecord.resource.asyncAttributesPending &&
      logRecord.resource.waitForAsyncAttributes
    ) {
      pendingResources.push(logRecord.resource.waitForAsyncAttributes());
    }
  }

  if (pendingResources != null && pendingResources.length > 0) {
    await Promise.all(pendingResources);
  }
}

/**
 * Represents an export operation that handles the entire export workflow.
 */
class ExportOperation {
  private readonly _exportCompleted: Promise<void>;
  private readonly _exportScheduledPromise: Promise<void>;
  private _exportScheduledResolve!: () => void;

  constructor(
    exporter: LogRecordExporter,
    logRecords: SdkLogRecord[],
    exportTimeoutMillis: number
  ) {
    this._exportScheduledPromise = new Promise<void>(resolve => {
      this._exportScheduledResolve = resolve;
    });
    this._exportCompleted = this._executeExport(
      exporter,
      logRecords,
      exportTimeoutMillis
    );
  }

  /** Get the promise that resolves when the export completes */
  get exportCompleted(): Promise<void> {
    return this._exportCompleted;
  }

  /** Get the promise that resolves when exporter.export() has been called */
  get exportScheduled(): Promise<void> {
    return this._exportScheduledPromise;
  }

  private async _executeExport(
    exporter: LogRecordExporter,
    logRecords: SdkLogRecord[],
    exportTimeoutMillis: number
  ): Promise<void> {
    try {
      // Wait for all pending resources before exporting
      await waitForResources(logRecords);

      // Export with timeout, wrapped in suppressTracing context
      await context.with(suppressTracing(context.active()), async () => {
        return this._exportWithTimeout(
          exporter,
          logRecords,
          exportTimeoutMillis
        );
      });
    } catch (e) {
      // ensure we never reject here, as we may call await after it has already resolved.
      globalErrorHandler(e);
      // resolve, as the error may have occurred before export was scheduled
      this._exportScheduledResolve();
    }
  }

  private async _exportWithTimeout(
    exporter: LogRecordExporter,
    logRecords: SdkLogRecord[],
    exportTimeoutMillis: number
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timeout'));
      }, exportTimeoutMillis);

      // Call exporter.export() and immediately resolve exportScheduled
      exporter.export(logRecords, result => {
        clearTimeout(timer);
        if (result.code === ExportResultCode.SUCCESS) {
          resolve();
        } else {
          reject(
            result.error ??
              new Error('BatchLogRecordProcessor: log record export failed')
          );
        }
      });

      // Resolve exportScheduled immediately after calling exporter.export()
      this._exportScheduledResolve();
    });
  }
}

export abstract class BatchLogRecordProcessorBase<T extends BufferConfig>
  implements LogRecordProcessor
{
  private readonly _maxExportBatchSize: number;
  private readonly _maxQueueSize: number;
  private readonly _scheduledDelayMillis: number;
  private readonly _exportTimeoutMillis: number;
  private readonly _exporter: LogRecordExporter;

  private _currentExport: ExportOperation | null = null;
  private _finishedLogRecords: SdkLogRecord[] = [];
  private _timer: NodeJS.Timeout | number | undefined;
  private _shutdownOnce: BindOnceFuture<void>;
  private _flushing: boolean = false;

  constructor(exporter: LogRecordExporter, config?: T) {
    this._exporter = exporter;
    this._maxExportBatchSize = config?.maxExportBatchSize ?? 512;
    this._maxQueueSize = config?.maxQueueSize ?? 2048;
    this._scheduledDelayMillis = config?.scheduledDelayMillis ?? 5000;
    this._exportTimeoutMillis = config?.exportTimeoutMillis ?? 30000;

    this._shutdownOnce = new BindOnceFuture(this._shutdown, this);

    if (this._maxExportBatchSize > this._maxQueueSize) {
      diag.warn(
        'BatchLogRecordProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize'
      );
      this._maxExportBatchSize = this._maxQueueSize;
    }
  }

  public onEmit(logRecord: SdkLogRecord): void {
    if (this._shutdownOnce.isCalled) {
      return;
    }
    this._addToBuffer(logRecord);
  }

  public forceFlush(): Promise<void> {
    if (this._shutdownOnce.isCalled) {
      return this._shutdownOnce.promise;
    }
    return this._flushAll();
  }

  /** Add a LogRecord in the buffer. */
  private _addToBuffer(logRecord: SdkLogRecord) {
    if (this._finishedLogRecords.length >= this._maxQueueSize) {
      return;
    }
    this._finishedLogRecords.push(logRecord);
    this._maybeStartTimer();
  }

  public shutdown(): Promise<void> {
    return this._shutdownOnce.call();
  }

  private async _shutdown(): Promise<void> {
    this.onShutdown();
    await this._flushAll();
    await this._exporter.shutdown();
  }

  /**
   * Send all LogRecords to the exporter respecting the batch size limit
   * This function is used only on forceFlush or shutdown,
   * for all other cases _exportOneBatch should be used
   * */
  private async _flushAll(): Promise<void> {
    // Guard against concurrent flushes. Concurrent .forceFlush() calls will
    // return without waiting for the in-progress flush to finish.
    if (this._flushing) {
      return;
    }
    this._flushing = true;

    // Grab the current set of finished log records, because the spec says:
    // > ... for which the LogRecordProcessor had already received events prior to the call to ForceFlush ...
    let toFlush = this._finishedLogRecords;
    this._finishedLogRecords = [];

    // Clear timer to prevent concurrent exports
    this._clearTimer();

    // Wait for any in-progress export to complete
    if (this._currentExport !== null) {
      // speed up execution for current export
      await this._exporter.forceFlush();
      await this._currentExport.exportCompleted;
      this._currentExport = null;
    }

    // Now flush all batches sequentially to avoid race conditions
    while (toFlush.length > 0) {
      let batch;
      if (toFlush.length <= this._maxExportBatchSize) {
        batch = toFlush;
        toFlush = [];
      } else {
        batch = toFlush.splice(0, this._maxExportBatchSize);
      }

      const exportOp = new ExportOperation(
        this._exporter,
        batch,
        this._exportTimeoutMillis
      );
      this._currentExport = exportOp;

      // await export scheduled, then force flush exporter to speed up export
      try {
        await exportOp.exportScheduled;
        await this._exporter.forceFlush();
        await exportOp.exportCompleted;
      } catch (e) {
        globalErrorHandler(e);
      } finally {
        this._currentExport = null;
      }
    }

    this._flushing = false;
    this._maybeStartTimer();
  }

  /**
   * Extracts one batch from the buffer.
   * Returns null if buffer is empty.
   */
  private _extractBatch(): SdkLogRecord[] | null {
    if (this._finishedLogRecords.length === 0) {
      return null;
    }

    if (this._finishedLogRecords.length <= this._maxExportBatchSize) {
      const batch = this._finishedLogRecords;
      this._finishedLogRecords = [];
      return batch;
    } else {
      return this._finishedLogRecords.splice(0, this._maxExportBatchSize);
    }
  }

  private _exportOneBatch(): void {
    this._clearTimer();

    const logRecords = this._extractBatch();
    if (logRecords === null) {
      return;
    }

    const exportOp = new ExportOperation(
      this._exporter,
      logRecords,
      this._exportTimeoutMillis
    );
    this._currentExport = exportOp;

    // Handle completion asynchronously
    exportOp.exportCompleted
      .then(() => {
        this._currentExport = null;
        this._maybeStartTimer();
      })
      .catch(error => {
        this._currentExport = null;
        globalErrorHandler(error);
        this._maybeStartTimer();
      });
  }

  private _maybeStartTimer() {
    if (this._shutdownOnce.isCalled) {
      return;
    }

    if (this._flushing) {
      return;
    }

    if (this._finishedLogRecords.length === 0) {
      return;
    }

    if (this._currentExport !== null) {
      return;
    }

    // If batch is full, export immediately
    if (this._finishedLogRecords.length >= this._maxExportBatchSize) {
      this._exportOneBatch();
      return;
    }

    // If timer is already set, don't set another one
    if (this._timer !== undefined) {
      return;
    }

    // Set timer for scheduled export
    this._timer = setTimeout(() => {
      this._timer = undefined;
      this._exportOneBatch();
    }, this._scheduledDelayMillis);

    // Unref timer so it doesn't keep process alive
    if (typeof this._timer !== 'number') {
      this._timer.unref();
    }
  }

  private _clearTimer() {
    if (this._timer !== undefined) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }

  protected abstract onShutdown(): void;
}

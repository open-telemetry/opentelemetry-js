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

import type { ExportResult } from '@opentelemetry/core';
import { diag } from '@opentelemetry/api';
import {
  ExportResultCode,
  getEnv,
  globalErrorHandler,
  unrefTimer,
  callWithTimeout,
  BindOnceFuture,
} from '@opentelemetry/core';

import type { BufferConfig } from '../types';
import type { LogRecord } from '../LogRecord';
import type { LogRecordExporter } from './LogRecordExporter';
import type { LogRecordProcessor } from '../LogRecordProcessor';

export abstract class BatchLogRecordProcessorBase<T extends BufferConfig>
  implements LogRecordProcessor
{
  private readonly _maxExportBatchSize: number;
  private readonly _maxQueueSize: number;
  private readonly _scheduledDelayMillis: number;
  private readonly _exportTimeoutMillis: number;

  private _finishedLogRecords: LogRecord[] = [];
  private _timer: NodeJS.Timeout | undefined;
  private _shutdownOnce: BindOnceFuture<void>;

  constructor(private readonly _exporter: LogRecordExporter, config?: T) {
    const env = getEnv();
    this._maxExportBatchSize =
      config?.maxExportBatchSize ?? env.OTEL_BLRP_MAX_EXPORT_BATCH_SIZE;
    this._maxQueueSize = config?.maxQueueSize ?? env.OTEL_BLRP_MAX_QUEUE_SIZE;
    this._scheduledDelayMillis =
      config?.scheduledDelayMillis ?? env.OTEL_BLRP_SCHEDULE_DELAY;
    this._exportTimeoutMillis =
      config?.exportTimeoutMillis ?? env.OTEL_BLRP_EXPORT_TIMEOUT;

    this._shutdownOnce = new BindOnceFuture(this._shutdown, this);

    if (this._maxExportBatchSize > this._maxQueueSize) {
      diag.warn(
        'BatchLogRecordProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize'
      );
      this._maxExportBatchSize = this._maxQueueSize;
    }
  }

  public onEmit(logRecord: LogRecord): void {
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

  public shutdown(): Promise<void> {
    return this._shutdownOnce.call();
  }

  private async _shutdown(): Promise<void> {
    this.onShutdown();
    await this._flushAll();
    await this._exporter.shutdown();
  }

  /** Add a LogRecord in the buffer. */
  private _addToBuffer(logRecord: LogRecord) {
    if (this._finishedLogRecords.length >= this._maxQueueSize) {
      return;
    }
    this._finishedLogRecords.push(logRecord);
    this._maybeStartTimer();
  }

  /**
   * Send all LogRecords to the exporter respecting the batch size limit
   * This function is used only on forceFlush or shutdown,
   * for all other cases _flush should be used
   * */
  private _flushAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      const promises = [];
      const batchCount = Math.ceil(
        this._finishedLogRecords.length / this._maxExportBatchSize
      );
      for (let i = 0; i < batchCount; i++) {
        promises.push(this._flushOneBatch());
      }
      Promise.all(promises)
        .then(() => {
          resolve();
        })
        .catch(reject);
    });
  }

  private _flushOneBatch(): Promise<void> {
    this._clearTimer();
    if (this._finishedLogRecords.length === 0) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      callWithTimeout(
        this._export(
          this._finishedLogRecords.splice(0, this._maxExportBatchSize)
        ),
        this._exportTimeoutMillis
      )
        .then(() => resolve())
        .catch(reject);
    });
  }

  private _maybeStartTimer() {
    if (this._timer !== undefined) {
      return;
    }
    this._timer = setTimeout(() => {
      this._flushOneBatch()
        .then(() => {
          if (this._finishedLogRecords.length > 0) {
            this._clearTimer();
            this._maybeStartTimer();
          }
        })
        .catch(e => {
          globalErrorHandler(e);
        });
    }, this._scheduledDelayMillis);
    unrefTimer(this._timer);
  }

  private _clearTimer() {
    if (this._timer !== undefined) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }

  private _export(logRecords: LogRecord[]): Promise<ExportResult> {
    return new Promise((resolve, reject) => {
      this._exporter.export(logRecords, (res: ExportResult) => {
        if (res.code !== ExportResultCode.SUCCESS) {
          reject(
            res.error ??
              new Error(
                `BatchLogRecordProcessorBase: log record export failed (status ${res})`
              )
          );
          return;
        }
        resolve(res);
      });
    });
  }

  protected abstract onShutdown(): void;
}

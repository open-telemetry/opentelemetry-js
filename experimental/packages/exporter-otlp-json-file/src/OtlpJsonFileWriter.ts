/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Writable } from 'stream';
import { diag } from '@opentelemetry/api';
import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode } from '@opentelemetry/core';
import type { OtlpJsonFileExporterConfig } from './types';

const NEWLINE_BUFFER = Buffer.from('\n');

/**
 * Shared internal stream writer for OTLP JSON File Exporters.
 * Handles line formatting, backpressure, concurrent write tracking, error propagation,
 * and graceful flush/shutdown without prematurely closing caller streams.
 */
export class OtlpJsonFileWriter {
  private readonly _stream: Writable;
  private readonly _pendingWrites = new Set<Promise<void>>();
  private _isShutdown = false;
  private readonly _errorHandler: (err: Error) => void;

  constructor(config?: OtlpJsonFileExporterConfig) {
    this._stream = config?.out ?? process.stdout;
    this._errorHandler = (err: Error) => {
      diag.error('OTLP JSON File Exporter stream error', err);
    };

    if (typeof this._stream.on === 'function') {
      this._stream.on('error', this._errorHandler);
    }
  }

  /**
   * Writes a serialized OTLP JSON payload with a trailing newline to the destination stream.
   *
   * @param serialized The serialized JSON request as Uint8Array
   * @param resultCallback The export callback called with ExportResult
   */
  write(
    serialized: Uint8Array,
    resultCallback: (result: ExportResult) => void
  ): void {
    if (this._isShutdown) {
      resultCallback({
        code: ExportResultCode.FAILED,
        error: new Error('Exporter has been shutdown'),
      });
      return;
    }

    if (
      this._stream.destroyed ||
      (this._stream.writable !== undefined && !this._stream.writable)
    ) {
      resultCallback({
        code: ExportResultCode.FAILED,
        error: new Error('Destination stream is not writable'),
      });
      return;
    }

    const payload = Buffer.concat([
      Buffer.isBuffer(serialized) ? serialized : Buffer.from(serialized),
      NEWLINE_BUFFER,
    ]);

    let resolvePending: () => void;
    const pendingPromise = new Promise<void>(resolve => {
      resolvePending = resolve;
    });
    this._pendingWrites.add(pendingPromise);

    let called = false;
    const finish = (result: ExportResult) => {
      if (called) {
        return;
      }
      called = true;
      this._pendingWrites.delete(pendingPromise);
      resolvePending();
      resultCallback(result);
    };

    try {
      this._stream.write(payload, (err?: Error | null) => {
        if (err) {
          diag.error('Error writing OTLP JSON record to stream', err);
          finish({
            code: ExportResultCode.FAILED,
            error: err,
          });
        } else {
          finish({
            code: ExportResultCode.SUCCESS,
          });
        }
      });
    } catch (err: unknown) {
      diag.error('Synchronous write error in OTLP JSON File Exporter', err);
      finish({
        code: ExportResultCode.FAILED,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  /**
   * Ensures that all currently pending writes are flushed to the destination stream.
   */
  async forceFlush(): Promise<void> {
    if (this._pendingWrites.size === 0) {
      return;
    }
    await Promise.all(Array.from(this._pendingWrites));
  }

  /**
   * Shuts down the writer. Waits for all pending writes to complete and detaches error listeners.
   * Note: The underlying stream is deliberately not closed to avoid terminating shared streams like process.stdout.
   */
  async shutdown(): Promise<void> {
    if (this._isShutdown) {
      return;
    }
    this._isShutdown = true;
    await this.forceFlush();
    if (typeof this._stream.removeListener === 'function') {
      this._stream.removeListener('error', this._errorHandler);
    }
  }
}

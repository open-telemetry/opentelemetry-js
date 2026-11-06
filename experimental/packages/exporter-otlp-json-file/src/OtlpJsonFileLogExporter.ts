/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';
import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode } from '@opentelemetry/core';
import { JsonLogsSerializer } from '@opentelemetry/otlp-transformer';
import type {
  LogRecordExporter,
  ReadableLogRecord,
} from '@opentelemetry/sdk-logs';
import { OtlpJsonFileWriter } from './OtlpJsonFileWriter';
import type { OtlpJsonFileExporterConfig } from './types';

/**
 * An OpenTelemetry log exporter that writes OTLP-JSON formatted logs
 * to standard output (process.stdout) or a configurable Writable stream as JSON Lines.
 */
export class OtlpJsonFileLogExporter implements LogRecordExporter {
  private readonly _writer: OtlpJsonFileWriter;

  constructor(config?: OtlpJsonFileExporterConfig) {
    this._writer = new OtlpJsonFileWriter(config);
  }

  /**
   * Exports a batch of readable log records.
   *
   * @param logs Array of log records to export
   * @param resultCallback Callback invoked when export finishes
   */
  export(
    logs: ReadableLogRecord[],
    resultCallback: (result: ExportResult) => void
  ): void {
    if (logs.length === 0) {
      resultCallback({ code: ExportResultCode.SUCCESS });
      return;
    }

    let serialized: Uint8Array | undefined;
    try {
      serialized = JsonLogsSerializer.serializeRequest(logs);
    } catch (err: unknown) {
      diag.error('Failed to serialize logs request', err);
      resultCallback({
        code: ExportResultCode.FAILED,
        error: err instanceof Error ? err : new Error(String(err)),
      });
      return;
    }

    if (!serialized) {
      resultCallback({
        code: ExportResultCode.FAILED,
        error: new Error('Nothing to send'),
      });
      return;
    }

    this._writer.write(serialized, resultCallback);
  }

  /**
   * Shuts down the exporter, ensuring any pending writes are flushed.
   */
  shutdown(): Promise<void> {
    return this._writer.shutdown();
  }

  /**
   * Flushes all pending writes to the stream.
   */
  forceFlush(): Promise<void> {
    return this._writer.forceFlush();
  }
}

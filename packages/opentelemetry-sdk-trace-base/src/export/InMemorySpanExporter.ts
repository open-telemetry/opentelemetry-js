/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SpanExporter } from './SpanExporter';
import type { ReadableSpan } from './ReadableSpan';
import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode } from '@opentelemetry/core';

/**
 * This class can be used for testing purposes. It stores the exported spans
 * in a list in memory that can be retrieved using the `getFinishedSpans()`
 * method.
 */
export class InMemorySpanExporter implements SpanExporter {
  private _finishedSpans: ReadableSpan[] = [];
  /**
   * Indicates if the exporter has been "shutdown."
   * When false, exported spans will not be stored in-memory.
   */
  protected _stopped = false;

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    if (this._stopped)
      return resultCallback({
        code: ExportResultCode.FAILED,
        error: new Error('Exporter has been stopped'),
      });
    this._finishedSpans.push(...spans);

    setTimeout(() => resultCallback({ code: ExportResultCode.SUCCESS }), 0);
  }

  shutdown(): Promise<void> {
    this._stopped = true;
    this._finishedSpans = [];
    return this.forceFlush();
  }

  /**
   * Exports any pending spans in the exporter
   */
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  reset(): void {
    this._finishedSpans = [];
  }

  getFinishedSpans(): ReadableSpan[] {
    return this._finishedSpans;
  }
}

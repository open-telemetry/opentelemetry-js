/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExportResult } from '@opentelemetry/core';
import { IOtlpExportDelegate } from './otlp-export-delegate';

export class OTLPExporterBase<Internal> {
  private _delegate: IOtlpExportDelegate<Internal>;
  constructor(delegate: IOtlpExportDelegate<Internal>) {
    this._delegate = delegate;
  }

  /**
   * Export items.
   * @param items
   * @param resultCallback
   */
  export(
    items: Internal,
    resultCallback: (result: ExportResult) => void
  ): void {
    this._delegate.export(items, resultCallback);
  }

  forceFlush(): Promise<void> {
    return this._delegate.forceFlush();
  }

  shutdown(): Promise<void> {
    return this._delegate.shutdown();
  }
}

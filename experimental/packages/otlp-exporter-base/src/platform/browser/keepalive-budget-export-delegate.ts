/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode } from '@opentelemetry/core';
import { diag } from '@opentelemetry/api';
import type { ISerializer } from '@opentelemetry/otlp-transformer';
import type { IOtlpExportDelegate } from '../../otlp-export-delegate';
import type { ExporterMetrics } from '../../ExporterMetrics';
import {
  getAvailableKeepaliveBudget,
  isDocumentHidden,
} from './transport/fetch-transport';

type Item<Internal> = Internal extends readonly (infer T)[] ? T : never;

/**
 * Sends only the items that fit the keepalive budget while the page is hidden.
 */
class KeepaliveBudgetExportDelegate<Internal, Response>
  implements IOtlpExportDelegate<Internal>
{
  private readonly _delegate: IOtlpExportDelegate<Internal>;
  private readonly _serializer: ISerializer<Internal, Response>;
  private _metrics: ExporterMetrics<Internal>;

  constructor(
    delegate: IOtlpExportDelegate<Internal>,
    serializer: ISerializer<Internal, Response>,
    metrics: ExporterMetrics<Internal>
  ) {
    this._delegate = delegate;
    this._serializer = serializer;
    this._metrics = metrics;
  }

  export(
    internalRepresentation: Internal,
    resultCallback: (result: ExportResult) => void
  ): void {
    if (!isDocumentHidden() || !Array.isArray(internalRepresentation)) {
      this._delegate.export(internalRepresentation, resultCallback);
      return;
    }

    const items = internalRepresentation as unknown as Item<Internal>[];
    const budget = getAvailableKeepaliveBudget();
    if (this._sizeOf(items) <= budget) {
      this._delegate.export(internalRepresentation, resultCallback);
      return;
    }

    const kept = this._selectWithinBudget(items, budget);
    const dropped = items.slice(kept.length);
    diag.warn(
      `page hidden and the batch exceeds the keepalive budget (${budget} bytes): sending ${kept.length} of ${items.length} items, dropping ${dropped.length}`
    );
    const error = new Error(
      'Items dropped because the keepalive budget was exhausted'
    );
    error.name = 'keepalive_budget_exhausted';
    this._metrics.startExport(dropped as unknown as Internal)(error);

    if (kept.length === 0) {
      resultCallback({ code: ExportResultCode.FAILED, error });
      return;
    }
    this._delegate.export(kept as unknown as Internal, resultCallback);
  }

  forceFlush(): Promise<void> {
    return this._delegate.forceFlush();
  }

  shutdown(): Promise<void> {
    return this._delegate.shutdown();
  }

  setMetrics(metrics: ExporterMetrics<Internal>): void {
    this._metrics = metrics;
    this._delegate.setMetrics(metrics);
  }

  private _sizeOf(items: Item<Internal>[]): number {
    return (
      this._serializer.serializeRequest(items as unknown as Internal)
        ?.byteLength ?? 0
    );
  }

  /** Longest prefix of items whose serialized size fits the budget. */
  private _selectWithinBudget(
    items: Item<Internal>[],
    budget: number
  ): Item<Internal>[] {
    let low = 0;
    let high = items.length;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      if (this._sizeOf(items.slice(0, mid)) <= budget) {
        low = mid;
      } else {
        high = mid - 1;
      }
    }
    return items.slice(0, low);
  }
}

export function createKeepaliveBudgetExportDelegate<Internal, Response>(
  delegate: IOtlpExportDelegate<Internal>,
  serializer: ISerializer<Internal, Response>,
  metrics: ExporterMetrics<Internal>
): IOtlpExportDelegate<Internal> {
  return new KeepaliveBudgetExportDelegate(delegate, serializer, metrics);
}

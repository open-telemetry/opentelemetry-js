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

export interface TerminalAdmissionOptions<Internal> {
  /**
   * Ranks items when only some of them fit the keepalive budget: higher ranks
   * are sent first and items of equal rank keep their input order. Without it
   * the order is first in, first out.
   */
  priority?: (item: Item<Internal>) => number;
}

/**
 * Wraps an export delegate for the case where the page is hidden. A request
 * sent then can be cancelled together with the page unless it uses
 * `keepalive`, and the browser grants that only up to a cumulative size. When
 * the serialized batch does not fit, whole items are kept so that what is sent
 * fits, and the rest is counted as failed with a `keepalive_budget_exhausted`
 * error type instead of being lost without a trace.
 *
 * Only exports whose internal representation is a list of items (spans and
 * log records) can be partitioned, because the byte transport cannot split a
 * serialized request. Other exports pass through unchanged.
 */
class TerminalAdmissionExportDelegate<Internal, Response>
  implements IOtlpExportDelegate<Internal>
{
  private readonly _delegate: IOtlpExportDelegate<Internal>;
  private readonly _serializer: ISerializer<Internal, Response>;
  private _metrics: ExporterMetrics<Internal>;
  private readonly _options: TerminalAdmissionOptions<Internal>;

  constructor(
    delegate: IOtlpExportDelegate<Internal>,
    serializer: ISerializer<Internal, Response>,
    metrics: ExporterMetrics<Internal>,
    options: TerminalAdmissionOptions<Internal>
  ) {
    this._delegate = delegate;
    this._serializer = serializer;
    this._metrics = metrics;
    this._options = options;
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
    const droppedCount = items.length - kept.length;
    const dropped = items.filter(item => !kept.includes(item));
    diag.warn(
      `page hidden and the batch exceeds the keepalive budget (${budget} bytes): sending ${kept.length} of ${items.length} items, dropping ${droppedCount}`
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

  /**
   * Largest prefix of the priority order whose serialized size fits, returned
   * in input order.
   */
  private _selectWithinBudget(
    items: Item<Internal>[],
    budget: number
  ): Item<Internal>[] {
    const priority = this._options.priority;
    const order = items.map((_, index) => index);
    if (priority) {
      const ranks = items.map(item => priority(item));
      order.sort((a, b) => ranks[b] - ranks[a] || a - b);
    }
    const take = (count: number) =>
      order
        .slice(0, count)
        .sort((a, b) => a - b)
        .map(index => items[index]);

    let low = 0;
    let high = items.length;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      if (this._sizeOf(take(mid)) <= budget) {
        low = mid;
      } else {
        high = mid - 1;
      }
    }
    return take(low);
  }
}

export function createTerminalAdmissionExportDelegate<Internal, Response>(
  delegate: IOtlpExportDelegate<Internal>,
  serializer: ISerializer<Internal, Response>,
  metrics: ExporterMetrics<Internal>,
  options: TerminalAdmissionOptions<Internal> = {}
): IOtlpExportDelegate<Internal> {
  return new TerminalAdmissionExportDelegate(
    delegate,
    serializer,
    metrics,
    options
  );
}

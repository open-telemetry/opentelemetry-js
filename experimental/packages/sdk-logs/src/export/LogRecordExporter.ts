/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ExportResult } from '@opentelemetry/core';

import type { ReadableLogRecord } from './ReadableLogRecord';

export interface LogRecordExporter {
  /**
   * Called to export {@link ReadableLogRecord}s.
   * @param logs the list of sampled LogRecords to be exported.
   */
  export(
    logs: ReadableLogRecord[],
    resultCallback: (result: ExportResult) => void
  ): void;

  /** Stops the exporter. */
  shutdown(): Promise<void>;

  /**
   * Finish all pending exports as soon as possible, preferably before
   * resolving the promise returned.
   */
  forceFlush(): Promise<void>;
}

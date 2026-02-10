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

/**
 * Copyright 2019, OpenTelemetry Authors
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

import { SpanExporter } from './SpanExporter';
import { ReadableSpan } from './ReadableSpan';
import { ExportResult } from './ExportResult';

/**
 * This class can be used for testing purposes. It saves the exported spans
 * in a list in memory that can be retrieve using the `getFinishedSpans`
 * method.
 */
export class InMemorySpanExporter implements SpanExporter {
  private _finishedSpan: ReadableSpan[] = [];
  private _stopped = false;

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    if (this._stopped) return resultCallback(ExportResult.FailedNonRetryable);
    this._finishedSpan.push(...spans);
    return resultCallback(ExportResult.Success);
  }

  shutdown(): void {
    this._stopped = true;
    this._finishedSpan = [];
  }

  reset() {
    this._finishedSpan = [];
  }

  getFinishedSpans(): ReadableSpan[] {
    return this._finishedSpan;
  }
}

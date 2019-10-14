/*!
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

import { hrTimeToMicroseconds } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/tracing';
import { ExportResult } from '@opentelemetry/base';

/**
 * Simple console exporter for spans
 */
export class ConsoleExporter implements SpanExporter {
  /**
   * Export spans.
   * @param spans
   * @param resultCallback
   */
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ) {
    return this._sendSpans(spans, resultCallback);
  }

  /**
   * Shutdown the exporter.
   */
  shutdown() {
    this._sendSpans([]);
  }

  /**
   * converts span info into more readable format
   * @param {ReadableSpan} span
   * @private
   */
  private _exportInfo(span: ReadableSpan) {
    return {
      traceId: span.spanContext.traceId,
      parentId: span.parentSpanId,
      name: span.name,
      id: span.spanContext.spanId,
      kind: span.kind,
      timestamp: hrTimeToMicroseconds(span.startTime),
      duration: hrTimeToMicroseconds(span.duration),
      attributes: span.attributes,
      status: span.status,
      events: span.events,
    };
  }

  /**
   * Showing spans in console
   * @param {ReadableSpan[]} spans
   * @param done
   * @private
   */
  private _sendSpans(
    spans: ReadableSpan[],
    done?: (result: ExportResult) => void
  ) {
    for (let i = 0, j = spans.length; i < j; i++) {
      console.log(this._exportInfo(spans[i]));
    }
    if (done) {
      return done(ExportResult.SUCCESS);
    }
  }
}

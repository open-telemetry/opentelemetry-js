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

import {
  diag,
  SpanAttributes,
  SpanKind,
  SpanStatus,
  TimedEvent,
} from '@opentelemetry/api';
import { SpanExporter } from './SpanExporter';
import { ReadableSpan } from './ReadableSpan';
import {
  ExportResult,
  ExportResultCode,
  hrTimeToMicroseconds,
} from '@opentelemetry/core';

/**
 * This is implementation of {@link SpanExporter} that prints spans to the
 * console. This class can be used for diagnostic purposes.
 */
export class ConsoleSpanExporter implements SpanExporter {
  /**
   * Export spans.
   * @param spans
   * @param resultCallback
   */
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    return this._sendSpans(spans, resultCallback);
  }

  /**
   * Shutdown the exporter.
   */
  shutdown(): Promise<void> {
    this._sendSpans([]);
    return Promise.resolve();
  }

  /**
   * converts span info into more readable format
   * @param span
   */
  private _exportInfo(span: ReadableSpan): LoggedSpan {
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
   * @param spans
   * @param done
   */
  private _sendSpans(
    spans: ReadableSpan[],
    done?: (result: ExportResult) => void
  ): void {
    for (const span of spans) {
      diag.info('span', this._exportInfo(span));
    }
    if (done) {
      return done({ code: ExportResultCode.SUCCESS });
    }
  }
}

export interface LoggedSpan {
  traceId: string;
  parentId: string | undefined;
  name: string;
  id: string;
  kind: SpanKind;
  timestamp: number;
  duration: number;
  attributes: SpanAttributes;
  status: SpanStatus;
  events: TimedEvent[];
}

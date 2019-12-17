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

import { TraceFlags } from '@opentelemetry/types';
import { unrefTimer } from '@opentelemetry/core';
import { SpanProcessor } from '../SpanProcessor';
import { SpanExporter } from './SpanExporter';
import { Span } from '../Span';
import { ReadableSpan } from './ReadableSpan';
import { BufferConfig } from '../types';

const DEFAULT_BUFFER_SIZE = 100;
const DEFAULT_BUFFER_TIMEOUT_MS = 20_000;

/**
 * Implementation of the {@link SpanProcessor} that batches spans exported by
 * the SDK then pushes them to the exporter pipeline.
 */
export class BatchSpanProcessor implements SpanProcessor {
  private readonly _bufferSize: number;
  private readonly _bufferTimeout: number;
  private _finishedSpans: ReadableSpan[] = [];
  private _lastSpanFlush = Date.now();
  private _timer: NodeJS.Timeout;

  constructor(private readonly _exporter: SpanExporter, config?: BufferConfig) {
    this._bufferSize =
      config && config.bufferSize ? config.bufferSize : DEFAULT_BUFFER_SIZE;
    this._bufferTimeout =
      config && config.bufferTimeout
        ? config.bufferTimeout
        : DEFAULT_BUFFER_TIMEOUT_MS;

    this._timer = setInterval(() => {
      if (this._shouldFlush()) {
        this._flush();
      }
    }, this._bufferTimeout);
    unrefTimer(this._timer);
  }

  // does nothing.
  onStart(span: Span): void {}

  onEnd(span: Span): void {
    if (span.context().traceFlags !== TraceFlags.SAMPLED) return;
    this._addToBuffer(span.toReadableSpan());
  }

  shutdown(): void {
    clearInterval(this._timer);
    this._exporter.shutdown();
  }

  /** Add a span in the buffer. */
  private _addToBuffer(span: ReadableSpan) {
    this._finishedSpans.push(span);
    if (this._finishedSpans.length > this._bufferSize) {
      this._flush();
    }
  }

  private _shouldFlush(): boolean {
    return (
      this._finishedSpans.length >= 0 &&
      Date.now() - this._lastSpanFlush >= this._bufferTimeout
    );
  }

  /** Send the span data list to exporter */
  private _flush() {
    this._exporter.export(this._finishedSpans, () => {});
    this._finishedSpans = [];
    this._lastSpanFlush = Date.now();
  }
}

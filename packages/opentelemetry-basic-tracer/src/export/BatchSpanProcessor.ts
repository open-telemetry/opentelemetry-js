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

import { TraceOptions } from '@opentelemetry/types';
import { unrefTimer } from '@opentelemetry/core';
import { SpanProcessor } from '../SpanProcessor';
import { SpanExporter } from './SpanExporter';
import { Span } from '../Span';
import { ReadableSpan } from './ReadableSpan';
import { BufferConfig } from '../types';

const DEFAULT_BUFFER_SIZE_MS = 100;
const DEFAULT_BUFFER_TIMEOUT_MS = 20000;

/**
 * Implementation of the {@link SpanProcessor} that batches spans exported by
 * the SDK then pushes them to the exporter pipeline.
 */
export class BatchSpanProcessor implements SpanProcessor {
  private readonly _bufferSize: number;
  private readonly _bufferTimeout: number;
  private _finishedSpans: ReadableSpan[] = [];
  private _resetTimeout = false;
  private _bufferTimeoutInProgress = false;

  constructor(private readonly _exporter: SpanExporter, config?: BufferConfig) {
    this._bufferSize =
      config && config.bufferSize ? config.bufferSize : DEFAULT_BUFFER_SIZE_MS;
    this._bufferTimeout =
      config && config.bufferTimeout
        ? config.bufferTimeout
        : DEFAULT_BUFFER_TIMEOUT_MS;
  }

  // does nothing.
  onStart(span: Span): void {}

  onEnd(span: Span): void {
    if (span.context().traceOptions !== TraceOptions.SAMPLED) return;
    this._addToBuffer(span.toReadableSpan());
  }

  shutdown(): void {
    this._exporter.shutdown();
  }

  /** Add a span in the buffer. */
  private _addToBuffer(span: ReadableSpan) {
    this._finishedSpans.push(span);
    if (this._finishedSpans.length > this._bufferSize) {
      this._flush();
    }

    if (this._bufferTimeoutInProgress) {
      this._resetBufferTimeout();
    } else {
      this._setBufferTimeout();
    }
  }

  /** Reset the buffer timeout */
  private _resetBufferTimeout() {
    this._resetTimeout = true;
  }

  /** Start the buffer timeout, when finished calls flush method */
  private _setBufferTimeout() {
    this._bufferTimeoutInProgress = true;

    const timer = setTimeout(() => {
      if (this._finishedSpans.length === 0) return;

      if (this._resetTimeout) {
        this._resetTimeout = false;
        this._setBufferTimeout();
      } else {
        this._bufferTimeoutInProgress = false;
        this._flush();
      }
    }, this._bufferTimeout);
    // Don't let this timer be the only thing keeping the process alive
    unrefTimer(timer);
  }

  /** Send the span data list to exporter */
  private _flush() {
    this._exporter.export(this._finishedSpans, () => {});
    this._finishedSpans = [];
  }
}

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

import { Logger, TraceOptions } from '@opentelemetry/types';
import { SpanProcessor } from './SpanProcessor';
import { SpanExporter } from './SpanExporter';
import { Span } from '../Span';
import { ReadableSpan } from './ReadableSpan';
import { NoopLogger } from '@opentelemetry/core';
import { BufferConfig } from '../types';
import { unrefTimer } from '../platform';

const DEFAULT_BUFFER_SIZE = 100;
const DEFAULT_BUFFER_TIMEOUT = 20000;

/**
 * Implementation of the {@link SpanProcessor} that batches spans exported by
 * the SDK then pushes them to the exporter pipeline.
 */
export class BatchSampledSpanProcessor implements SpanProcessor {
  private readonly _logger: Logger;
  private readonly _bufferSize: number;
  private readonly _bufferTimeout: number;
  private _resetTimeout = false;
  private _bufferTimeoutInProgress = false;
  private _spansDataList: ReadableSpan[] = [];

  constructor(
    private readonly exporters: SpanExporter[],
    config: BufferConfig
  ) {
    this._logger = config.logger || new NoopLogger();
    this._bufferSize = isNaN(Number(config.bufferSize))
      ? DEFAULT_BUFFER_SIZE
      : Number(config.bufferSize);
    this._bufferTimeout = isNaN(Number(config.bufferTimeout))
      ? DEFAULT_BUFFER_TIMEOUT
      : Number(config.bufferTimeout);
  }

  // does nothing.
  onStart(span: Span): void {}

  onEnd(span: Span): void {
    if (span.context().traceOptions !== TraceOptions.SAMPLED) return;
    this._addToBuffer(span.toReadableSpan());
  }

  /** Add a span in the buffer. */
  private _addToBuffer(span: ReadableSpan) {
    this._spansDataList.push(span);
    this._logger.debug('BatchSampledSpanProcessor: added new span');
    if (this._spansDataList.length > this._bufferSize) {
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
    this._logger.debug('BatchSampledSpanProcessor: reset timeout');
    this._resetTimeout = true;
  }

  /** Start the buffer timeout, when finished calls flush method */
  private _setBufferTimeout() {
    this._logger.debug('BatchSampledSpanProcessor: set timeout');
    this._bufferTimeoutInProgress = true;

    const timer = setTimeout(() => {
      if (this._spansDataList.length === 0) return;

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
    for (const exporter of this.exporters) {
      exporter.export(this._spansDataList, () => {});
    }
    this._spansDataList = [];
  }
}

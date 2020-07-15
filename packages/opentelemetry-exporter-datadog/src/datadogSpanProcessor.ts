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

import { unrefTimer, NoopLogger } from '@opentelemetry/core';
import {
  SpanProcessor,
  SpanExporter,
  ReadableSpan,
} from '@opentelemetry/tracing';
import { Logger } from '@opentelemetry/api';
import { id } from './types';

// const DEFAULT_BUFFER_SIZE = 100;
const DEFAULT_BUFFER_TIMEOUT_MS = 3_000;
const DEFAULT_MAX_QUEUE_SIZE = 2048;
const DEFAULT_MAX_TRACE_SIZE = 1024;

/**
 * An implementation of the {@link SpanProcessor} that converts the {@link Span}
 * to {@link ReadableSpan} and passes it to the configured exporter.
 *
 * Only spans that are sampled are converted.
 */
export class DatadogSpanProcessor implements SpanProcessor {
  private readonly _bufferTimeout: number;
  private readonly _maxQueueSize: number;
  private readonly _maxTraceSize: number;
  private _isShutdown = false;
  // private _exporter: SpanExporter;
  private _timer: NodeJS.Timeout | undefined;
  private _traces = new Map();
  private _traces_spans_started = new Map();
  private _traces_spans_finished = new Map();
  private _check_traces_queue: Set<string> = new Set();
  public readonly logger: Logger;

  constructor(private readonly _exporter: SpanExporter, config?: any) {
    this.logger = (config && config.logger) || new NoopLogger();
    this._bufferTimeout =
      config && typeof config.bufferTimeout === 'number'
        ? config.bufferTimeout
        : DEFAULT_BUFFER_TIMEOUT_MS;

    this._maxQueueSize =
      config && typeof config.maxQueueSize === 'number'
        ? config.maxQueueSize
        : DEFAULT_MAX_QUEUE_SIZE;
    this._maxTraceSize =
      config && typeof config.maxTraceSize === 'number'
        ? config.maxTraceSize
        : DEFAULT_MAX_TRACE_SIZE;
  }

  forceFlush(): void {
    if (this._isShutdown) {
      return;
    }
    this._flush();
  }

  shutdown(): void {
    if (this._isShutdown) {
      return;
    }
    this.forceFlush();
    this._isShutdown = true;
    this._exporter.shutdown();
  }

  // does nothing.
  onStart(span: ReadableSpan): void {
    if (this._isShutdown) {
      return;
    }

    if (this._allSpansCount(this._traces_spans_started) >= this._maxQueueSize) {
      this.logger.debug('Max Queue Size reached, dropping span');
      return;
    }

    const traceId = span.spanContext['traceId'];

    if (!this._traces.has(traceId)) {
      this._traces.set(traceId, []);
      // this._traces.get(traceId).set(SPANS_KEY, [])
      this._traces_spans_started.set(traceId, 0);
      this._traces_spans_finished.set(traceId, 0);
    }

    const trace = this._traces.get(traceId);
    const traceSpansStarted = this._traces_spans_started.get(traceId);

    if (traceSpansStarted >= this._maxTraceSize) {
      this.logger.debug('Max Trace Size reached, dropping span');
      return;
    }

    trace.push(span);
    this._traces_spans_started.set(traceId, traceSpansStarted + 1);
  }

  onEnd(span: ReadableSpan): void {
    if (this._isShutdown) {
      return;
    }

    const traceId = span.spanContext['traceId'];

    if (!this._traces.has(traceId)) {
      return;
    }

    const traceSpansFinished = this._traces_spans_finished.get(traceId);

    this._traces_spans_finished.set(traceId, traceSpansFinished + 1);

    if (this._isExportable(traceId)) {
      this._check_traces_queue.add(traceId);
      this._maybeStartTimer();
    }
  }

  getTraceContext(span: ReadableSpan): any[] {
    return [
      id(span.spanContext['traceId']),
      id(span.spanContext['spanId']),
      span.parentSpanId ? id(span.parentSpanId) : null,
    ];
  }

  /** Send the span data list to exporter */
  private _flush() {
    this._clearTimer();
    if (this._check_traces_queue.size === 0) return;

    this._check_traces_queue.forEach(traceId => {
      // check again in case spans have been added
      if (this._isExportable(traceId)) {
        const spans = this._traces.get(traceId);
        this._traces.delete(traceId);
        this._traces_spans_started.delete(traceId);
        this._traces_spans_finished.delete(traceId);
        this._check_traces_queue.delete(traceId);
        this._exporter.export(spans, () => {});
      }
    });
  }

  private _maybeStartTimer() {
    if (this._timer !== undefined) return;

    this._timer = setTimeout(() => {
      this._flush();
    }, this._bufferTimeout);
    unrefTimer(this._timer);
  }

  private _clearTimer() {
    if (this._timer !== undefined) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }

  private _allSpansCount(traces: Map<string, number>): number {
    // sum all started spans in all traces
    return [...traces.values()].reduce((a, b) => a + b, 0);
  }

  private _isExportable(traceId: string) {
    const trace = this._traces.get(traceId);

    if (
      !trace ||
      !this._traces_spans_started.has(traceId) ||
      !this._traces_spans_finished.has(traceId)
    ) {
      return;
    }

    return (
      this._traces_spans_started.get(traceId) -
        this._traces_spans_finished.get(traceId) <=
      0
    );
  }
}

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
import { id, DatadogBufferConfig } from './types';

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
  private _tracesSpansStarted = new Map();
  private _tracesSpansFinished = new Map();
  private _checkTracesQueue: Set<string> = new Set();
  public readonly logger: Logger;

  constructor(
    private readonly _exporter: SpanExporter,
    config?: DatadogBufferConfig
  ) {
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

  // adds span to queue.
  onStart(span: ReadableSpan): void {
    if (this._isShutdown) {
      return;
    }

    if (this._allSpansCount(this._tracesSpansStarted) >= this._maxQueueSize) {
      // instead of just dropping all new spans, dd-trace-rb drops a random trace
      // https://github.com/DataDog/dd-trace-rb/blob/c6fbf2410a60495f1b2d8912bf7ea7dc63422141/lib/ddtrace/buffer.rb#L34-L36
      // It allows for a more fair usage of the queue when under stress load,
      // and will create proportional representation of code paths being instrumented at stress time.
      const traceToDrop = this._fetchUnfinishedTrace(
        this._traces,
        this._checkTracesQueue
      );

      if (traceToDrop === undefined) {
        this.logger.debug('Max Queue Size reached, dropping span');
        return;
      }
      this.logger.debug(
        `Max Queue Size reached, dropping trace ${traceToDrop}`
      );
      this._traces.delete(traceToDrop);
      if (this._tracesSpansStarted.has(traceToDrop))
        this._tracesSpansStarted.delete(traceToDrop);
      if (this._tracesSpansFinished.has(traceToDrop))
        this._tracesSpansFinished.delete(traceToDrop);
    }

    const traceId = span.spanContext.traceId;

    if (!this._traces.has(traceId)) {
      this._traces.set(traceId, []);
      // this._traces.get(traceId).set(SPANS_KEY, [])
      this._tracesSpansStarted.set(traceId, 0);
      this._tracesSpansFinished.set(traceId, 0);
    }

    const trace = this._traces.get(traceId);
    const traceSpansStarted = this._tracesSpansStarted.get(traceId);

    if (traceSpansStarted >= this._maxTraceSize) {
      this.logger.debug('Max Trace Size reached, dropping span');
      return;
    }

    trace.push(span);
    this._tracesSpansStarted.set(traceId, traceSpansStarted + 1);
  }

  onEnd(span: ReadableSpan): void {
    if (this._isShutdown) {
      return;
    }

    const traceId = span.spanContext.traceId;

    if (!this._traces.has(traceId)) {
      return;
    }

    const traceSpansFinished = this._tracesSpansFinished.get(traceId);

    this._tracesSpansFinished.set(traceId, traceSpansFinished + 1);

    if (this._isExportable(traceId)) {
      this._checkTracesQueue.add(traceId);
      this._maybeStartTimer();
    }
  }

  getTraceContext(span: ReadableSpan): (string | undefined)[] {
    return [
      id(span.spanContext.traceId),
      id(span.spanContext.spanId),
      span.parentSpanId ? id(span.parentSpanId) : undefined,
    ];
  }

  /** Send the span data list to exporter */
  private _flush() {
    this._clearTimer();
    if (this._checkTracesQueue.size === 0) return;

    this._checkTracesQueue.forEach(traceId => {
      // check again in case spans have been added
      if (this._isExportable(traceId)) {
        const spans = this._traces.get(traceId);
        this._traces.delete(traceId);
        this._tracesSpansStarted.delete(traceId);
        this._tracesSpansFinished.delete(traceId);
        this._checkTracesQueue.delete(traceId);
        this._exporter.export(spans, () => {});
      } else {
        this.logger.error(`Trace  ${traceId} incomplete, not exported`);
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
      !this._tracesSpansStarted.has(traceId) ||
      !this._tracesSpansFinished.has(traceId)
    ) {
      return;
    }

    return (
      this._tracesSpansStarted.get(traceId) -
        this._tracesSpansFinished.get(traceId) <=
      0
    );
  }

  private _fetchUnfinishedTrace(
    traces: Map<string, Array<string>>,
    finshedTraceQueue: Set<string>
  ): string | undefined {
    // don't fetch potentially finished trace awaiting export
    const unfinishedTraces = Array.from(traces.keys()).filter(
      x => !finshedTraceQueue.has(x)
    );
    // grab random unfinished trace id
    return unfinishedTraces[
      Math.floor(Math.random() * unfinishedTraces.length)
    ];
  }
}

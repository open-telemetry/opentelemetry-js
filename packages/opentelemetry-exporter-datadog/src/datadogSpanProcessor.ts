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

import { unrefTimer } from '@opentelemetry/core';
import { SpanProcessor, SpanExporter, ReadableSpan } from '@opentelemetry/tracing';
// import * as datadog from 'dd-trace';
import { id } from './types';

// const DEFAULT_BUFFER_SIZE = 100;
const DEFAULT_BUFFER_TIMEOUT_MS = 3_000;
const DEFAULT_MAX_QUEUE_SIZE = 2048
const DEFAULT_MAX_TRACE_SIZE = 1024

const STARTED_KEY = 'started'
const FINISHED_KEY = 'finished'
const SPANS_KEY = 'spans'

// const DEFAULT_TRACE_MAP = [
//   [STARTED_KEY, 0],
//   [FINISHED_KEY, 0],
//   [SPANS_KEY, []]
// ]

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
  private _check_traces_queue: Set<string> = new Set();

  constructor(private readonly _exporter: SpanExporter, config?: any) {
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

    // this._exporter = 
    // this._tracer = datadog.tracer.init({ "plugins": false })
    console.log(this._maxQueueSize, this._maxTraceSize);
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
    console.log('stating a span', span)
    if(1 > 0) {
      return;
    }

    const traceId = span.spanContext['traceId'];

    if (!this._traces.has(traceId)) {
       this._traces.set(traceId, new Map());
       this._traces.get(traceId).set(SPANS_KEY, [])
       this._traces.get(traceId).set(STARTED_KEY, 0)
       this._traces.get(traceId).set(FINISHED_KEY, 0)
    }
      
    const traceMap = this._traces.get(traceId);
    const tracesStarted = traceMap.get(STARTED_KEY);
    
    traceMap.get(SPANS_KEY).push(span);
    traceMap.set(STARTED_KEY, tracesStarted + 1);
  }

  onEnd(span: ReadableSpan): void {
    console.log('endig thhat span')
    if (this._isShutdown) {
      return;
    }

    const traceId = span.spanContext['traceId'];

    if (!this._traces.has(traceId)) {
      return;
    }

    const traceMap = this._traces.get(traceId);
    const tracesFinished = traceMap.get(FINISHED_KEY);

    traceMap.set(FINISHED_KEY, tracesFinished + 1);

    if(this._isExportable(traceId)) {
      this._check_traces_queue.add(traceId)
      this._maybeStartTimer();
    }
  }

  getTraceContext(span: ReadableSpan): any[] {
    return [
      id(span.spanContext['traceId']),
      id(span.spanContext['spanId']),
      span.parentSpanId ? id(span.parentSpanId) : null
    ]
  }

  // encode(span: ReadableSpan): void {
  //   // convert to datadog span
  //   const [ddTraceId, ddSpanId, ddParentId] = this.getTraceContext(span)
  //   // const datadogSpanContext  = new SpanOptions 
  //   // tracer.startSpan
  //   console.log('this ran', ddTraceId, ddSpanId, ddParentId)
  //   const ddSpanContext = new SpanContext({
  //     traceId: ddTraceId,
  //     spanId: ddSpanId,
  //     parentId: ddParentId,
  //   })


  //   // const output = this._tracer.startSpan(span.name, { childOf: ddSpanContext})

  //   console.log('output: ', output.context()._trace)
  //   // console.log('i am: ', this._tracer.scope()["_spans"])    
  // }

  /** Send the span data list to exporter */
  private _flush() {
    console.log('ioi flush')
    this._clearTimer();
    if (this._check_traces_queue.size === 0) return;

    this._check_traces_queue.forEach( (traceId) => {
      // check again in case spans have been added
      if(this._isExportable(traceId)) {
        console.log('tryng to export')
        const spans = this._traces.get(traceId).get(SPANS_KEY)
        this._traces.delete(traceId)
        this._check_traces_queue.delete(traceId)        
        this._exporter.export(spans, () => {});
      }
    })
  }

  private _maybeStartTimer() {
    if (this._timer !== undefined) return;

    this._timer = setTimeout(() => {
      console.log('rrun')
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

  private _isExportable(traceId: string) {
    const traceMap = this._traces.get(traceId)

    if (!traceMap) {
      return;
    }

    return traceMap.get(STARTED_KEY) - traceMap.get(FINISHED_KEY) <= 0
  }
}

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

import * as types from '@opentelemetry/types';
import { performance } from 'perf_hooks';
import { ReadableSpan } from './export/ReadableSpan';

/**
 * This class represents a span.
 */
export class Span implements types.Span, ReadableSpan {
  private readonly _tracer: types.Tracer;
  // Below properties are included to implement ReadableSpan for export
  // purposes but are not intended to be written-to directly.
  readonly spanContext: types.SpanContext;
  readonly kind: types.SpanKind;
  readonly parentSpanId?: string;
  readonly attributes: types.Attributes = {};
  readonly links: types.Link[] = [];
  readonly events: types.TimedEvent[] = [];
  readonly startTime: number;
  name: string;
  status: types.Status = {
    code: types.CanonicalCode.OK,
  };
  endTime = 0;
  private _ended = false;
  private readonly _logger: types.Logger;

  /** Constructs a new Span instance. */
  constructor(
    parentTracer: types.Tracer,
    logger: types.Logger,
    spanName: string,
    spanContext: types.SpanContext,
    kind: types.SpanKind,
    parentSpanId?: string,
    startTime?: number
  ) {
    this._tracer = parentTracer;
    this.name = spanName;
    this.spanContext = spanContext;
    this.parentSpanId = parentSpanId;
    this.kind = kind;
    this.startTime = startTime || performance.now();
    this._logger = logger;
  }

  tracer(): types.Tracer {
    return this._tracer;
  }

  context(): types.SpanContext {
    return this.spanContext;
  }

  setAttribute(key: string, value: unknown): this {
    if (this._isSpanEnded()) return this;
    this.attributes[key] = value;
    return this;
  }

  setAttributes(attributes: types.Attributes): this {
    Object.keys(attributes).forEach(key => {
      this.setAttribute(key, attributes[key]);
    });
    return this;
  }

  addEvent(name: string, attributes?: types.Attributes): this {
    if (this._isSpanEnded()) return this;
    this.events.push({ name, attributes, time: performance.now() });
    return this;
  }

  addLink(spanContext: types.SpanContext, attributes?: types.Attributes): this {
    if (this._isSpanEnded()) return this;
    this.links.push({ spanContext, attributes });
    return this;
  }

  setStatus(status: types.Status): this {
    if (this._isSpanEnded()) return this;
    this.status = status;
    return this;
  }

  updateName(name: string): this {
    if (this._isSpanEnded()) return this;
    this.name = name;
    return this;
  }

  end(endTime?: number): void {
    if (this._isSpanEnded()) {
      this._logger.error('You can only call end() on a span once.');
      return;
    }
    this._ended = true;
    this.endTime = endTime || performance.now();
    // @todo: record or export the span
  }

  isRecordingEvents(): boolean {
    return true;
  }

  toReadableSpan(): ReadableSpan {
    return this;
  }

  private _isSpanEnded(): boolean {
    if (this._ended) {
      this._logger.warn(
        'Can not execute the operation on ended Span {traceId: %s, spanId: %s}',
        this.spanContext.traceId,
        this.spanContext.spanId
      );
    }
    return this._ended;
  }
}

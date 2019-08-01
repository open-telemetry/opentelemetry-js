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
import {
  randomSpanId,
  randomTraceId,
  INVALID_SPAN_CONTEXT,
  isValid,
} from '@opentelemetry/core';
import { performance } from 'perf_hooks';
import { TraceOptions } from '@opentelemetry/types';

/**
 * This class represents a span.
 */
export class Span implements types.Span {
  private readonly _spanContext: types.SpanContext = INVALID_SPAN_CONTEXT;
  private readonly _tracer: types.Tracer;
  private readonly _parentId?: string;
  private readonly _kind: types.SpanKind;
  private readonly _attributes: types.Attributes = {};
  private readonly _links: types.Link[] = [];
  private readonly _events: types.Event[] = [];
  private _status: types.Status = {
    code: types.CanonicalCode.OK,
  };
  private _name: string;
  private _ended = false;
  private _startTime: number;
  private _endTime = 0;

  /** Constructs a new Span instance. */
  constructor(
    parentTracer: types.Tracer,
    spanName: string,
    options: types.SpanOptions
  ) {
    this._tracer = parentTracer;
    this._name = spanName;
    this._spanContext.spanId = randomSpanId();
    this._spanContext.traceOptions = TraceOptions.SAMPLED;
    const parentSpanContext = this._getParentSpanContext(options.parent);
    if (parentSpanContext && isValid(parentSpanContext)) {
      // New child span.
      this._spanContext.traceId = parentSpanContext.traceId;
      this._spanContext.traceState = parentSpanContext.traceState;
      this._parentId = parentSpanContext.spanId;
    } else {
      // This is a root span so no remote or local parent.
      this._spanContext.traceId = randomTraceId();
    }
    this._kind = options.kind || types.SpanKind.INTERNAL;
    this._startTime = options.startTime || performance.now();
  }

  tracer(): types.Tracer {
    return this._tracer;
  }

  context(): types.SpanContext {
    return this._spanContext;
  }

  setAttribute(key: string, value: unknown): this {
    if (this._isSpanEnded()) return this;
    this._attributes[key] = value;
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
    this._events.push({ name, attributes });
    return this;
  }

  addLink(spanContext: types.SpanContext, attributes?: types.Attributes): this {
    if (this._isSpanEnded()) return this;
    this._links.push({ spanContext, attributes });
    return this;
  }

  setStatus(status: types.Status): this {
    if (this._isSpanEnded()) return this;
    this._status = status;
    return this;
  }

  updateName(name: string): this {
    if (this._isSpanEnded()) return this;
    this._name = name;
    return this;
  }

  end(endTime?: number): void {
    if (this._isSpanEnded()) return;
    this._ended = true;
    this._endTime = endTime || performance.now();
    // @todo: record or export the span
  }

  isRecordingEvents(): boolean {
    return true;
  }

  toString() {
    const json = JSON.stringify({
      traceId: this._spanContext.traceId,
      spanId: this._spanContext.spanId,
      parentId: this._parentId,
      name: this._name,
      kind: this._kind,
      status: this._status,
      startTime: this._startTime,
      endTime: this._endTime,
    });
    return `Span${json}`;
  }

  private _getParentSpanContext(
    parent: types.Span | types.SpanContext | undefined
  ): types.SpanContext | undefined {
    if (!parent) return undefined;

    // parent is a SpanContext
    if ((parent as types.SpanContext).traceId) {
      return parent as types.SpanContext;
    }
    return (parent as Span).context();
  }

  private _isSpanEnded(): boolean {
    if (this._ended) {
      // @todo: log a warning
    }
    return this._ended;
  }
}

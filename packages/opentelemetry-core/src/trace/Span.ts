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
import { randomSpanId, randomTraceId } from '../platform';

/**
 * This class represents a span.
 */
export class Span implements types.Span {
  private _traceId: string;
  private _spanId: string;
  private _parentId?: string;
  private _traceState?: types.TraceState;
  private _name: string;
  private _kind: types.SpanKind;
  private _attributes: types.Attributes = {};
  private _links: types.Link[] = [];
  private _events: types.Event[] = [];
  private _status: types.Status = {
    code: types.CanonicalCode.OK,
  };
  private _ended = false;
  private _startTime: number;
  private _duration = 0;

  /** Constructs a new Span instance. */
  constructor(
    readonly _parentTracer: types.Tracer,
    readonly _spanName: string,
    readonly _options: types.SpanOptions
  ) {
    this._name = _spanName;
    this._kind = _options.kind || types.SpanKind.INTERNAL;
    this._spanId = randomSpanId();
    if (_options.parent) {
      const spanContext = this._getSpanContext(_options.parent);
      this._traceId = spanContext.traceId;
      this._parentId = spanContext.spanId;
      this._traceState = spanContext.traceState;
    } else {
      this._traceId = randomTraceId();
    }
    this._startTime = _options.startTime || performance.now();
  }

  tracer(): types.Tracer {
    return this._parentTracer;
  }

  context(): types.SpanContext {
    const spanContext: types.SpanContext = {
      traceId: this._traceId,
      spanId: this._spanId,
      traceOptions: types.TraceOptions.SAMPLED,
    };
    if (this._traceState) {
      spanContext.traceState = this._traceState;
    }
    return spanContext;
  }

  setAttribute(key: string, value: unknown): this {
    this.setAttributes({ key: value });
    return this;
  }

  setAttributes(attributes: types.Attributes): this {
    if (this._ended) return this;
    Object.keys(attributes).forEach(key => {
      this._attributes[key] = attributes[key];
    });
    return this;
  }

  addEvent(name: string, attributes?: types.Attributes): this {
    if (this._ended) return this;
    this._events.push({ name, attributes });
    return this;
  }

  addLink(spanContext: types.SpanContext, attributes?: types.Attributes): this {
    if (this._ended) return this;
    this._links.push({ spanContext, attributes });
    return this;
  }

  setStatus(status: types.Status): this {
    if (this._ended) return this;
    this._status = status;
    return this;
  }

  updateName(name: string): this {
    if (this._ended) return this;
    this._name = name;
    return this;
  }

  end(endTime?: number): void {
    if (this._ended) return;
    this._ended = true;
    const finishTime = endTime || performance.now();
    this._duration = finishTime - this._startTime;
    // @todo: record or export the span
  }

  isRecordingEvents(): boolean {
    return this._options.isRecordingEvents || false;
  }

  toString() {
    const json = JSON.stringify({
      traceId: this._traceId,
      spanId: this._spanId,
      parentId: this._parentId,
      name: this._name,
      kind: this._kind,
      status: this._status,
      duration: this._duration,
    });
    return `Span${json}`;
  }

  private _getSpanContext(
    parent: types.Span | types.SpanContext
  ): types.SpanContext {
    // parent is a SpanContext
    if (typeof (parent as types.SpanContext).traceId) {
      return parent as types.SpanContext;
    }
    return (parent as Span).context();
  }
}

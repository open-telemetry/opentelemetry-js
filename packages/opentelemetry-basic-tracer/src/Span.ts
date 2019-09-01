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
import { BasicTracer } from './BasicTracer';

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
  readonly startTime: types.HrTime;
  name: string;
  status: types.Status = {
    code: types.CanonicalCode.OK,
  };
  endTime:types.HrTime = [0, 0];
  private _ended = false;
  private _duration: types.HrTime;
  private readonly _logger: types.Logger;

  /** Constructs a new Span instance. */
  constructor(
    parentTracer: BasicTracer,
    spanName: string,
    spanContext: types.SpanContext,
    kind: types.SpanKind,
    parentSpanId?: string,
    startTime?: types.TimeInput
  ) {
    this._tracer = parentTracer;
    this.name = spanName;
    this.spanContext = spanContext;
    this.parentSpanId = parentSpanId;
    this.kind = kind;
    this.startTime = Span._toHrTime(startTime);
    this._logger = parentTracer.logger;
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
    this.events.push({
      name,
      attributes,
      time: Span._hrtime(),
    });
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

  end(endTime?: types.TimeInput): void {
    if (this._isSpanEnded()) {
      this._logger.error('You can only call end() on a span once.');
      return;
    }
    this._ended = true;
    this.endTime = Span._toHrTime(endTime);
    // @todo: record or export the span
  }

  isRecordingEvents(): boolean {
    return true;
  }

  toReadableSpan(): ReadableSpan {
    return this;
  }

  get duration(): types.HrTime {
    if (this._duration !== undefined) {
      return this._duration;
    }

    let millis = this.startTime[0] - this.endTime[0];
    let nanos = this.startTime[1] - this.endTime[1];

    // overflow
    if (nanos < 0) {
      millis -= 1;
      // negate
      nanos += 1e9;
    }

    this._duration = [millis, nanos];
    return this._duration;
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

  // Converts a number to HrTime
  private static _numberToHrtime(time: number): types.HrTime {
    const millis = Math.trunc(time)
    const nanos = Number((time - millis).toFixed(2)) * 1e+10;
    return [millis, nanos];
  }

  // Converts a TimeInput to an HrTime, defaults to _hrtime().
  private static _toHrTime(time?: types.TimeInput): types.HrTime {
    if (Array.isArray(time)) {
      return time;
    } else if (typeof time === 'number') {
      // Must be a performance.now() if it's smaller than process start time.
      if (time < performance.timeOrigin) {
        return Span._hrtime(time);
      }
      // epoch milliseconds or performance.timeOrigin
      else {
        return Span._numberToHrtime(time);
      }
    } else if (time instanceof Date) {
      return [time.getTime(), 0];
    } else {
      return Span._hrtime();
    }
  }

  // Returns an hrtime calculated via performance component.
  private static _hrtime(performanceNow?: number): types.HrTime {
    const timeOrigin = Span._numberToHrtime(performance.timeOrigin);
    const now = Span._numberToHrtime(performanceNow || performance.now());

    let millis = timeOrigin[0] + now[0];
    let nanos = timeOrigin[1] + now[1];

    // Nanoseconds
    if (nanos > 1e+10) {
      nanos -= 1e+10;
      millis += 1;
    }

    return [millis, nanos];
  }
}

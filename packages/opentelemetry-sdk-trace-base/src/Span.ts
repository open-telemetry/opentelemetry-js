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

import {
  Context,
  diag,
  Exception,
  HrTime,
  Link,
  Span as APISpan,
  SpanAttributes,
  SpanAttributeValue,
  SpanContext,
  SpanKind,
  SpanStatus,
  SpanStatusCode,
  TimeInput,
} from '@opentelemetry/api';
import {
  addHrTimes,
  millisToHrTime,
  getTimeOrigin,
  hrTime,
  hrTimeDuration,
  InstrumentationLibrary,
  isAttributeValue,
  isTimeInput,
  isTimeInputHrTime,
  otperformance,
  sanitizeAttributes,
} from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { ExceptionEventName } from './enums';
import { ReadableSpan } from './export/ReadableSpan';
import { SpanProcessor } from './SpanProcessor';
import { TimedEvent } from './TimedEvent';
import { Tracer } from './Tracer';
import { SpanLimits } from './types';

/**
 * This class represents a span.
 */
export class Span implements APISpan, ReadableSpan {
  // Below properties are included to implement ReadableSpan for export
  // purposes but are not intended to be written-to directly.
  private readonly _spanContext: SpanContext;
  readonly kind: SpanKind;
  readonly parentSpanId?: string;
  readonly attributes: SpanAttributes = {};
  readonly links: Link[] = [];
  readonly events: TimedEvent[] = [];
  readonly startTime: HrTime;
  readonly resource: Resource;
  readonly instrumentationLibrary: InstrumentationLibrary;
  name: string;
  status: SpanStatus = {
    code: SpanStatusCode.UNSET,
  };
  endTime: HrTime = [0, 0];
  private _ended = false;
  private _duration: HrTime = [-1, -1];
  private readonly _spanProcessor: SpanProcessor;
  private readonly _spanLimits: SpanLimits;
  private readonly _attributeValueLengthLimit: number;

  private readonly _performanceStartTime: number;
  private readonly _performanceOffset: number;
  private readonly _startTimeProvided: boolean;

  /**
   * Constructs a new Span instance.
   *
   * @deprecated calling Span constructor directly is not supported. Please use tracer.startSpan.
   * */
  constructor(
    parentTracer: Tracer,
    context: Context,
    spanName: string,
    spanContext: SpanContext,
    kind: SpanKind,
    parentSpanId?: string,
    links: Link[] = [],
    startTime?: TimeInput,
    _deprecatedClock?: unknown // keeping this argument even though it is unused to ensure backwards compatibility
  ) {
    this.name = spanName;
    this._spanContext = spanContext;
    this.parentSpanId = parentSpanId;
    this.kind = kind;
    this.links = links;

    const now = Date.now();
    this._performanceStartTime = otperformance.now();
    this._performanceOffset =
      now - (this._performanceStartTime + getTimeOrigin());
    this._startTimeProvided = startTime != null;

    this.startTime = this._getTime(startTime ?? now);

    this.resource = parentTracer.resource;
    this.instrumentationLibrary = parentTracer.instrumentationLibrary;
    this._spanLimits = parentTracer.getSpanLimits();
    this._spanProcessor = parentTracer.getActiveSpanProcessor();
    this._spanProcessor.onStart(this, context);
    this._attributeValueLengthLimit =
      this._spanLimits.attributeValueLengthLimit || 0;
  }

  spanContext(): SpanContext {
    return this._spanContext;
  }

  setAttribute(key: string, value?: SpanAttributeValue): this;
  setAttribute(key: string, value: unknown): this {
    if (value == null || this._isSpanEnded()) return this;
    if (key.length === 0) {
      diag.warn(`Invalid attribute key: ${key}`);
      return this;
    }
    if (!isAttributeValue(value)) {
      diag.warn(`Invalid attribute value set for key: ${key}`);
      return this;
    }

    if (
      Object.keys(this.attributes).length >=
        this._spanLimits.attributeCountLimit! &&
      !Object.prototype.hasOwnProperty.call(this.attributes, key)
    ) {
      return this;
    }
    this.attributes[key] = this._truncateToSize(value);
    return this;
  }

  setAttributes(attributes: SpanAttributes): this {
    for (const [k, v] of Object.entries(attributes)) {
      this.setAttribute(k, v);
    }
    return this;
  }

  /**
   *
   * @param name Span Name
   * @param [attributesOrStartTime] Span attributes or start time
   *     if type is {@type TimeInput} and 3rd param is undefined
   * @param [timeStamp] Specified time stamp for the event
   */
  addEvent(
    name: string,
    attributesOrStartTime?: SpanAttributes | TimeInput,
    timeStamp?: TimeInput
  ): this {
    if (this._isSpanEnded()) return this;
    if (this._spanLimits.eventCountLimit === 0) {
      diag.warn('No events allowed.');
      return this;
    }
    if (this.events.length >= this._spanLimits.eventCountLimit!) {
      diag.warn('Dropping extra events.');
      this.events.shift();
    }

    if (isTimeInput(attributesOrStartTime)) {
      if (!isTimeInput(timeStamp)) {
        timeStamp = attributesOrStartTime;
      }
      attributesOrStartTime = undefined;
    }

    const attributes = sanitizeAttributes(attributesOrStartTime);
    this.events.push({
      name,
      attributes,
      time: this._getTime(timeStamp),
    });
    return this;
  }

  setStatus(status: SpanStatus): this {
    if (this._isSpanEnded()) return this;
    this.status = status;
    return this;
  }

  updateName(name: string): this {
    if (this._isSpanEnded()) return this;
    this.name = name;
    return this;
  }

  end(endTime?: TimeInput): void {
    if (this._isSpanEnded()) {
      diag.error('You can only call end() on a span once.');
      return;
    }
    this._ended = true;

    this.endTime = this._getTime(endTime);
    this._duration = hrTimeDuration(this.startTime, this.endTime);

    if (this._duration[0] < 0) {
      diag.warn(
        'Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.',
        this.startTime,
        this.endTime
      );
      this.endTime = this.startTime.slice() as HrTime;
      this._duration = [0, 0];
    }

    this._spanProcessor.onEnd(this);
  }

  private _getTime(inp?: TimeInput): HrTime {
    if (typeof inp === 'number' && inp < otperformance.now()) {
      // must be a performance timestamp
      // apply correction and convert to hrtime
      return hrTime(inp + this._performanceOffset);
    }

    if (typeof inp === 'number') {
      return millisToHrTime(inp);
    }

    if (inp instanceof Date) {
      return millisToHrTime(inp.getTime());
    }

    if (isTimeInputHrTime(inp)) {
      return inp;
    }

    if (this._startTimeProvided) {
      // if user provided a time for the start manually
      // we can't use duration to calculate event/end times
      return millisToHrTime(Date.now());
    }

    const msDuration = otperformance.now() - this._performanceStartTime;
    return addHrTimes(this.startTime, millisToHrTime(msDuration));
  }

  isRecording(): boolean {
    return this._ended === false;
  }

  recordException(exception: Exception, time?: TimeInput): void {
    const attributes: SpanAttributes = {};
    if (typeof exception === 'string') {
      attributes[SemanticAttributes.EXCEPTION_MESSAGE] = exception;
    } else if (exception) {
      if (exception.code) {
        attributes[SemanticAttributes.EXCEPTION_TYPE] =
          exception.code.toString();
      } else if (exception.name) {
        attributes[SemanticAttributes.EXCEPTION_TYPE] = exception.name;
      }
      if (exception.message) {
        attributes[SemanticAttributes.EXCEPTION_MESSAGE] = exception.message;
      }
      if (exception.stack) {
        attributes[SemanticAttributes.EXCEPTION_STACKTRACE] = exception.stack;
      }
    }

    // these are minimum requirements from spec
    if (
      attributes[SemanticAttributes.EXCEPTION_TYPE] ||
      attributes[SemanticAttributes.EXCEPTION_MESSAGE]
    ) {
      this.addEvent(ExceptionEventName, attributes, time);
    } else {
      diag.warn(`Failed to record an exception ${exception}`);
    }
  }

  get duration(): HrTime {
    return this._duration;
  }

  get ended(): boolean {
    return this._ended;
  }

  private _isSpanEnded(): boolean {
    if (this._ended) {
      diag.warn(
        `Can not execute the operation on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`
      );
    }
    return this._ended;
  }

  // Utility function to truncate given value within size
  // for value type of string, will truncate to given limit
  // for type of non-string, will return same value
  private _truncateToLimitUtil(value: string, limit: number): string {
    if (value.length <= limit) {
      return value;
    }
    return value.substr(0, limit);
  }

  /**
   * If the given attribute value is of type string and has more characters than given {@code attributeValueLengthLimit} then
   * return string with trucated to {@code attributeValueLengthLimit} characters
   *
   * If the given attribute value is array of strings then
   * return new array of strings with each element truncated to {@code attributeValueLengthLimit} characters
   *
   * Otherwise return same Attribute {@code value}
   *
   * @param value Attribute value
   * @returns truncated attribute value if required, otherwise same value
   */
  private _truncateToSize(value: SpanAttributeValue): SpanAttributeValue {
    const limit = this._attributeValueLengthLimit;
    // Check limit
    if (limit <= 0) {
      // Negative values are invalid, so do not truncate
      diag.warn(`Attribute value limit must be positive, got ${limit}`);
      return value;
    }

    // String
    if (typeof value === 'string') {
      return this._truncateToLimitUtil(value, limit);
    }

    // Array of strings
    if (Array.isArray(value)) {
      return (value as []).map(val =>
        typeof val === 'string' ? this._truncateToLimitUtil(val, limit) : val
      );
    }

    // Other types, no need to apply value length limit
    return value;
  }
}

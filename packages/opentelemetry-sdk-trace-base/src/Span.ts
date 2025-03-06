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
  Span as APISpan,
  Attributes,
  AttributeValue,
  Context,
  diag,
  Exception,
  HrTime,
  Link,
  SpanContext,
  SpanKind,
  SpanStatus,
  SpanStatusCode,
  TimeInput,
} from '@opentelemetry/api';
import {
  hrTimeToNanoseconds,
  InstrumentationScope,
  isAttributeValue,
  isTimeInput,
  isTimeInputHrTime,
  millisecondsToNanoseconds,
  nanosToHrTime,
  otperformance,
  sanitizeAttributes,
} from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import {
  SEMATTRS_EXCEPTION_MESSAGE,
  SEMATTRS_EXCEPTION_STACKTRACE,
  SEMATTRS_EXCEPTION_TYPE,
} from '@opentelemetry/semantic-conventions';
import { ExceptionEventName } from './enums';
import { ReadableSpan } from './export/ReadableSpan';
import { SpanProcessor } from './SpanProcessor';
import { TimedEvent } from './TimedEvent';
import { SpanLimits } from './types';

/**
 * This type provides the properties of @link{ReadableSpan} at the same time
 * of the Span API
 */
export type Span = APISpan & ReadableSpan;

interface SpanOptions {
  resource: Resource;
  scope: InstrumentationScope;
  context: Context;
  spanContext: SpanContext;
  name: string;
  kind: SpanKind;
  parentSpanContext?: SpanContext;
  links?: Link[];
  startTime?: TimeInput;
  attributes?: Attributes;
  spanLimits: SpanLimits;
  spanProcessor: SpanProcessor;
}

/**
 * This class represents a span.
 */
export class SpanImpl implements Span {
  // Below properties are included to implement ReadableSpan for export
  // purposes but are not intended to be written-to directly.
  private readonly _spanContext: SpanContext;
  readonly kind: SpanKind;
  readonly parentSpanContext?: SpanContext;
  readonly attributes: Attributes = {};
  readonly links: Link[] = [];
  readonly events: TimedEvent[] = [];
  readonly resource: Resource;
  readonly instrumentationScope: InstrumentationScope;

  private _droppedAttributesCount = 0;
  private _droppedEventsCount: number = 0;
  private _droppedLinksCount: number = 0;

  name: string;
  status: SpanStatus = {
    code: SpanStatusCode.UNSET,
  };
  private _ended = false;
  private _startTime: bigint;
  private _endTime: bigint = -1n;

  private readonly _spanProcessor: SpanProcessor;
  private readonly _spanLimits: SpanLimits;
  private readonly _attributeValueLengthLimit: number;

  private readonly _performanceStartTime: number;
  private readonly _performanceOffsetNanos: bigint;
  private readonly _startTimeProvided: boolean;

  /**
   * Constructs a new SpanImpl instance.
   */
  constructor(opts: SpanOptions) {
    const now = Date.now();

    this._spanContext = opts.spanContext;
    this._performanceStartTime = otperformance.now();
    this._performanceOffsetNanos = millisecondsToNanoseconds(
      now - this._performanceStartTime
    );
    this._startTimeProvided = opts.startTime != null;
    this._spanLimits = opts.spanLimits;
    this._attributeValueLengthLimit =
      this._spanLimits.attributeValueLengthLimit || 0;
    this._spanProcessor = opts.spanProcessor;

    this.name = opts.name;
    this.parentSpanContext = opts.parentSpanContext;
    this.kind = opts.kind;
    this.links = opts.links || [];
    this._startTime = this._getTime(opts.startTime ?? now);
    this.resource = opts.resource;
    this.instrumentationScope = opts.scope;

    if (opts.attributes != null) {
      this.setAttributes(opts.attributes);
    }

    this._spanProcessor.onStart(this, opts.context);
  }

  get startTimeUnixNano(): bigint {
    return this._startTime;
  }

  get startTime(): HrTime {
    return nanosToHrTime(this._startTime);
  }

  get endTimeUnixNano(): bigint {
    return this._endTime;
  }

  get endTime(): HrTime {
    return nanosToHrTime(this._endTime);
  }

  spanContext(): SpanContext {
    return this._spanContext;
  }

  setAttribute(key: string, value?: AttributeValue): this;
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

    const { attributeCountLimit } = this._spanLimits;

    if (
      attributeCountLimit !== undefined &&
      Object.keys(this.attributes).length >= attributeCountLimit &&
      !Object.prototype.hasOwnProperty.call(this.attributes, key)
    ) {
      this._droppedAttributesCount++;
      return this;
    }
    this.attributes[key] = this._truncateToSize(value);
    return this;
  }

  setAttributes(attributes: Attributes): this {
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
    attributesOrStartTime?: Attributes | TimeInput,
    timeStamp?: TimeInput
  ): this {
    if (this._isSpanEnded()) return this;

    const { eventCountLimit } = this._spanLimits;

    if (eventCountLimit === 0) {
      diag.warn('No events allowed.');
      this._droppedEventsCount++;
      return this;
    }

    if (
      eventCountLimit !== undefined &&
      this.events.length >= eventCountLimit
    ) {
      if (this._droppedEventsCount === 0) {
        diag.debug('Dropping extra events.');
      }
      this.events.shift();
      this._droppedEventsCount++;
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
      timeUnixNano: this._getTime(timeStamp),
      droppedAttributesCount: 0,
    });
    return this;
  }

  addLink(link: Link): this {
    this.links.push(link);
    return this;
  }

  addLinks(links: Link[]): this {
    this.links.push(...links);
    return this;
  }

  setStatus(status: SpanStatus): this {
    if (this._isSpanEnded()) return this;
    this.status = { ...status };

    // When using try-catch, the caught "error" is of type `any`. When then assigning `any` to `status.message`,
    // TypeScript will not error. While this can happen during use of any API, it is more common on Span#setStatus()
    // as it's likely used in a catch-block. Therefore, we validate if `status.message` is actually a string, null, or
    // undefined to avoid an incorrect type causing issues downstream.
    if (this.status.message != null && typeof status.message !== 'string') {
      diag.warn(
        `Dropping invalid status.message of type '${typeof status.message}', expected 'string'`
      );
      delete this.status.message;
    }

    return this;
  }

  updateName(name: string): this {
    if (this._isSpanEnded()) return this;
    this.name = name;
    return this;
  }

  end(endTime?: TimeInput): void {
    if (this._isSpanEnded()) {
      diag.error(
        `${this.name} ${this._spanContext.traceId}-${this._spanContext.spanId} - You can only call end() on a span once.`
      );
      return;
    }
    this._ended = true;

    this._endTime = this._getTime(endTime);

    if (this._endTime < this._startTime) {
      diag.warn(
        'Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.',
        this._startTime,
        this._endTime
      );
      this._endTime = this._startTime;
    }

    if (this._droppedEventsCount > 0) {
      diag.warn(
        `Dropped ${this._droppedEventsCount} events because eventCountLimit reached`
      );
    }

    this._spanProcessor.onEnd(this);
  }

  /**
   *
   * @param inp time input from the user
   * @returns timestamp in nanoseconds from the epoch
   */
  private _getTime(inp?: TimeInput): bigint {
    if (typeof inp === 'number' && inp <= otperformance.now()) {
      // must be a performance timestamp
      // apply correction and convert to hrtime
      return millisecondsToNanoseconds(inp) + this._performanceOffsetNanos;
    }

    if (typeof inp === 'number') {
      return millisecondsToNanoseconds(inp);
    }

    if (typeof inp === 'bigint') {
      return inp;
    }

    if (inp instanceof Date) {
      return millisecondsToNanoseconds(inp.getTime());
    }

    if (isTimeInputHrTime(inp)) {
      return hrTimeToNanoseconds(inp);
    }

    if (this._startTimeProvided) {
      // if user provided a time for the start manually
      // we can't use duration to calculate event/end times
      return millisecondsToNanoseconds(Date.now());
    }

    const nanoDuration = millisecondsToNanoseconds(
      otperformance.now() - this._performanceStartTime
    );
    return this._startTime + nanoDuration;
  }

  isRecording(): boolean {
    return this._ended === false;
  }

  recordException(exception: Exception, time?: TimeInput): void {
    const attributes: Attributes = {};
    if (typeof exception === 'string') {
      attributes[SEMATTRS_EXCEPTION_MESSAGE] = exception;
    } else if (exception) {
      if (exception.code) {
        attributes[SEMATTRS_EXCEPTION_TYPE] = exception.code.toString();
      } else if (exception.name) {
        attributes[SEMATTRS_EXCEPTION_TYPE] = exception.name;
      }
      if (exception.message) {
        attributes[SEMATTRS_EXCEPTION_MESSAGE] = exception.message;
      }
      if (exception.stack) {
        attributes[SEMATTRS_EXCEPTION_STACKTRACE] = exception.stack;
      }
    }

    // these are minimum requirements from spec
    if (
      attributes[SEMATTRS_EXCEPTION_TYPE] ||
      attributes[SEMATTRS_EXCEPTION_MESSAGE]
    ) {
      this.addEvent(ExceptionEventName, attributes, time);
    } else {
      diag.warn(`Failed to record an exception ${exception}`);
    }
  }

  get ended(): boolean {
    return this._ended;
  }

  get droppedAttributesCount(): number {
    return this._droppedAttributesCount;
  }

  get droppedEventsCount(): number {
    return this._droppedEventsCount;
  }

  get droppedLinksCount(): number {
    return this._droppedLinksCount;
  }

  private _isSpanEnded(): boolean {
    if (this._ended) {
      const error = new Error(
        `Operation attempted on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`
      );

      diag.warn(
        `Cannot execute the operation on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`,
        error
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
    return value.substring(0, limit);
  }

  /**
   * If the given attribute value is of type string and has more characters than given {@code attributeValueLengthLimit} then
   * return string with truncated to {@code attributeValueLengthLimit} characters
   *
   * If the given attribute value is array of strings then
   * return new array of strings with each element truncated to {@code attributeValueLengthLimit} characters
   *
   * Otherwise return same Attribute {@code value}
   *
   * @param value Attribute value
   * @returns truncated attribute value if required, otherwise same value
   */
  private _truncateToSize(value: AttributeValue): AttributeValue {
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

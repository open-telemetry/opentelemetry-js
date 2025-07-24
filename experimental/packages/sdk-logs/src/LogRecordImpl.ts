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

import type * as logsAPI from '@opentelemetry/api-logs';
import * as api from '@opentelemetry/api';
import {
  timeInputToHrTime,
  isAttributeValue,
  InstrumentationScope,
} from '@opentelemetry/core';
import type { Resource } from '@opentelemetry/resources';

import type { ReadableLogRecord } from './export/ReadableLogRecord';
import type { LogRecordLimits } from './types';
import { LoggerProviderSharedState } from './internal/LoggerProviderSharedState';

export class LogRecordImpl implements ReadableLogRecord {
  readonly hrTime: api.HrTime;
  readonly hrTimeObserved: api.HrTime;
  readonly spanContext?: api.SpanContext;
  readonly resource: Resource;
  readonly instrumentationScope: InstrumentationScope;
  readonly attributes: logsAPI.LogAttributes = {};
  private _severityText?: string;
  private _severityNumber?: logsAPI.SeverityNumber;
  private _body?: logsAPI.LogBody;
  private _eventName?: string;
  private totalAttributesCount: number = 0;

  private _isReadonly: boolean = false;
  private readonly _logRecordLimits: Required<LogRecordLimits>;

  set severityText(severityText: string | undefined) {
    if (this._isLogRecordReadonly()) {
      return;
    }
    this._severityText = severityText;
  }
  get severityText(): string | undefined {
    return this._severityText;
  }

  set severityNumber(severityNumber: logsAPI.SeverityNumber | undefined) {
    if (this._isLogRecordReadonly()) {
      return;
    }
    this._severityNumber = severityNumber;
  }
  get severityNumber(): logsAPI.SeverityNumber | undefined {
    return this._severityNumber;
  }

  set body(body: logsAPI.LogBody | undefined) {
    if (this._isLogRecordReadonly()) {
      return;
    }
    this._body = body;
  }
  get body(): logsAPI.LogBody | undefined {
    return this._body;
  }

  get eventName(): string | undefined {
    return this._eventName;
  }
  set eventName(eventName: string | undefined) {
    if (this._isLogRecordReadonly()) {
      return;
    }
    this._eventName = eventName;
  }

  get droppedAttributesCount(): number {
    return this.totalAttributesCount - Object.keys(this.attributes).length;
  }

  constructor(
    _sharedState: LoggerProviderSharedState,
    instrumentationScope: InstrumentationScope,
    logRecord: logsAPI.LogRecord
  ) {
    const {
      timestamp,
      observedTimestamp,
      eventName,
      severityNumber,
      severityText,
      body,
      attributes = {},
      context,
    } = logRecord;

    const now = Date.now();
    this.hrTime = timeInputToHrTime(timestamp ?? now);
    this.hrTimeObserved = timeInputToHrTime(observedTimestamp ?? now);

    if (context) {
      const spanContext = api.trace.getSpanContext(context);
      if (spanContext && api.isSpanContextValid(spanContext)) {
        this.spanContext = spanContext;
      }
    }
    this.severityNumber = severityNumber;
    this.severityText = severityText;
    this.body = body;
    this.resource = _sharedState.resource;
    this.instrumentationScope = instrumentationScope;
    this._logRecordLimits = _sharedState.logRecordLimits;
    this._eventName = eventName;
    this.setAttributes(attributes);
  }

  public setAttribute(key: string, value?: logsAPI.AnyValue) {
    if (this._isLogRecordReadonly()) {
      return this;
    }
    if (value === null) {
      return this;
    }
    if (key.length === 0) {
      api.diag.warn(`Invalid attribute key: ${key}`);
      return this;
    }
    if (
      !isAttributeValue(value) &&
      !(
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.keys(value).length > 0
      )
    ) {
      api.diag.warn(`Invalid attribute value set for key: ${key}`);
      return this;
    }
    this.totalAttributesCount += 1;
    if (
      Object.keys(this.attributes).length >=
        this._logRecordLimits.attributeCountLimit &&
      !Object.prototype.hasOwnProperty.call(this.attributes, key)
    ) {
      // This logic is to create drop message at most once per LogRecord to prevent excessive logging.
      if (this.droppedAttributesCount === 1) {
        api.diag.warn('Dropping extra attributes.');
      }
      return this;
    }
    if (isAttributeValue(value)) {
      this.attributes[key] = this._truncateToSize(value);
    } else {
      this.attributes[key] = value;
    }
    return this;
  }

  public setAttributes(attributes: logsAPI.LogAttributes) {
    for (const [k, v] of Object.entries(attributes)) {
      this.setAttribute(k, v);
    }
    return this;
  }

  public setBody(body: logsAPI.LogBody) {
    this.body = body;
    return this;
  }

  public setEventName(eventName: string) {
    this.eventName = eventName;
    return this;
  }

  public setSeverityNumber(severityNumber: logsAPI.SeverityNumber) {
    this.severityNumber = severityNumber;
    return this;
  }

  public setSeverityText(severityText: string) {
    this.severityText = severityText;
    return this;
  }

  /**
   * @internal
   * A LogRecordProcessor may freely modify logRecord for the duration of the OnEmit call.
   * If logRecord is needed after OnEmit returns (i.e. for asynchronous processing) only reads are permitted.
   */
  _makeReadonly() {
    this._isReadonly = true;
  }

  private _truncateToSize(value: api.AttributeValue): api.AttributeValue {
    const limit = this._logRecordLimits.attributeValueLengthLimit;
    // Check limit
    if (limit <= 0) {
      // Negative values are invalid, so do not truncate
      api.diag.warn(`Attribute value limit must be positive, got ${limit}`);
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

  private _truncateToLimitUtil(value: string, limit: number): string {
    if (value.length <= limit) {
      return value;
    }
    return value.substring(0, limit);
  }

  private _isLogRecordReadonly(): boolean {
    if (this._isReadonly) {
      api.diag.warn('Can not execute the operation on emitted log record');
    }
    return this._isReadonly;
  }
}

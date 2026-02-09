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

import type {
  AnyValue,
  LogAttributes,
  LogBody,
  LogRecord,
  SeverityNumber,
} from '@opentelemetry/api-logs';
import * as api from '@opentelemetry/api';
import type { Exception } from '@opentelemetry/api';
import { timeInputToHrTime, InstrumentationScope } from '@opentelemetry/core';
import type { Resource } from '@opentelemetry/resources';
import {
  ATTR_EXCEPTION_MESSAGE,
  ATTR_EXCEPTION_STACKTRACE,
  ATTR_EXCEPTION_TYPE,
} from '@opentelemetry/semantic-conventions';
import type { ReadableLogRecord } from './export/ReadableLogRecord';
import type { LogRecordLimits } from './types';
import { isLogAttributeValue } from './utils/validation';
import { LoggerProviderSharedState } from './internal/LoggerProviderSharedState';

export class LogRecordImpl implements ReadableLogRecord {
  readonly hrTime: api.HrTime;
  readonly hrTimeObserved: api.HrTime;
  readonly spanContext?: api.SpanContext;
  readonly resource: Resource;
  readonly instrumentationScope: InstrumentationScope;
  readonly attributes: LogAttributes = {};
  private _severityText?: string;
  private _severityNumber?: SeverityNumber;
  private _body?: LogBody;
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

  set severityNumber(severityNumber: SeverityNumber | undefined) {
    if (this._isLogRecordReadonly()) {
      return;
    }
    this._severityNumber = severityNumber;
  }
  get severityNumber(): SeverityNumber | undefined {
    return this._severityNumber;
  }

  set body(body: LogBody | undefined) {
    if (this._isLogRecordReadonly()) {
      return;
    }
    this._body = body;
  }
  get body(): LogBody | undefined {
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
    logRecord: LogRecord
  ) {
    const {
      timestamp,
      observedTimestamp,
      eventName,
      severityNumber,
      severityText,
      body,
      attributes = {},
      exception,
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
    if (exception != null) {
      this._setException(exception);
    }
  }

  public setAttribute(key: string, value?: AnyValue) {
    if (this._isLogRecordReadonly()) {
      return this;
    }
    if (key.length === 0) {
      api.diag.warn(`Invalid attribute key: ${key}`);
      return this;
    }
    if (!isLogAttributeValue(value)) {
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
    this.attributes[key] = this._truncateToSize(value);
    return this;
  }

  public setAttributes(attributes: LogAttributes) {
    for (const [k, v] of Object.entries(attributes)) {
      this.setAttribute(k, v);
    }
    return this;
  }

  public setBody(body: LogBody) {
    this.body = body;
    return this;
  }

  public setEventName(eventName: string) {
    this.eventName = eventName;
    return this;
  }

  public setSeverityNumber(severityNumber: SeverityNumber) {
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

  private _truncateToSize(value: AnyValue): AnyValue {
    const limit = this._logRecordLimits.attributeValueLengthLimit;
    // Check limit
    if (limit <= 0) {
      // Negative values are invalid, so do not truncate
      api.diag.warn(`Attribute value limit must be positive, got ${limit}`);
      return value;
    }

    // null/undefined - no truncation needed
    if (value == null) {
      return value;
    }

    // String
    if (typeof value === 'string') {
      return this._truncateToLimitUtil(value, limit);
    }

    // Byte arrays - no truncation needed
    if (value instanceof Uint8Array) {
      return value;
    }

    // Arrays (can contain any AnyValue types)
    if (Array.isArray(value)) {
      return value.map(val => this._truncateToSize(val));
    }

    // Objects/Maps - recursively truncate nested values
    if (typeof value === 'object') {
      const truncatedObj: Record<string, AnyValue> = {};
      for (const [k, v] of Object.entries(value as Record<string, AnyValue>)) {
        truncatedObj[k] = this._truncateToSize(v);
      }
      return truncatedObj;
    }

    // Other types (number, boolean), no need to apply value length limit
    return value;
  }

  private _setException(exception: Exception): void {
    const attributes: LogAttributes = {};
    if (typeof exception === 'string') {
      attributes[ATTR_EXCEPTION_MESSAGE] = exception;
    } else if (exception) {
      if (exception.code) {
        attributes[ATTR_EXCEPTION_TYPE] = exception.code.toString();
      } else if (exception.name) {
        attributes[ATTR_EXCEPTION_TYPE] = exception.name;
      }
      if (exception.message) {
        attributes[ATTR_EXCEPTION_MESSAGE] = exception.message;
      }
      if (exception.stack) {
        attributes[ATTR_EXCEPTION_STACKTRACE] = exception.stack;
      }
    }

    if (attributes[ATTR_EXCEPTION_TYPE] || attributes[ATTR_EXCEPTION_MESSAGE]) {
      for (const [key, value] of Object.entries(attributes)) {
        if (!Object.prototype.hasOwnProperty.call(this.attributes, key)) {
          this.setAttribute(key, value);
        }
      }
    } else {
      api.diag.warn(`Failed to record an exception ${exception}`);
    }
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

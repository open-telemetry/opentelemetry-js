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

import { Attributes, AttributeValue, diag } from '@opentelemetry/api';
import type * as logsAPI from '@opentelemetry/api-logs';
import * as api from '@opentelemetry/api';
import {
  timeInputToHrTime,
  isAttributeValue,
  InstrumentationScope,
} from '@opentelemetry/core';
import type { IResource } from '@opentelemetry/resources';

import type { ReadableLogRecord } from './export/ReadableLogRecord';
import type { LogRecordLimits } from './types';
import { Logger } from './Logger';

export class LogRecord implements ReadableLogRecord {
  readonly hrTime: api.HrTime;
  readonly spanContext?: api.SpanContext;
  readonly resource: IResource;
  readonly instrumentationScope: InstrumentationScope;
  readonly attributes: Attributes = {};
  private _severityText?: string;
  private _severityNumber?: logsAPI.SeverityNumber;
  private _body?: string;

  private _isReadonly: boolean = false;
  private readonly _logRecordLimits: LogRecordLimits;

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

  set body(body: string | undefined) {
    if (this._isLogRecordReadonly()) {
      return;
    }
    this._body = body;
  }
  get body(): string | undefined {
    return this._body;
  }

  constructor(logger: Logger, logRecord: logsAPI.LogRecord) {
    const {
      timestamp = Date.now(),
      severityNumber,
      severityText,
      body,
      attributes = {},
      context,
    } = logRecord;

    this.hrTime = timeInputToHrTime(timestamp);
    if (context) {
      const spanContext = api.trace.getSpanContext(context);
      if (spanContext && api.isSpanContextValid(spanContext)) {
        this.spanContext = spanContext;
      }
    }
    this.severityNumber = severityNumber;
    this.severityText = severityText;
    this.body = body;
    this.resource = logger.resource;
    this.instrumentationScope = logger.instrumentationScope;
    this._logRecordLimits = logger.getLogRecordLimits();
    this.setAttributes(attributes);
  }

  public setAttribute(key: string, value?: AttributeValue) {
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
    if (!isAttributeValue(value)) {
      api.diag.warn(`Invalid attribute value set for key: ${key}`);
      return this;
    }
    if (
      Object.keys(this.attributes).length >=
        this._logRecordLimits.attributeCountLimit! &&
      !Object.prototype.hasOwnProperty.call(this.attributes, key)
    ) {
      return this;
    }
    this.attributes[key] = this._truncateToSize(value);
    return this;
  }

  public setAttributes(attributes: Attributes) {
    for (const [k, v] of Object.entries(attributes)) {
      this.setAttribute(k, v);
    }
    return this;
  }

  public setBody(body: string) {
    this.body = body;
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
   * A LogRecordProcessor may freely modify logRecord for the duration of the OnEmit call.
   * If logRecord is needed after OnEmit returns (i.e. for asynchronous processing) only reads are permitted.
   */
  public makeReadonly() {
    this._isReadonly = true;
  }

  private _truncateToSize(value: AttributeValue): AttributeValue {
    const limit = this._logRecordLimits.attributeValueLengthLimit || 0;
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
      diag.warn('Can not execute the operation on emitted log record');
    }
    return this._isReadonly;
  }
}

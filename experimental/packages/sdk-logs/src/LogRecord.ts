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

import type { Attributes, AttributeValue, SpanContext } from "@opentelemetry/api";
import type * as logsAPI from "@opentelemetry/api-logs";
import type { InstrumentationScope } from "@opentelemetry/core";
import * as api from "@opentelemetry/api";
import { hrTime, timeInputToHrTime, isAttributeValue } from "@opentelemetry/core";

import type { ReadableLogRecord } from "./export/ReadableLogRecord";
import type { LoggerSharedState } from "./LoggerSharedState";
import type { LogRecordData } from "./types";

export class LogRecord implements logsAPI.LogRecord {
  private readonly _timestamp: api.HrTime;
  private readonly _severityNumber?: logsAPI.SeverityNumber;
  private readonly _severityText?: string;
  private readonly _body?: string;
  private readonly _attributes: Attributes;
  private readonly _context?: SpanContext;
  private readonly _instrumentationScope: InstrumentationScope;

  private _isEmitted = false;

  constructor(private readonly _loggerSharedState: LoggerSharedState, data: LogRecordData) {
    const { timestamp, severityNumber, severityText, body, context, instrumentationScope, attributes = {} } = data;
    this._timestamp = timestamp ? timeInputToHrTime(timestamp) : hrTime();
    this._severityNumber = severityNumber;
    this._severityText = severityText;
    this._body = body;
    this._attributes = attributes;
    this._context = context;
    this._instrumentationScope = instrumentationScope;
  }

  public setAttribute(key: string, value?: AttributeValue): LogRecord {
    if (value === null || this._isLogRecordEmitted()) {
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
      Object.keys(this._attributes).length >= this._loggerSharedState.logRecordLimits.attributeCountLimit! &&
      !Object.prototype.hasOwnProperty.call(this._attributes, key)
    ) {
      return this;
    }
    this._attributes[key] = this._truncateToSize(value);
    return this;
  }

  public setAttributes(attributes: Attributes): LogRecord {
    for (const [k, v] of Object.entries(attributes)) {
      this.setAttribute(k, v);
    }
    return this;
  }

  public emit(): void {
    if (this._loggerSharedState.shutdownOnceFeature.isCalled) {
      api.diag.warn("can not emit, it is already shutdown");
      return;
    }
    if (this._isLogRecordEmitted()) {
      return;
    }
    this._isEmitted = true;
    this._loggerSharedState.activeProcessor.onEmit(this._toReadable());
  }

  private _isLogRecordEmitted(): boolean {
    if (this._isEmitted) {
      api.diag.warn("Can not execute the operation on emitted LogRecord");
    }
    return this._isEmitted;
  }

  private _truncateToSize(value: AttributeValue): AttributeValue {
    const limit = this._loggerSharedState.logRecordLimits.attributeValueLengthLimit || 0;
    // Check limit
    if (limit <= 0) {
      // Negative values are invalid, so do not truncate
      api.diag.warn(`Attribute value limit must be positive, got ${limit}`);
      return value;
    }

    // String
    if (typeof value === "string") {
      return this._truncateToLimitUtil(value, limit);
    }

    // Array of strings
    if (Array.isArray(value)) {
      return (value as []).map((val) => (typeof val === "string" ? this._truncateToLimitUtil(val, limit) : val));
    }

    // Other types, no need to apply value length limit
    return value;
  }

  private _truncateToLimitUtil(value: string, limit: number): string {
    if (value.length <= limit) {
      return value;
    }
    return value.substr(0, limit);
  }

  private _toReadable(): ReadableLogRecord {
    return {
      resource: this._loggerSharedState.resource,
      timestamp: this._timestamp,
      severityNumber: this._severityNumber,
      severityText: this._severityText,
      body: this._body,
      attributes: this._attributes,
      context: this._context,
      instrumentationScope: this._instrumentationScope,
    };
  }
}

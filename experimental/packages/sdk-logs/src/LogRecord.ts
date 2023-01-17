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

import type { Attributes, AttributeValue } from '@opentelemetry/api';
import type * as logsAPI from '@opentelemetry/api-logs';
import type { InstrumentationScope } from '@opentelemetry/core';
import * as api from '@opentelemetry/api';
import {
  hrTime,
  timeInputToHrTime,
  isAttributeValue,
} from '@opentelemetry/core';

import { Resource } from '@opentelemetry/resources';
import { ReadableLogRecord } from './export/ReadableLogRecord';
import { LoggerConfig } from './types';

export class LogRecord implements ReadableLogRecord {
  readonly time: api.HrTime;
  readonly observedTime?: api.HrTime;
  readonly traceId?: string;
  readonly spanId?: string;
  readonly traceFlags?: number;
  readonly severityText?: string;
  readonly severityNumber?: logsAPI.SeverityNumber;
  readonly body?: string;
  readonly resource: Resource;
  readonly instrumentationScope: InstrumentationScope;
  readonly attributes: Attributes = {};

  private _isEmitted = false;

  constructor(
    private readonly config: LoggerConfig,
    logRecord: logsAPI.LogRecord
  ) {
    const {
      time = hrTime(),
      observedTime,
      // if includeTraceContext is true, Gets the current trace context by default
      context = this.config.includeTraceContext
        ? api.context.active()
        : undefined,
      severityNumber,
      severityText,
      body,
      attributes = {},
    } = logRecord;
    this.time = timeInputToHrTime(time);
    this.observedTime =
      observedTime === undefined
        ? observedTime
        : timeInputToHrTime(observedTime);

    if (context) {
      const spanContext = api.trace.getSpanContext(context);
      if (spanContext && api.isSpanContextValid(spanContext)) {
        this.spanId = spanContext.spanId;
        this.traceId = spanContext.traceId;
        this.traceFlags = spanContext.traceFlags;
      }
    }

    this.severityNumber = severityNumber;
    this.severityText = severityText;
    this.body = body;
    this.resource = this.config.loggerSharedState.resource;
    this.instrumentationScope = this.config.instrumentationScope;
    this.setAttributes(attributes);
  }

  public emit(): void {
    if (this.config.loggerSharedState.shutdownOnceFeature.isCalled) {
      api.diag.warn('can not emit, it is already shutdown');
      return;
    }
    if (this._isLogRecordEmitted()) {
      return;
    }
    this._isEmitted = true;
    this.config.loggerSharedState.activeProcessor.onEmit(this);
  }

  private setAttribute(key: string, value?: AttributeValue): LogRecord {
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
      Object.keys(this.attributes).length >=
        this.config.loggerSharedState.logRecordLimits.attributeCountLimit! &&
      !Object.prototype.hasOwnProperty.call(this.attributes, key)
    ) {
      return this;
    }
    this.attributes[key] = this._truncateToSize(value);
    return this;
  }

  private setAttributes(attributes: Attributes): LogRecord {
    for (const [k, v] of Object.entries(attributes)) {
      this.setAttribute(k, v);
    }
    return this;
  }

  private _isLogRecordEmitted(): boolean {
    if (this._isEmitted) {
      api.diag.warn('Can not execute the operation on emitted LogRecord');
    }
    return this._isEmitted;
  }

  private _truncateToSize(value: AttributeValue): AttributeValue {
    const limit =
      this.config.loggerSharedState.logRecordLimits.attributeValueLengthLimit ||
      0;
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
    return value.substr(0, limit);
  }
}

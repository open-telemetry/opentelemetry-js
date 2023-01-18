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

import type { Resource } from '@opentelemetry/resources';
import type { ReadableLogRecord } from './export/ReadableLogRecord';
import type { LoggerConfig } from './types';

export class LogRecord implements ReadableLogRecord {
  readonly time: api.HrTime;
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
      timestamp = hrTime(),
      severityNumber,
      severityText,
      body,
      attributes = {},
      spanId,
      traceFlags,
      traceId,
    } = logRecord;

    this.time = timeInputToHrTime(timestamp);
    this.spanId = spanId;
    this.traceId = traceId;
    this.traceFlags = traceFlags;
    this.severityNumber = severityNumber;
    this.severityText = severityText;
    this.body = body;
    this.resource = this.config.resource;
    this.instrumentationScope = this.config.instrumentationScope;
    this.setAttributes(attributes);
  }

  public emit(): void {
    if (this._isLogRecordEmitted()) {
      return;
    }
    this._isEmitted = true;
    this.config.activeProcessor.onEmit(this);
  }

  public setAttribute(key: string, value?: AttributeValue) {
    if (value === null || this._isLogRecordEmitted()) {
      return;
    }
    if (key.length === 0) {
      api.diag.warn(`Invalid attribute key: ${key}`);
      return;
    }
    if (!isAttributeValue(value)) {
      api.diag.warn(`Invalid attribute value set for key: ${key}`);
      return;
    }
    if (
      Object.keys(this.attributes).length >=
        this.config.logRecordLimits.attributeCountLimit! &&
      !Object.prototype.hasOwnProperty.call(this.attributes, key)
    ) {
      return;
    }
    this.attributes[key] = this._truncateToSize(value);
  }

  public setAttributes(attributes: Attributes) {
    for (const [k, v] of Object.entries(attributes)) {
      this.setAttribute(k, v);
    }
  }

  private _isLogRecordEmitted(): boolean {
    if (this._isEmitted) {
      api.diag.warn('Can not execute the operation on emitted LogRecord');
    }
    return this._isEmitted;
  }

  private _truncateToSize(value: AttributeValue): AttributeValue {
    const limit = this.config.logRecordLimits.attributeValueLengthLimit || 0;
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

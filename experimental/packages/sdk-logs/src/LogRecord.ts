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

export class LogRecord implements logsAPI.LogRecord, ReadableLogRecord {
  time: api.HrTime;
  severityText?: string;
  severityNumber?: logsAPI.SeverityNumber;
  body?: string;
  readonly traceId?: string;
  readonly spanId?: string;
  readonly traceFlags?: number;
  readonly resource: IResource;
  readonly instrumentationScope: InstrumentationScope;
  readonly attributes: Attributes = {};
  private readonly _logRecordLimits: LogRecordLimits;

  constructor(logger: Logger, logRecord: logsAPI.LogRecord) {
    const {
      timestamp = Date.now(),
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
    this.resource = logger.resource;
    this.instrumentationScope = logger.instrumentationScope;
    this._logRecordLimits = logger.getLogRecordLimits();
    this.setAttributes(attributes);
  }

  public setAttribute(key: string, value?: AttributeValue) {
    if (value === null) {
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
        this._logRecordLimits.attributeCountLimit! &&
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

  public updateTime(time: api.TimeInput) {
    this.time = timeInputToHrTime(time);
  }

  public updateBody(body: string) {
    this.body = body;
  }

  public updateSeverityNumber(severityNumber: logsAPI.SeverityNumber) {
    this.severityNumber = severityNumber;
  }

  public updateSeverityText(severityText: string) {
    this.severityText = severityText;
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
}

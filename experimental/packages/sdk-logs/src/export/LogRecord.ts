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
  InstrumentationScope,
} from '@opentelemetry/core';
import { AnyValue, LogAttributes, LogBody } from '@opentelemetry/api-logs';
import type { Resource } from '@opentelemetry/resources';

/**
 * A recording of a event. Typically the record includes a timestamp indicating when the 
 * event happened as well as other data that describes what happened, where it happened, etc.
 * 
 * @remarks
 * This interface is **not intended to be implemented by users**.
 * To produce logs, use {@link Logger#emit}. To consume logs, implement {@link LogRecordProcessor#onEmit}.
 * LogRecord instances are created and managed by the SDK.
 */
export interface LogRecord {
  /** Time when the event occurred. */
  readonly hrTime: api.HrTime;

  /** Time when the event was observed. */
  readonly hrTimeObserved: api.HrTime;

  /** Span context of a log */
  readonly spanContext?: api.SpanContext;

  /** Describes the source of the log. */
  readonly resource: Resource;

  /** Describes the scope that emitted the log. */
  readonly instrumentationScope: InstrumentationScope;

  /**
   * Attributes that define the log record.
   */
  readonly attributes: logsAPI.LogAttributes;

  /** The severity text (also known as log level). */
  severityText?: string;

  /** Numerical value of the severity. */
  severityNumber?: logsAPI.SeverityNumber;

  /**
   * A value containing the body of the log record.
   */
  body?: LogBody;

  /**
   * The unique identifier for the log record.
   */
  eventName?: string;
  
  /** Dropped attribute countfor the log record */
  droppedAttributesCount: number;

  /**
   * Sets a single attribute on the log record.
   * @param key The attribute key.
   * @param value The attribute value.
   * @returns The updated LogRecord.
   */
  setAttribute(key: string, value?: AnyValue): LogRecord;

  /**
   * Sets multiple attributes on the log record.
   * @param attributes The attributes to set.
   * @returns The updated LogRecord.
   */
  setAttributes(attributes: LogAttributes): LogRecord;

  /**
   * Sets the body of the log record.
   * @param body The log body.
   * @returns The updated LogRecord.
   */
  setBody(body: LogBody): LogRecord;

  /**
   * Sets the event name for the log record.
   * @param eventName The event name.
   * @returns The updated LogRecord.
   */
  setEventName(eventName: string): LogRecord;

  /**
   * Sets the severity number for the log record.
   * @param severityNumber The severity number.
   * @returns The updated LogRecord.
   */
  setSeverityNumber(severityNumber: logsAPI.SeverityNumber): LogRecord;

  /**
   * Sets the severity text (log level) for the log record.
   * @param severityText The severity text.
   * @returns The updated LogRecord.
   */
  setSeverityText(severityText: string): LogRecord;
}
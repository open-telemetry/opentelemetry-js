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

import type { HrTime, SpanContext } from '@opentelemetry/api';
import { InstrumentationScope } from '@opentelemetry/core';
import type {
  AnyValue,
  LogBody,
  LogAttributes,
  SeverityNumber,
} from '@opentelemetry/api/experimental';
import type { Resource } from '@opentelemetry/resources';

/**
 * A recording of a event. Typically the record includes a timestamp indicating when the
 * event happened as well as other data that describes what happened, where it happened, etc.
 *
 * @remarks
 * This interface is **not intended to be implemented by users**.
 * To produce logs, use {@link Logger#emit}. To consume logs, implement {@link LogRecordProcessor#onEmit}.
 * SdkLogRecord instances are created and managed by the SDK.
 */
export interface SdkLogRecord {
  readonly hrTime: HrTime;
  readonly hrTimeObserved: HrTime;
  readonly spanContext?: SpanContext;
  readonly resource: Resource;
  readonly instrumentationScope: InstrumentationScope;
  readonly attributes: LogAttributes;
  severityText?: string;
  severityNumber?: SeverityNumber;
  body?: LogBody;
  eventName?: string;
  droppedAttributesCount: number;

  /**
   * Sets a single attribute on the log record.
   * @param key The attribute key.
   * @param value The attribute value.
   * @returns The updated SdkLogRecord.
   */
  setAttribute(key: string, value?: AnyValue): SdkLogRecord;

  /**
   * Sets multiple attributes on the log record.
   * @param attributes The attributes to set.
   * @returns The updated SdkLogRecord.
   */
  setAttributes(attributes: LogAttributes): SdkLogRecord;

  /**
   * Sets the body of the log record.
   * @param body The log body.
   * @returns The updated SdkLogRecord.
   */
  setBody(body: LogBody): SdkLogRecord;

  /**
   * Sets the event name for the log record.
   * @param eventName The event name.
   * @returns The updated SdkLogRecord.
   */
  setEventName(eventName: string): SdkLogRecord;

  /**
   * Sets the severity number for the log record.
   * @param severityNumber The severity number.
   * @returns The updated SdkLogRecord.
   */
  setSeverityNumber(severityNumber: SeverityNumber): SdkLogRecord;

  /**
   * Sets the severity text (log level) for the log record.
   * @param severityText The severity text.
   * @returns The updated SdkLogRecord.
   */
  setSeverityText(severityText: string): SdkLogRecord;
}

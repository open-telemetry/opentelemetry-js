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

import { Context } from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { InstrumentationScope } from '@opentelemetry/core';

import { SdkLogRecord } from './export/SdkLogRecord';

export interface LogRecordProcessor {
  /**
   * Forces to export all finished log records
   */
  forceFlush(): Promise<void>;

  /**
   * Called when a {@link LogRecord} is emit
   * @param logRecord the ReadWriteLogRecord that just emitted.
   * @param context the current Context, or an empty Context if the Logger was obtained with include_trace_context=false
   */
  onEmit(logRecord: SdkLogRecord, context?: Context): void;

  /**
   * Shuts down the processor. Called when SDK is shut down. This is an
   * opportunity for processor to do any cleanup required.
   */
  shutdown(): Promise<void>;

  /**
   * Tells if the logger is enabled for the given context, severity number and event
   * name if provided.
   * @param options
   */
  enabled(options: {
    context: Context;
    instrumentationScope: InstrumentationScope;
    severityNumber?: SeverityNumber;
    eventName?: string;
  }): boolean;
}

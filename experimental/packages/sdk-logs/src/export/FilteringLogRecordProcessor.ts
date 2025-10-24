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

import {
  Context,
  TraceFlags,
  isSpanContextValid,
  trace,
} from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';

import { LogRecordProcessor } from '../LogRecordProcessor';
import type { SdkLogRecord } from './SdkLogRecord';

export interface FilteringLogRecordProcessorConfig {
  minimumSeverity?: SeverityNumber;
  traceBased?: boolean;
}

/**
 * LogRecordProcessor that applies severity- and trace-based filtering before
 * delegating to another processor.
 */
export class FilteringLogRecordProcessor implements LogRecordProcessor {
  private readonly _minimumSeverity: SeverityNumber;
  private readonly _traceBased: boolean;

  constructor(
    private readonly _delegate: LogRecordProcessor,
    config: FilteringLogRecordProcessorConfig = {}
  ) {
    this._minimumSeverity =
      config.minimumSeverity ?? SeverityNumber.UNSPECIFIED;
    this._traceBased = config.traceBased ?? false;
  }

  forceFlush(): Promise<void> {
    return this._delegate.forceFlush();
  }

  shutdown(): Promise<void> {
    return this._delegate.shutdown();
  }

  onEmit(logRecord: SdkLogRecord, context?: Context): void {
    const severity = logRecord.severityNumber ?? SeverityNumber.UNSPECIFIED;
    if (
      severity !== SeverityNumber.UNSPECIFIED &&
      severity < this._minimumSeverity
    ) {
      return;
    }

    if (this._traceBased) {
      const spanContext =
        logRecord.spanContext ??
        (context ? trace.getSpanContext(context) : undefined);

      if (spanContext && isSpanContextValid(spanContext)) {
        const isSampled =
          (spanContext.traceFlags & TraceFlags.SAMPLED) === TraceFlags.SAMPLED;
        if (!isSampled) {
          return;
        }
      }
    }

    this._delegate.onEmit(logRecord, context);
  }
}

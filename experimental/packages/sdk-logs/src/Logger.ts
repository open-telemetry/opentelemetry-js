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
import { SeverityNumber } from '@opentelemetry/api-logs';
import type { InstrumentationScope } from '@opentelemetry/core';
import {
  context,
  trace,
  TraceFlags,
  isSpanContextValid,
  Exception,
} from '@opentelemetry/api';

import { LogRecordImpl } from './LogRecordImpl';
import { LoggerProviderSharedState } from './internal/LoggerProviderSharedState';
import { LoggerConfig } from './types';

export class Logger implements logsAPI.Logger {
  public readonly instrumentationScope: InstrumentationScope;
  private _sharedState: LoggerProviderSharedState;
  private readonly _loggerConfig: Required<LoggerConfig>;

  constructor(
    instrumentationScope: InstrumentationScope,
    sharedState: LoggerProviderSharedState
  ) {
    this.instrumentationScope = instrumentationScope;
    this._sharedState = sharedState;
    // Cache the logger configuration at construction time
    // Since we don't support re-configuration, this avoids map lookups
    // and string allocations on each emit() call
    this._loggerConfig = this._sharedState.getLoggerConfig(
      this.instrumentationScope
    );
  }

  public emit(logRecord: logsAPI.LogRecord): void {
    const loggerConfig = this._loggerConfig;

    const currentContext = logRecord.context || context.active();

    // Apply minimum severity filtering
    const recordSeverity =
      logRecord.severityNumber ?? SeverityNumber.UNSPECIFIED;

    // 1. Minimum severity: If the log record's SeverityNumber is specified
    //    (i.e. not 0) and is less than the configured minimum_severity,
    //    the log record MUST be dropped.
    if (
      recordSeverity !== SeverityNumber.UNSPECIFIED &&
      recordSeverity < loggerConfig.minimumSeverity
    ) {
      // Log record is dropped due to minimum severity filter
      return;
    }

    // 2. Trace-based: If trace_based is true, and if the log record has a
    //    SpanId and the TraceFlags SAMPLED flag is unset, the log record MUST be dropped.
    if (loggerConfig.traceBased) {
      const spanContext = trace.getSpanContext(currentContext);
      if (spanContext && isSpanContextValid(spanContext)) {
        // Check if the trace is unsampled (SAMPLED flag is unset)
        const isSampled =
          (spanContext.traceFlags & TraceFlags.SAMPLED) === TraceFlags.SAMPLED;
        if (!isSampled) {
          // Log record is dropped due to trace-based filter
          return;
        }
      }
      // If there's no valid span context, the log record is not associated with a trace
      // and therefore bypasses trace-based filtering (as per spec)
    }

    /**
     * If a Logger was obtained with include_trace_context=true,
     * the LogRecords it emits MUST automatically include the Trace Context from the active Context,
     * if Context has not been explicitly set.
     */
    const logRecordInstance = new LogRecordImpl(
      this._sharedState,
      this.instrumentationScope,
      {
        context: currentContext,
        ...logRecord,
      }
    );
    /**
     * the explicitly passed Context,
     * the current Context, or an empty Context if the Logger was obtained with include_trace_context=false
     */
    this._sharedState.activeProcessor.onEmit(logRecordInstance, currentContext);
    /**
     * A LogRecordProcessor may freely modify logRecord for the duration of the OnEmit call.
     * If logRecord is needed after OnEmit returns (i.e. for asynchronous processing) only reads are permitted.
     */
    logRecordInstance._makeReadonly();
  }

  public recordException(
    exception: Exception,
    options?: logsAPI.RecordExceptionOptions
  ): void {
    this.emit({
      exception,
      ...options,
    });
  }
}

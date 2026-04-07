/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type * as logsAPI from '@opentelemetry/api-logs';
import { SeverityNumber } from '@opentelemetry/api-logs';
import type { Context } from '@opentelemetry/api';
import {
  context,
  trace,
  TraceFlags,
  isSpanContextValid,
} from '@opentelemetry/api';

import { LogRecordImpl } from './LogRecordImpl';
import type { LoggerProviderSharedState } from './internal/LoggerProviderSharedState';
import type { LoggerConfig } from './types';
import type { LogInstrumentationScope } from './internal/utils';

export class Logger implements logsAPI.Logger {
  private readonly _instrumentationScope: LogInstrumentationScope;
  private readonly _sharedState: LoggerProviderSharedState;
  private readonly _loggerConfig: Required<LoggerConfig>;

  constructor(
    instrumentationScope: LogInstrumentationScope,
    sharedState: LoggerProviderSharedState
  ) {
    this._instrumentationScope = instrumentationScope;
    this._sharedState = sharedState;
    // Cache the logger configuration at construction time
    // Since we don't support re-configuration, this avoids map lookups
    // and string allocations on each emit() call
    this._loggerConfig = this._sharedState.getLoggerConfig(
      this._instrumentationScope
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
      this._instrumentationScope,
      {
        context: currentContext,
        ...logRecord,
      }
    );
    this._sharedState.loggerMetrics.emitLog();
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

  public enabled(options?: {
    context?: Context;
    severityNumber?: SeverityNumber;
    eventName?: string;
  }): boolean {
    const loggerConfig = this._loggerConfig;

    if (loggerConfig.disabled) {
      return false;
    }

    // Severity number given and lower than the min configured
    const severityNumber = options?.severityNumber;
    if (
      typeof severityNumber === 'number' &&
      severityNumber !== SeverityNumber.UNSPECIFIED &&
      severityNumber < loggerConfig.minimumSeverity
    ) {
      return false;
    }

    const currentContext = options?.context || context.active();
    // Trace based: the context (given or the active) has a unsampled Span
    if (loggerConfig.traceBased) {
      const spanContext = trace.getSpanContext(currentContext);
      if (spanContext && isSpanContextValid(spanContext)) {
        const isSampled =
          (spanContext.traceFlags & TraceFlags.SAMPLED) === TraceFlags.SAMPLED;
        if (!isSampled) {
          return false;
        }
      }
    }

    // Lastly check if there is any enabled processor
    const enabledOpts = {
      context: currentContext,
      instrumentationScope: this._instrumentationScope,
      severityNumber: options?.severityNumber,
      eventName: options?.eventName,
    };
    for (const processor of this._sharedState.processors) {
      if (!processor.enabled || processor.enabled(enabledOpts)) {
        return true;
      }
    }
    return false;
  }
}

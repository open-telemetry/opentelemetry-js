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
import type { IResource } from '@opentelemetry/resources';
import type { InstrumentationScope } from '@opentelemetry/core';
import { context } from '@opentelemetry/api';

import type { LoggerConfig, LogRecordLimits } from './types';
import { LogRecord } from './LogRecord';
import { LoggerProvider } from './LoggerProvider';
import { mergeConfig } from './config';
import { LogRecordProcessor } from './LogRecordProcessor';

export class Logger implements logsAPI.Logger {
  public readonly resource: IResource;
  private readonly _loggerConfig: Required<LoggerConfig>;

  constructor(
    public readonly instrumentationScope: InstrumentationScope,
    config: LoggerConfig,
    private _loggerProvider: LoggerProvider
  ) {
    this._loggerConfig = mergeConfig(config);
    this.resource = _loggerProvider.resource;
  }

  public emit(logRecord: logsAPI.LogRecord): void {
    const currentContext = this._loggerConfig.includeTraceContext
      ? context.active()
      : undefined;
    /**
     * If a Logger was obtained with include_trace_context=true,
     * the LogRecords it emits MUST automatically include the Trace Context from the active Context,
     * if Context has not been explicitly set.
     */
    const logRecordInstance = new LogRecord(this, {
      context: currentContext,
      ...logRecord,
    });
    /**
     * the explicitly passed Context,
     * the current Context, or an empty Context if the Logger was obtained with include_trace_context=false
     */
    this.getActiveLogRecordProcessor().onEmit(
      logRecordInstance,
      currentContext
    );
    /**
     * A LogRecordProcessor may freely modify logRecord for the duration of the OnEmit call.
     * If logRecord is needed after OnEmit returns (i.e. for asynchronous processing) only reads are permitted.
     */
    logRecordInstance.makeReadonly();
  }

  public getLogRecordLimits(): LogRecordLimits {
    return this._loggerConfig.logRecordLimits;
  }

  public getActiveLogRecordProcessor(): LogRecordProcessor {
    return this._loggerProvider.getActiveLogRecordProcessor();
  }
}

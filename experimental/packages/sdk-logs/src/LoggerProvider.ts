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
import { diag } from '@opentelemetry/api';
import type * as logsAPI from '@opentelemetry/api-logs';
import { IResource, Resource } from '@opentelemetry/resources';
import { merge } from '@opentelemetry/core';

import type { LoggerConfig } from './types';
import type { LogRecordProcessor } from './LogRecordProcessor';
import { Logger } from './Logger';
import { loadDefaultConfig, reconfigureLimits } from './config';
import { MultiLogRecordProcessor } from './MultiLogRecordProcessor';
import { NoopLogRecordProcessor } from './export/NoopLogRecordProcessor';

export class LoggerProvider implements logsAPI.LoggerProvider {
  public readonly resource: IResource;

  private readonly _loggers: Map<string, Logger> = new Map();
  private _activeProcessor: MultiLogRecordProcessor;
  private readonly _registeredLogRecordProcessors: LogRecordProcessor[] = [];
  private readonly _config: LoggerConfig;

  constructor(config: LoggerConfig = {}) {
    const {
      resource = Resource.empty(),
      logRecordLimits,
      forceFlushTimeoutMillis,
    } = merge({}, loadDefaultConfig(), reconfigureLimits(config));
    this.resource = Resource.default().merge(resource);
    this._config = {
      logRecordLimits,
      resource: this.resource,
      forceFlushTimeoutMillis,
    };

    // add a default processor: NoopLogRecordProcessor
    this._activeProcessor = new MultiLogRecordProcessor(
      [new NoopLogRecordProcessor()],
      forceFlushTimeoutMillis
    );
  }

  /**
   * Get a logger with the configuration of the LoggerProvider.
   */
  public getLogger(
    name: string,
    version?: string,
    options?: logsAPI.LoggerOptions
  ): Logger {
    const key = `${name}@${version || ''}:${options?.schemaUrl || ''}`;
    if (!this._loggers.has(key)) {
      this._loggers.set(
        key,
        new Logger(
          { name, version, schemaUrl: options?.schemaUrl },
          this._config,
          this
        )
      );
    }
    return this._loggers.get(key)!;
  }

  /**
   * Adds a new {@link LogRecordProcessor} to this logger.
   * @param processor the new LogRecordProcessor to be added.
   */
  public addLogRecordProcessor(processor: LogRecordProcessor) {
    if (this._registeredLogRecordProcessors.length === 0) {
      // since we might have enabled by default a batchProcessor, we disable it
      // before adding the new one
      this._activeProcessor
        .shutdown()
        .catch(err =>
          diag.error(
            'Error while trying to shutdown current log record processor',
            err
          )
        );
    }
    this._registeredLogRecordProcessors.push(processor);
    this._activeProcessor = new MultiLogRecordProcessor(
      this._registeredLogRecordProcessors,
      this._config.forceFlushTimeoutMillis!
    );
  }

  /**
   * Notifies all registered LogRecordProcessor to flush any buffered data.
   *
   * Returns a promise which is resolved when all flushes are complete.
   */
  public forceFlush(): Promise<void> {
    return this._activeProcessor.forceFlush();
  }

  /**
   * Flush all buffered data and shut down the LoggerProvider and all registered
   * LogRecordProcessor.
   *
   * Returns a promise which is resolved when all flushes are complete.
   */
  public shutdown(): Promise<void> {
    return this._activeProcessor.shutdown();
  }

  public getActiveLogRecordProcessor(): MultiLogRecordProcessor {
    return this._activeProcessor;
  }

  public getActiveLoggers(): Map<string, Logger> {
    return this._loggers;
  }
}

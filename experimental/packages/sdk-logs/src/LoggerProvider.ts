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
import { Resource } from '@opentelemetry/resources';
import { BindOnceFuture, merge } from '@opentelemetry/core';

import type { LoggerProviderConfig } from './types';
import type { LogRecordProcessor } from './LogRecordProcessor';
import type { LoggerSharedState } from './LoggerSharedState';
import { Logger } from './Logger';
import { loadDefaultConfig } from './config';
import { MultiLogRecordProcessor } from './MultiLogRecordProcessor';

export class LoggerProvider implements logsAPI.LoggerProvider {
  private readonly _loggerSharedState: LoggerSharedState;
  private readonly _loggers: Map<string, Logger> = new Map();
  private _shutdownOnceFeature: BindOnceFuture<void>;

  constructor(config: LoggerProviderConfig = {}) {
    const { resource, logRecordLimits, forceFlushTimeoutMillis } = merge(
      {},
      loadDefaultConfig(),
      config
    );
    this._shutdownOnceFeature = new BindOnceFuture(this._showdownFeature, this);
    this._loggerSharedState = {
      resource: Resource.default().merge(resource ?? Resource.empty()),
      activeProcessor: new MultiLogRecordProcessor(forceFlushTimeoutMillis),
      shutdownOnceFeature: this._shutdownOnceFeature,
      logRecordLimits,
    };
  }

  /**
   * Get a logger with the configuration of the LoggerProvider.
   */
  public getLogger(
    name: string,
    version?: string,
    options?: logsAPI.LoggerOptions
  ): Logger {
    const { schemaUrl = '', includeTraceContext = true } = options || {};
    const key = `${name}@${version || ''}:${schemaUrl}`;
    if (!this._loggers.has(key)) {
      this._loggers.set(
        key,
        new Logger({
          loggerSharedState: this._loggerSharedState,
          instrumentationScope: { name, version, schemaUrl },
          includeTraceContext,
        })
      );
    }
    return this._loggers.get(key)!;
  }

  /**
   * Adds a new {@link LogRecordProcessor} to this logger.
   * @param processor the new LogRecordProcessor to be added.
   */
  public addLogRecordProcessor(processor: LogRecordProcessor) {
    this._loggerSharedState.activeProcessor.addLogRecordProcessor(processor);
  }

  /**
   * Notifies all registered LogRecordProcessor to flush any buffered data.
   *
   * Returns a promise which is resolved when all flushes are complete.
   */
  public forceFlush(): Promise<void> {
    if (this._shutdownOnceFeature.isCalled) {
      return Promise.reject('can not flush, it is already shutdown');
    }
    return this._loggerSharedState.activeProcessor.forceFlush();
  }

  /**
   * Flush all buffered data and shut down the LoggerProvider and all registered
   * LogRecordProcessor.
   *
   * Returns a promise which is resolved when all flushes are complete.
   */
  public shutdown(): Promise<void> {
    return this._shutdownOnceFeature.call();
  }

  private _showdownFeature(): Promise<void> {
    return this._loggerSharedState.activeProcessor.shutdown();
  }
}

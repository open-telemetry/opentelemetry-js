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
import { merge } from '@opentelemetry/core';

import type { LoggerProviderConfig, LogRecordLimits } from './types';
import type { LogRecordProcessor } from './LogRecordProcessor';
import { Logger } from './Logger';
import { loadDefaultConfig } from './config';
import { MultiLogRecordProcessor } from './MultiLogRecordProcessor';

export class LoggerProvider implements logsAPI.LoggerProvider {
  private readonly _loggers: Map<string, Logger> = new Map();
  private readonly _resource: Resource;
  private readonly _logRecordLimits: LogRecordLimits;
  private readonly _activeProcessor: MultiLogRecordProcessor;

  constructor(config: LoggerProviderConfig = {}) {
    const { resource, logRecordLimits, forceFlushTimeoutMillis } = merge(
      {},
      loadDefaultConfig(),
      config
    );
    this._resource = Resource.default().merge(resource ?? Resource.empty());
    this._activeProcessor = new MultiLogRecordProcessor(
      forceFlushTimeoutMillis
    );
    this._logRecordLimits = logRecordLimits;
  }

  /**
   * Get a logger with the configuration of the LoggerProvider.
   */
  public getLogger(
    name: string,
    version?: string,
    options?: logsAPI.LoggerOptions
  ): Logger {
    const { schemaUrl = '', eventDomain } = options || {};
    const key = `${name}@${version || ''}:${schemaUrl}`;
    if (!this._loggers.has(key)) {
      this._loggers.set(
        key,
        new Logger({
          eventDomain,
          resource: this._resource,
          logRecordLimits: this._logRecordLimits,
          activeProcessor: this._activeProcessor,
          instrumentationScope: { name, version, schemaUrl },
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
    this._activeProcessor.addLogRecordProcessor(processor);
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
}

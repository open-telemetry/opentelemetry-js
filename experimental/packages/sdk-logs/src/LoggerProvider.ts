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
import { getEnv, merge } from '@opentelemetry/core';

import type { LoggerProviderConfig, LogRecordLimits } from './types';
import type { LogRecordProcessor } from './LogRecordProcessor';
import type { LogRecordExporter } from './export/LogRecordExporter';
import { Logger } from './Logger';
import { loadDefaultConfig } from './config';
import { MultiLogRecordProcessor } from './MultiLogRecordProcessor';
import { BatchLogRecordProcessor } from './platform/node/export/BatchLogRecordProcessor';
import { NoopLogRecordProcessor } from './export/NoopLogRecordProcessor';

export type EXPORTER_FACTORY = () => LogRecordExporter;

export class LoggerProvider implements logsAPI.LoggerProvider {
  protected static readonly _registeredExporters = new Map<
    string,
    EXPORTER_FACTORY
  >();

  public readonly resource: IResource;

  private readonly _loggers: Map<string, Logger> = new Map();
  private readonly _logRecordLimits: LogRecordLimits;
  private _activeProcessor: MultiLogRecordProcessor;
  private readonly _registeredLogRecordProcessors: LogRecordProcessor[] = [];
  private readonly _forceFlushTimeoutMillis;

  constructor(config: LoggerProviderConfig = {}) {
    const { resource, logRecordLimits, forceFlushTimeoutMillis } = merge(
      {},
      loadDefaultConfig(),
      config
    );
    this.resource = Resource.default().merge(resource ?? Resource.empty());
    this._logRecordLimits = logRecordLimits;
    this._forceFlushTimeoutMillis = forceFlushTimeoutMillis;

    const defaultExporter = this._buildExporterFromEnv();
    if (defaultExporter !== undefined) {
      this._activeProcessor = new MultiLogRecordProcessor(
        [new BatchLogRecordProcessor(defaultExporter)],
        forceFlushTimeoutMillis
      );
    } else {
      this._activeProcessor = new MultiLogRecordProcessor(
        [new NoopLogRecordProcessor()],
        forceFlushTimeoutMillis
      );
    }
  }

  /**
   * Get a logger with the configuration of the LoggerProvider.
   */
  public getLogger(
    name: string,
    version?: string,
    options?: logsAPI.LoggerOptions
  ): Logger {
    const { schemaUrl = '' } = options || {};
    const key = `${name}@${version || ''}:${schemaUrl}`;
    if (!this._loggers.has(key)) {
      this._loggers.set(
        key,
        new Logger({
          resource: this.resource,
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
      this._forceFlushTimeoutMillis
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

  protected _getLogRecordExporter(name: string): LogRecordExporter | undefined {
    return (this.constructor as typeof LoggerProvider)._registeredExporters.get(
      name
    )?.();
  }

  protected _buildExporterFromEnv(): LogRecordExporter | undefined {
    const exporterName = getEnv().OTEL_LOGS_EXPORTER;
    if (exporterName === 'none' || exporterName === '') {
      return;
    }
    const exporter = this._getLogRecordExporter(exporterName);
    if (!exporter) {
      diag.error(
        `Exporter "${exporterName}" requested through environment variable is unavailable.`
      );
    }
    return exporter;
  }
}

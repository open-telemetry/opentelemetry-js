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

import { Logger } from '@opentelemetry/api-logs';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { Resource } from '@opentelemetry/resources';
import type { InstrumentationScope } from '@opentelemetry/core';
import { LogRecordProcessor } from '../LogRecordProcessor';
import { LogRecordLimits, LoggerConfig, LoggerConfigurator } from '../types';
import { NoopLogRecordProcessor } from '../export/NoopLogRecordProcessor';
import { MultiLogRecordProcessor } from '../MultiLogRecordProcessor';

const DEFAULT_LOGGER_CONFIG: Required<LoggerConfig> = {
  disabled: false,
  minimumSeverity: SeverityNumber.UNSPECIFIED,
  traceBased: false,
};

/**
 * Default LoggerConfigurator that returns the default config for all loggers
 */
const DEFAULT_LOGGER_CONFIGURATOR: LoggerConfigurator = () => ({
  ...DEFAULT_LOGGER_CONFIG,
});

export class LoggerProviderSharedState {
  readonly loggers: Map<string, Logger> = new Map();
  activeProcessor: LogRecordProcessor;
  readonly registeredLogRecordProcessors: LogRecordProcessor[] = [];
  private _loggerConfigurator: LoggerConfigurator;
  private _loggerConfigs: Map<string, Required<LoggerConfig>> = new Map();

  constructor(
    readonly resource: Resource,
    readonly forceFlushTimeoutMillis: number,
    readonly logRecordLimits: Required<LogRecordLimits>,
    readonly processors: LogRecordProcessor[],
    loggerConfigurator?: LoggerConfigurator
  ) {
    if (processors.length > 0) {
      this.registeredLogRecordProcessors = processors;
      this.activeProcessor = new MultiLogRecordProcessor(
        this.registeredLogRecordProcessors,
        this.forceFlushTimeoutMillis
      );
    } else {
      this.activeProcessor = new NoopLogRecordProcessor();
    }

    this._loggerConfigurator =
      loggerConfigurator ?? DEFAULT_LOGGER_CONFIGURATOR;
  }

  /**
   * Get the LoggerConfig for a given instrumentation scope.
   * Uses the LoggerConfigurator function to compute the config on first access
   * and caches the result.
   */
  getLoggerConfig(
    instrumentationScope: InstrumentationScope
  ): Required<LoggerConfig> {
    const key = this._getScopeKey(instrumentationScope);

    // Return cached config if available
    let config = this._loggerConfigs.get(key);
    if (config) {
      return config;
    }

    // Compute config using the configurator
    // The configurator always returns a complete config
    config = this._loggerConfigurator(instrumentationScope);

    // Cache the result
    this._loggerConfigs.set(key, config);

    return config;
  }

  private _getScopeKey(scope: InstrumentationScope): string {
    return `${scope.name}@${scope.version || ''}:${scope.schemaUrl || ''}`;
  }
}

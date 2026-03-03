/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '@opentelemetry/api-logs';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { Resource } from '@opentelemetry/resources';
import type { InstrumentationScope } from '@opentelemetry/core';
import { LogRecordProcessor } from '../LogRecordProcessor';
import { LogRecordLimits, LoggerConfig, LoggerConfigurator } from '../types';
import { NoopLogRecordProcessor } from '../export/NoopLogRecordProcessor';
import { MultiLogRecordProcessor } from '../MultiLogRecordProcessor';
import { getInstrumentationScopeKey } from './utils';

const DEFAULT_LOGGER_CONFIG: Required<LoggerConfig> = {
  disabled: false,
  minimumSeverity: SeverityNumber.UNSPECIFIED,
  traceBased: false,
};

/**
 * Default LoggerConfigurator that returns the default config for all loggers
 */
export const DEFAULT_LOGGER_CONFIGURATOR: LoggerConfigurator = () => ({
  ...DEFAULT_LOGGER_CONFIG,
});

export class LoggerProviderSharedState {
  readonly loggers: Map<string, Logger> = new Map();
  activeProcessor: LogRecordProcessor;
  readonly registeredLogRecordProcessors: LogRecordProcessor[] = [];
  readonly resource: Resource;
  readonly forceFlushTimeoutMillis: number;
  readonly logRecordLimits: Required<LogRecordLimits>;
  readonly processors: LogRecordProcessor[];
  private _loggerConfigurator: LoggerConfigurator;
  private _loggerConfigs: Map<string, Required<LoggerConfig>> = new Map();

  constructor(
    resource: Resource,
    forceFlushTimeoutMillis: number,
    logRecordLimits: Required<LogRecordLimits>,
    processors: LogRecordProcessor[],
    loggerConfigurator?: LoggerConfigurator
  ) {
    this.resource = resource;
    this.forceFlushTimeoutMillis = forceFlushTimeoutMillis;
    this.logRecordLimits = logRecordLimits;
    this.processors = processors;
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
   *
   * @experimental This feature is in development as per the OpenTelemetry specification.
   */
  getLoggerConfig(
    instrumentationScope: InstrumentationScope
  ): Required<LoggerConfig> {
    const key = getInstrumentationScopeKey(instrumentationScope);

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
}

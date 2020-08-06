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
  Logger,
  TracerProvider,
  MeterProvider,
  trace,
  metrics,
} from '@opentelemetry/api';
import { LogLevel } from './types';
import { ConsoleLogger } from './ConsoleLogger';
import { getEnv } from '../platform';

/**
 * PluginManagerConfig provides an interface for the config being passed to a PluginEnabler
 */
export interface PluginManagerConfig {
  /**
   * Tracer provider for the PluginEnabler
   */
  tracerProvider?: TracerProvider;

  /**
   * Meter Provider for the PluginEnabler
   */
  meterProvider?: MeterProvider;

  /**
   * Logger for PluginEnabler
   */
  logger?: Logger;

  /**
   * Level of logger
   */
  logLevel?: LogLevel;
}

export class PluginManager {
  readonly logger: Logger;
  readonly meterProvider: MeterProvider;
  readonly tracerProvider: TracerProvider;

  constructor(config: PluginManagerConfig = {}) {
    this.logger =
      config.logger ??
      new ConsoleLogger(config.logLevel ?? getEnv().OTEL_LOG_LEVEL);
    this.tracerProvider = config.tracerProvider ?? trace.getTracerProvider();
    this.meterProvider = config.meterProvider ?? metrics.getMeterProvider();
  }
}

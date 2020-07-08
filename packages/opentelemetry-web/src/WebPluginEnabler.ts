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
import { BasePlugin } from '@opentelemetry/core';
import {
  Logger,
  TracerProvider,
  MeterProvider,
  NoopTracerProvider,
  NoopMeterProvider,
} from '@opentelemetry/api';
import { ConsoleLogger, LogLevel } from '@opentelemetry/core';

/**
 * WebPluginEnablerConfig provides an interface for passing plugins to the WebPluginEnabler
 */
interface WebPluginEnablerConfig {
  /**
   * List of plugins to be enabled
   */
  plugins: BasePlugin<unknown>[];

  /**
   * Tracer provider for the plugins
   */
  tracerProvider: TracerProvider;

  /**
   * Meter Provider for the plugins;
   */
  meterProvider: MeterProvider;

  /**
   * Logger for plugins
   */
  logger?: Logger;

  /**
   * Level of logger
   */
  logLevel?: LogLevel;
}

export class WebPluginEnabler {
  readonly logger: Logger;
  readonly meterProvider: MeterProvider;
  readonly tracerProvider: TracerProvider;

  /**
   * Constructs a plugin enabler and automatically enables given plugins
   */
  constructor(config: WebPluginEnablerConfig) {
    this.logger =
      config.logger ?? new ConsoleLogger(config.logLevel ?? LogLevel.INFO);
    this.tracerProvider = config.tracerProvider ?? new NoopTracerProvider();
    this.meterProvider = config.meterProvider ?? new NoopMeterProvider();
  }

  /**
   * Enables the given plugins
   * @param plugins
   */
  enable(plugins: BasePlugin<unknown>[]) {
    for (const plugin of plugins) {
      plugin.enable([], this.tracerProvider, this.meterProvider, this.logger);
    }
  }
}

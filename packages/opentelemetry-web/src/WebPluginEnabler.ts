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
  BasePlugin,
  PluginManager,
  PluginManagerConfig,
} from '@opentelemetry/core';

/**
 * WebPluginManagerConfig provides an interface for passing plugins to the WebPluginManager
 */
interface WebPluginManagerConfig extends PluginManagerConfig {
  /**
   * Plugins to be enabled
   */
  plugins: BasePlugin<unknown>[];
}

export class WebPluginManager extends PluginManager {
  /**
   * Constructs a plugin enabler and automatically enables given plugins
   */
  constructor(config: WebPluginManagerConfig) {
    super(config);
    this.enable(config.plugins);
  }

  /**
   * Enables the given plugins
   * @param plugins
   */
  enable(plugins: BasePlugin<unknown>[]) {
    for (const plugin of plugins) {
      plugin.enable(
        [],
        this.tracerProvider,
        this.logger,
        undefined,
        this.meterProvider
      );
    }
  }
}

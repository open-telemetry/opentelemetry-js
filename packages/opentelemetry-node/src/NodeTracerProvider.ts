/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import {
  BasicTracerProvider,
  SDKRegistrationConfig,
} from '@opentelemetry/tracing';
import { DEFAULT_INSTRUMENTATION_PLUGINS, NodeTracerConfig } from './config';
import { PluginLoader, Plugins } from './instrumentation/PluginLoader';

/**
 * Register this TracerProvider for use with the OpenTelemetry API.
 * Undefined values may be replaced with defaults, and
 * null values will be skipped.
 *
 * @param config Configuration object for SDK registration
 */
export class NodeTracerProvider extends BasicTracerProvider {
  private readonly _pluginLoader: PluginLoader;

  /**
   * Constructs a new Tracer instance.
   */
  constructor(config: NodeTracerConfig = {}) {
    super(config);

    this._pluginLoader = new PluginLoader(this, this.logger);

    /**
     * For user supplied config of plugin(s) that are loaded by default,
     * merge the user supplied and default configs of said plugin(s)
     */
    let mergedUserSuppliedPlugins: Plugins = {};

    for (const pluginName in config.plugins) {
      if (DEFAULT_INSTRUMENTATION_PLUGINS.hasOwnProperty(pluginName)) {
        mergedUserSuppliedPlugins[pluginName] = {
          ...DEFAULT_INSTRUMENTATION_PLUGINS[pluginName],
          ...config.plugins[pluginName],
        };
      } else {
        mergedUserSuppliedPlugins[pluginName] = config.plugins[pluginName];
        // enable user-supplied plugins unless explicitly disabled
        if (mergedUserSuppliedPlugins[pluginName].enabled === undefined) {
          mergedUserSuppliedPlugins[pluginName].enabled = true;
        }
      }
    }

    const mergedPlugins: Plugins = {
      ...DEFAULT_INSTRUMENTATION_PLUGINS,
      ...mergedUserSuppliedPlugins,
    };

    this._pluginLoader.load(mergedPlugins);
  }

  stop() {
    this._pluginLoader.unload();
  }

  register(config: SDKRegistrationConfig = {}) {
    if (config.contextManager === undefined) {
      config.contextManager = new AsyncHooksContextManager();
      config.contextManager.enable();
    }

    super.register(config);
  }
}

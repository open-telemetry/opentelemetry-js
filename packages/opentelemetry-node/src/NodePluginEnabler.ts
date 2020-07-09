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
import { PluginEnabler } from '@opentelemetry/core';
import { NodePluginEnablerConfig } from './config';
import { DEFAULT_INSTRUMENTATION_PLUGINS } from './config';
import { PluginLoader, Plugins } from './instrumentation/PluginLoader';

export class NodePluginEnabler extends PluginEnabler {
  private readonly _pluginLoader: PluginLoader;

  constructor(config: NodePluginEnablerConfig) {
    super(config);

    this._pluginLoader = new PluginLoader(
      this.tracerProvider,
      this.meterProvider,
      this.logger
    );

    config.plugins
      ? this._pluginLoader.load(
          this._mergePlugins(DEFAULT_INSTRUMENTATION_PLUGINS, config.plugins)
        )
      : this._pluginLoader.load(DEFAULT_INSTRUMENTATION_PLUGINS);
  }

  stop() {
    this._pluginLoader.unload();
  }

  /**
   * Two layer merge.
   * First, for user supplied config of plugin(s) that are loaded by default,
   * merge the user supplied and default configs of said plugin(s).
   * Then merge the results with the default plugins.
   * @returns 2-layer deep merge of default and user supplied plugins.
   */
  private _mergePlugins(
    defaultPlugins: Plugins,
    userSuppliedPlugins: Plugins
  ): Plugins {
    const mergedUserSuppliedPlugins: Plugins = {};

    for (const pluginName in userSuppliedPlugins) {
      mergedUserSuppliedPlugins[pluginName] = {
        // Any user-supplied non-default plugin should be enabled by default
        ...(DEFAULT_INSTRUMENTATION_PLUGINS[pluginName] || { enabled: true }),
        ...userSuppliedPlugins[pluginName],
      };
    }

    const mergedPlugins: Plugins = {
      ...defaultPlugins,
      ...mergedUserSuppliedPlugins,
    };

    return mergedPlugins;
  }
}

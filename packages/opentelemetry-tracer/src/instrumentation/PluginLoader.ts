/**
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

import { Tracer, Logger, Plugin } from '@opentelemetry/types';
import * as utils from './utils';
import * as hook from 'require-in-the-middle';

export interface PluginNames {
  [pluginName: string]: string;
}

// States for the Plugin Loader
export enum HookState {
  NO_HOOK,
  ACTIVATED,
  DEACTIVATED,
}

/**
 * The PluginLoader class can load instrumentation plugins that
 * use a patch mechanism to enable automatic tracing for
 * specific target modules.
 */
export class PluginLoader {
  /** A list of loaded plugins. */
  private _plugins: Plugin[] = [];
  /**
   * A field that tracks whether the require-in-the-middle hook has been loaded
   * for the first time, as well as whether the hook body is activated or not.
   */
  private _hookState = HookState.NO_HOOK;

  /** Constructs a new PluginLoader instance. */
  constructor(readonly tracer: Tracer, readonly logger: Logger) {}

  /**
   * Returns a PluginNames object, build from a string array of target modules
   * names, using the defaultPackageName.
   * @param modulesToPatch A list of modules to patch.
   */
  patch(modulesToPatch: string[]) {
    const plugins = modulesToPatch.reduce(
      (plugins: PluginNames, moduleName: string) => {
        plugins[moduleName] = utils.defaultPackageName(moduleName);
        return plugins;
      },
      {} as PluginNames
    );
    this._loadPlugins(plugins);
  }

  unpatch() {
    this._unloadPlugins();
    this._plugins = [];
    this._hookState = HookState.DEACTIVATED;
  }

  private _loadPlugins(pluginList: PluginNames) {
    if (this._hookState === HookState.NO_HOOK) {
      const modulesToHook = Object.keys(pluginList);
      // Do not hook require when no module is provided. In this case it is
      // not necessary. With skipping this step we lower our footprint in
      // customer applications and require-in-the-middle won't show up in CPU
      // frames.
      if (modulesToHook.length === 0) {
        this._hookState = HookState.DEACTIVATED;
        return;
      }

      hook(modulesToHook, (exports, name, basedir) => {
        if (this._hookState !== HookState.ACTIVATED) return exports;

        const moduleName = pluginList[name];
        const version = utils.getPackageVersion(this.logger, basedir as string);
        this.logger.info(
          `PluginLoader#loadPlugins: trying loading ${name}.${version}`
        );
        if (!version) return exports;

        this.logger.debug(
          `PluginLoader#loadPlugins: applying patch to ${name}@${version} using ${moduleName} module`
        );

        // Expecting a plugin from module;
        try {
          const plugin: Plugin = require(moduleName).plugin;
          this._plugins.push(plugin);
          return plugin.enable(exports, this.tracer);
        } catch (e) {
          this.logger.error(
            `PluginLoader#loadPlugins: could not load plugin ${moduleName} of module ${name}. Error: ${e.message}`
          );
          return exports;
        }
      });
    }
    this._hookState = HookState.ACTIVATED;
  }

  /** Unloads plugins. */
  private _unloadPlugins() {
    for (const plugin of this._plugins) {
      plugin.disable();
    }
  }

  /**
   * Adds a search path for plugin modules. Intended for testing purposes only.
   * @param searchPath The path to add.
   */
  static set searchPathForTest(searchPath: string) {
    module.paths.push(searchPath);
  }
}

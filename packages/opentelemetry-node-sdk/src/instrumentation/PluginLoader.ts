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

import {
  Logger,
  Plugin,
  Tracer,
  PluginConfig,
  PluginInternalPatch,
} from '@opentelemetry/types';
import * as hook from 'require-in-the-middle';
import * as utils from './utils';

// States for the Plugin Loader
export enum HookState {
  UNINITIALIZED,
  ENABLED,
  DISABLED,
}

export interface Plugins {
  [pluginName: string]: PluginConfig;
}

type PluginInternalModuleInfo = {
  [key: string]: { patch: PluginInternalPatch; plugin: Plugin };
};

/**
 * Returns the Plugins object that meet the below conditions.
 * Valid criteria: 1. It should be enabled. 2. Should have non-empty path.
 */
function filterPlugins(plugins: Plugins): Plugins {
  const keys = Object.keys(plugins);
  return keys.reduce((acc: Plugins, key: string) => {
    if (plugins[key].enabled && plugins[key].path) acc[key] = plugins[key];
    return acc;
  }, {});
}

/**
 * The PluginLoader class can load instrumentation plugins that use a patch
 * mechanism to enable automatic tracing for specific target modules.
 */
export class PluginLoader {
  /** A list of loaded plugins. */
  private _plugins: Plugin[] = [];
  /**
   * A field that tracks whether the require-in-the-middle hook has been loaded
   * for the first time, as well as whether the hook body is activated or not.
   */
  private _hookState = HookState.UNINITIALIZED;

  /** Constructs a new PluginLoader instance. */
  constructor(readonly tracer: Tracer, readonly logger: Logger) {}

  /**
   * Loads a list of plugins. Each plugin module should implement the core
   * {@link Plugin} interface and export an instance named as 'plugin'. This
   * function will attach a hook to be called the first time the module is
   * loaded.
   * @param Plugins an object whose keys are plugin names and whose
   *     {@link PluginConfig} values indicate several configuration options.
   */
  load(plugins: Plugins): PluginLoader {
    if (this._hookState === HookState.UNINITIALIZED) {
      const pluginsToLoad = filterPlugins(plugins);
      const modulesToHook = Object.keys(pluginsToLoad);
      const pluginModules: { [key: string]: Plugin } = {};
      const internalPatches: PluginInternalModuleInfo = {};

      for (const pluginName of modulesToHook) {
        try {
          const modulePath = pluginsToLoad[pluginName].path!;
          const plugin: Plugin = require(modulePath).plugin;
          pluginModules[modulePath] = plugin;

          // Group together things needed for internal module patching
          Object.assign(
            internalPatches,
            searchForValidInternalModules(plugin, pluginName)
          );
        } catch (e) {
          this.logger.error(
            `PluginLoader#load: could not load plugin ${pluginName}. Error: ${e.message}`
          );
        }
      }

      // Do not hook require when no module is provided. In this case it is
      // not necessary. With skipping this step we lower our footprint in
      // customer applications and require-in-the-middle won't show up in CPU
      // frames.
      if (modulesToHook.length === 0) {
        this._hookState = HookState.DISABLED;
        return this;
      }

      // Enable the require hook.
      hook(modulesToHook, { internals: true }, (exports, name, baseDir) => {
        if (this._hookState !== HookState.ENABLED) return exports;

        if (internalPatches[name]) {
          // Patch the internal module and return
          this.logger.debug(
            `PluginLoader#load: trying to patch internal module ${name}`
          );
          const internalPatch = internalPatches[name];
          return internalPatch.patch.call(
            internalPatch.plugin,
            exports as never
          );
        } else if (!pluginsToLoad[name]) {
          // Return the internal module as is
          return exports;
        }

        const config = pluginsToLoad[name];
        const modulePath = config.path!;
        const plugin: Plugin = pluginModules[modulePath];
        let version = null;

        if (!baseDir) {
          // basedir is the directory where the module is located,
          // or undefined for core modules.
          // lets plugins restrict what they support for core modules (see plugin.supportedVersions)
          version = process.versions.node;
        } else {
          // Get the module version.
          version = utils.getPackageVersion(this.logger, baseDir);
        }

        this.logger.info(
          `PluginLoader#load: trying loading ${name}@${version}`
        );

        if (!version) return exports;

        this.logger.debug(
          `PluginLoader#load: applying patch to ${name}@${version} using ${modulePath} module`
        );

        // Expecting a plugin from module;
        try {
          if (!utils.isSupportedVersion(version, plugin.supportedVersions)) {
            return exports;
          }

          this._plugins.push(plugin);
          // Enable each supported plugin.
          return plugin.enable(exports, this.tracer, this.logger, config);
        } catch (e) {
          this.logger.error(
            `PluginLoader#load: could not load plugin ${modulePath} of module ${name}. Error: ${e.message}`
          );
          return exports;
        }
      });
      this._hookState = HookState.ENABLED;
    } else if (this._hookState === HookState.DISABLED) {
      this.logger.error(
        'PluginLoader#load: Currently cannot re-enable plugin loader.'
      );
    } else {
      this.logger.error('PluginLoader#load: Plugin loader already enabled.');
    }
    return this;
  }

  /** Unloads plugins. */
  unload(): PluginLoader {
    if (this._hookState === HookState.ENABLED) {
      for (const plugin of this._plugins) {
        plugin.disable();
      }
      this._plugins = [];
      this._hookState = HookState.DISABLED;
    }
    return this;
  }
}

/**
 * Adds a search path for plugin modules. Intended for testing purposes only.
 * @param searchPath The path to add.
 */
export function searchPathForTest(searchPath: string) {
  module.paths.push(searchPath);
}

/**
 * Group together fields needed to perform internal module patching
 * @param plugin plugin which implements getInternalPatch
 * @param pluginName name of the plugin, e.g. grpc, http
 */
function searchForValidInternalModules(
  plugin: Plugin,
  pluginName: string
): PluginInternalModuleInfo {
  const internalPatches: PluginInternalModuleInfo = {};
  if (plugin.internalFilesList && plugin.getInternalPatch) {
    Object.keys(plugin.internalFilesList).forEach(fname => {
      const ritmName = `${pluginName}/${fname}`;
      internalPatches[ritmName] = {
        patch: plugin.getInternalPatch!(fname) as never,
        plugin: plugin,
      };
    });
  }
  return internalPatches;
}

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

import { Logger, TracerProvider } from '@opentelemetry/api';

export interface NodePlugins {
  [pluginName: string]: OldPluginConfig;
}

export interface NodePluginsTracerConfiguration {
  plugins: NodePlugins;
}

/** Interface Plugin to apply patch. */
export interface OldClassPlugin<T = any> {
  /**
   * Contains all supported versions.
   * All versions must be compatible with [semver](https://semver.org/spec/v2.0.0.html) format.
   * If the version is not supported, we won't apply instrumentation patch (see `enable` method).
   * If omitted, all versions of the module will be patched.
   */
  supportedVersions?: string[];

  /**
   * Name of the module that the plugin instrument.
   */
  moduleName: string;

  /**
   * Method that enables the instrumentation patch.
   * @param moduleExports The value of the `module.exports` property that would
   *     normally be exposed by the required module. ex: `http`, `https` etc.
   * @param TracerProvider a tracer provider.
   * @param logger a logger instance.
   * @param [config] an object to configure the plugin.
   */
  enable(
    moduleExports: T,
    TracerProvider: TracerProvider,
    logger: Logger,
    config?: OldPluginConfig
  ): T;

  /** Method to disable the instrumentation  */
  disable(): void;
}

export interface OldPluginConfig {
  /**
   * Whether to enable the plugin.
   * @default true
   */
  enabled?: boolean;

  /**
   * Path of the trace plugin to load.
   * @default '@opentelemetry/plugin-http' in case of http.
   */
  path?: string;

  /**
   * Plugin to load
   * @example import {plugin} from '@opentelemetry/plugin-http' in case of http.
   */
  plugin?: OldClassPlugin;

  /**
   * Request methods that match any string in ignoreMethods will not be traced.
   */
  ignoreMethods?: string[];

  /**
   * URLs that partially match any regex in ignoreUrls will not be traced.
   * In addition, URLs that are _exact matches_ of strings in ignoreUrls will
   * also not be traced.
   */
  ignoreUrls?: Array<string | RegExp>;

  /**
   * List of internal files that need patch and are not exported by
   * default.
   */
  internalFilesExports?: PluginInternalFiles;

  /**
   * If true, additional information about query parameters and
   * results will be attached (as `attributes`) to spans representing
   * database operations.
   */
  enhancedDatabaseReporting?: boolean;
}

export interface PluginInternalFilesVersion {
  [pluginName: string]: string;
}

/**
 * Each key should be the name of the module to trace, and its value
 * a mapping of a property name to a internal plugin file name.
 */
export interface PluginInternalFiles {
  [versions: string]: PluginInternalFilesVersion;
}

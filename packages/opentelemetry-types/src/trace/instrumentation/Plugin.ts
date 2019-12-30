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

import { ClientRequest, IncomingMessage, ServerResponse } from "http";
import { Logger } from '../../common/Logger';
import { Span } from '../span';
import { Tracer } from '../tracer';


/** Interface Plugin to apply patch. */
export interface Plugin<T = any> {
  /**
   * Contains all supported versions.
   * All versions must be compatible with [semver](https://semver.org/spec/v2.0.0.html) format.
   * If the version is not supported, we won't apply instrumentation patch (see `enable` method).
   * If omitted, all versions of the module will be patched.
   */
  supportedVersions?: string[];

  /**
   * Method that enables the instrumentation patch.
   * @param moduleExports The value of the `module.exports` property that would
   *     normally be exposed by the required module. ex: `http`, `https` etc.
   * @param tracer a tracer instance.
   * @param logger a logger instance.
   * @param [config] an object to configure the plugin.
   */
  enable(
    moduleExports: T,
    tracer: Tracer,
    logger: Logger,
    config?: PluginOptions
  ): T;

  /** Method to disable the instrumentation  */
  disable(): void;
}

export interface PluginConfig {
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
   * These plugin options override the values provided in the
   * shared plugin options section.
   */
  options?: PluginOptions;
}

export type IgnoreMatcher = string | RegExp | ((url: string) => boolean);

/**
 * These options are used by database plugins like mysql, pg, and mongodb.
 */
export interface DatabasePluginOptions {
  /**
   * If true, additional information about query parameters and
   * results will be attached (as `attributes`) to spans representing
   * database operations.
   */
  enhancedDatabaseReporting?: boolean;
}

/**
 * These options are used by dns module plugins.
 */
export interface DNSPluginOptions {
  /**
   * Used by dns plugin. Ignores tracing for host names which match one of
   * the configured matchers by either being an exact string match, matching
   * a regular expression, or evaluating to true.
   */
  ignoreHostnames?: IgnoreMatcher[];
}

export interface HttpCustomAttributeFunction {
  (
    span: Span,
    request: ClientRequest | IncomingMessage,
    response: IncomingMessage | ServerResponse
  ): void;
}

/**
 * These options are used by http plugins like http, https, and http2.
 */
export interface HttpPluginOptions {
  ignoreIncomingPaths?: IgnoreMatcher[];
  ignoreOutgoingUrls?: IgnoreMatcher[];
  applyCustomAttributesOnSpan?: HttpCustomAttributeFunction;
}

/**
 * This is a configuration section where plugin authors
 * can define their own custom configuration options.
 */
export interface CustomPluginOptions {
  [key: string]: number | string | boolean | undefined;
}

export interface PluginOptions {
  database?: DatabasePluginOptions;
  dns?: DNSPluginOptions;
  http?: HttpPluginOptions;
  custom?: CustomPluginOptions;
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

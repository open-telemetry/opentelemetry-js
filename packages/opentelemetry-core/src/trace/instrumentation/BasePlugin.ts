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

import { Tracer, Plugin, Logger, PluginConfig } from '@opentelemetry/types';

/** This class represent the base to patch plugin. */
export abstract class BasePlugin<T> implements Plugin<T> {
  protected _moduleExports!: T;
  protected _tracer!: Tracer;
  protected _logger!: Logger;
  protected _config!: PluginConfig;
  supportedVersions?: string[];

  enable(
    moduleExports: T,
    tracer: Tracer,
    logger: Logger,
    config?: PluginConfig
  ): T {
    this._moduleExports = moduleExports;
    this._tracer = tracer;
    this._logger = logger;
    if (config) this._config = config;
    return this.patch();
  }

  disable(): void {
    this.unpatch();
  }

  protected abstract patch(): T;
  protected abstract unpatch(): void;
}

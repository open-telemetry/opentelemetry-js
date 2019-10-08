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

import { BasicTracer } from '@opentelemetry/tracing';
import { AsyncHooksScopeManager } from '@opentelemetry/scope-async-hooks';
import { PluginLoader } from './instrumentation/PluginLoader';
import { NodeTracerConfig, DEFAULT_INSTRUMENTATION_PLUGINS } from './config';

/**
 * This class represents a node tracer with `async_hooks` module.
 */
export class NodeTracer extends BasicTracer {
  private readonly _pluginLoader: PluginLoader;

  /**
   * Constructs a new Tracer instance.
   */
  constructor(config: NodeTracerConfig = {}) {
    if (config.scopeManager === undefined) {
      config.scopeManager = new AsyncHooksScopeManager();
      config.scopeManager.enable();
    }
    super(Object.assign({ scopeManager: config.scopeManager }, config));

    this._pluginLoader = new PluginLoader(this, this.logger);
    this._pluginLoader.load(config.plugins || DEFAULT_INSTRUMENTATION_PLUGINS);
  }

  stop() {
    this._pluginLoader.unload();
  }
}

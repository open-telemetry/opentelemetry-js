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

import { BasicTracer, BasicTracerConfig } from '@opentelemetry/basic-tracer';
import { AsyncHooksScopeManager } from '@opentelemetry/scope-async-hooks';
import { PluginLoader } from './instrumentation/PluginLoader';
import { Tracer } from '@opentelemetry/types';
import { NoopLogger } from '@opentelemetry/core';

const DEFAULT_INSTRUMENTATION_MODULES = {
  http: false, // TODO: change to true after pull/161
  grpc: false,
};

/**
 * This class represents a node tracer with `async_hooks` module.
 */
export class NodeTracer extends BasicTracer {
  private _pluginLoader!: PluginLoader;

  /**
   * Constructs a new Tracer instance.
   */
  constructor() {
    super();
  }

  /**
   * Starts tracing.
   * @param config A configuration object to start tracer.
   * @returns The started tracer instance.
   */
  start(config: BasicTracerConfig): Tracer {
    super.start(
      Object.assign({}, { scopeManager: new AsyncHooksScopeManager() }, config)
    );
    this._pluginLoader = new PluginLoader(
      this,
      config.logger || new NoopLogger()
    );
    // TODO: allow overriding default instrumented modules
    this._pluginLoader.load(DEFAULT_INSTRUMENTATION_MODULES);
    return this;
  }

  stop() {
    super.stop();
    this._pluginLoader.unload();
  }
}

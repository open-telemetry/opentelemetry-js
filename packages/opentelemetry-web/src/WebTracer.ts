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

import { BasePlugin } from '@opentelemetry/core';
import { BasicTracer, BasicTracerConfig } from '@opentelemetry/tracing';
import { StackScopeManager } from './StackScopeManager';

/**
 * WebTracerConfig provides an interface for configuring a Web Tracer.
 */
export interface WebTracerConfig extends BasicTracerConfig {
  /**
   * plugins to be used with tracer, they will be enabled automatically
   */
  plugins?: BasePlugin<unknown>[];
}

/**
 * This class represents a web tracer with {@link StackScopeManager}
 */
export class WebTracer extends BasicTracer {
  /**
   * Constructs a new Tracer instance.
   * @param config Web Tracer config
   */
  constructor(config: WebTracerConfig = {}) {
    if (typeof config.scopeManager === 'undefined') {
      config.scopeManager = new StackScopeManager();
    }
    if (typeof config.plugins === 'undefined') {
      config.plugins = [];
    }
    super(Object.assign({}, { scopeManager: config.scopeManager }, config));

    config.scopeManager.enable();

    for (const plugin of config.plugins) {
      plugin.enable([], this, this.logger);
    }
  }
}

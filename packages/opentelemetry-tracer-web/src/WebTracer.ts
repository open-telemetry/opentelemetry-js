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

import { BasicTracer, BasicTracerConfig } from '@opentelemetry/basic-tracer';
import { StackScopeManager } from './StackScopeManager';
/**
 * BasicTracerConfig provides an interface for configuring a Web Tracer.
 */
// export interface WebTracerConfig extends BasicTracerConfig {}

export interface WebTracerConfig extends Partial<BasicTracerConfig> {
  scopeManager?: StackScopeManager;
}
//
/**
 * This class represents a web tracer with `async_hooks` module.
 */
export class WebTracer extends BasicTracer {
  /**
   * Constructs a new Tracer instance.
   */
  constructor(config: WebTracerConfig = {}) {
    if (typeof config.scopeManager === 'undefined') {
      config.scopeManager = new StackScopeManager();
    }
    config.scopeManager.enable();
    super(Object.assign({}, { scopeManager: config.scopeManager }, config));
  }
}

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

import { WebTracer, WebTracerConfig } from './WebTracer';
import { BasicTracerFactory } from '@opentelemetry/tracing';

/**
 * WebTracerFactory produces named tracers.
 */
export class WebTracerFactory extends BasicTracerFactory {
  private readonly _webConfig?: WebTracerConfig;

  constructor(config?: WebTracerConfig) {
    super();
    this._webConfig = config;
  }

  protected _newTracer(): WebTracer {
    return new WebTracer(this._webConfig);
  }
}

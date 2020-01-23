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

import { ConsoleLogger } from '@opentelemetry/core';
import * as types from '@opentelemetry/types';
import { SpanProcessor, Tracer } from '.';
import { DEFAULT_CONFIG } from './config';
import { MultiSpanProcessor } from './MultiSpanProcessor';
import { NoopSpanProcessor } from './NoopSpanProcessor';
import { TracerConfig } from './types';

/**
 * This class represents a basic tracer registry which platform libraries can extend
 */
export class BasicTracerRegistry implements types.TracerRegistry {
  private readonly _registeredSpanProcessors: SpanProcessor[] = [];
  private readonly _tracers: Map<string, Tracer> = new Map();

  activeSpanProcessor = new NoopSpanProcessor();
  readonly logger: types.Logger;

  constructor(private _config: TracerConfig = DEFAULT_CONFIG) {
    this.logger = _config.logger || new ConsoleLogger(_config.logLevel);
  }

  getTracer(name: string, version = '*', config?: TracerConfig): Tracer {
    const key = `${name}@${version}`;
    if (!this._tracers.has(key)) {
      this._tracers.set(key, new Tracer(config || this._config, this));
    }

    return this._tracers.get(key)!;
  }

  /**
   * Adds a new {@link SpanProcessor} to this tracer.
   * @param spanProcessor the new SpanProcessor to be added.
   */
  addSpanProcessor(spanProcessor: SpanProcessor): void {
    this._registeredSpanProcessors.push(spanProcessor);
    this.activeSpanProcessor = new MultiSpanProcessor(
      this._registeredSpanProcessors
    );
  }

  getActiveSpanProcessor(): SpanProcessor {
    return this.activeSpanProcessor;
  }
}

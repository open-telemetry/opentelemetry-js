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

import { ConsoleLogger, noopTracer, NoopTracer } from '@opentelemetry/core';
import * as types from '@opentelemetry/types';
import { SpanProcessor, Tracer } from '.';
import { DEFAULT_CONFIG } from './config';
import { MultiSpanProcessor } from './MultiSpanProcessor';
import { NoopSpanProcessor } from './NoopSpanProcessor';
import { TracerConfig } from './types';
import * as semver from 'semver';

/**
 * This class represents a basic tracer registry which platform libraries can extend
 */
export class BasicTracerRegistry implements types.TracerRegistry {
  private readonly _registeredSpanProcessors: SpanProcessor[] = [];

  activeSpanProcessor = new NoopSpanProcessor();
  readonly logger: types.Logger;

  constructor(private _config: TracerConfig = DEFAULT_CONFIG) {
    this.logger = _config.logger || new ConsoleLogger(_config.logLevel);
  }

  /**
   * Given a name, version, and configuration object, create and return a
   * Tracer. If the provided name and version match an entry in the disabled
   * libraries configuration, a NoopTracer is returned.
   *
   * @param name name of the instrumentation library acquiring the tracer
   * @param version version of the instrumentation library acquiring the tracer
   * @param config configuration object to be provided to the tracer
   */
  getTracer(
    name: string,
    version?: string,
    config?: TracerConfig
  ): Tracer | NoopTracer {
    if (this._isDisabled(name, version)) {
      return noopTracer;
    }

    return new Tracer(config || this._config, this);
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

  /**
   * Given a name and optional version of an instrumentation library, determine
   * if it is configured to be disabled.
   *
   * @param name name of instrumentation library acquiring tracer
   * @param version version of instrumentation library acquiring tracer
   */
  private _isDisabled(name: string, version?: string) {
    if (this._config.disabledLibraries) {
      for (const lib of this._config.disabledLibraries) {
        if (name === lib.name) {
          if (
            version === undefined ||
            lib.version === undefined ||
            semver.satisfies(version, lib.version)
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }
}

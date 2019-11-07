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

import * as types from '@opentelemetry/types';

/**
 * AbstractTracerFactory provides a base class for other tracer factories to extend from.
 */
export abstract class AbstractTracerFactory implements types.TracerFactory {
  protected readonly _tracers: Map<string, types.Tracer> = new Map();

  /**
   * _newTracer creates a new concrete tracer for factories that extend this.
   */
  protected abstract _newTracer(): types.Tracer;

  /**
   * getTracer finds or creates a new tracer.
   * @param name identifies the instrumentation library
   * @param [version] is the semantic version of the library.
   */
  getTracer(name: string, version?: string): types.Tracer {
    const key = name + (version != undefined ? version : '');
    if (this._tracers.has(key)) return this._tracers.get(key)!;

    const tracer = this._newTracer();
    this._tracers.set(key, tracer);

    return tracer;
  };
}

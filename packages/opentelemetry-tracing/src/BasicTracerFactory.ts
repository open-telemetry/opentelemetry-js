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
import { BasicTracerConfig } from './types';
import { BasicTracer } from './BasicTracer';

export class BasicTracerFactory implements types.TracerFactory {
  private static _singletonInstance: types.TracerFactory;
  private readonly _tracers: Map<String, BasicTracer> = new Map();
  private _config: BasicTracerConfig;
  private _spanProcessors: SpanProcessor[];

  constructor(config?: BasicTracerConfig) {
    this._config = config;
  }

  addSpanProcessor(processor: SpanProcessor): void {
    this._spanProcessors.push(spanProcessor);
    for (tracer of this._tracers) {
      tracer.addSpanProcessor(processor);
    }
  }

  getTracer(name: string = '', version?: string): types.Tracer {
    const key = name + (version != undefined ? version : '');
    if (this._tracers.has(key)) return this._tracers.get(key)!;

    const tracer = new BasicTracer(this._config);
    for (processor of this._spanProcessors) {
      tracer.addSpanProcessor(processor);
    }
    this._tracers.set(key, tracer);
    return tracer;
  }

  /** Gets the tracing instance. Accepts a tracer config for initialization */
  static instance(config?: BasicTracerConfig): types.TracerFactory {
    return this._singletonInstance || (this._singletonInstance = new this(config));
  }
}

export function getTracerFactory(config?: BasicTracerConfig): BasicTracerFactory {
  return BasicTracerFactory.instance(config);
}

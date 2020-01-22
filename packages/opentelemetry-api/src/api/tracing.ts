/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { NOOP_TRACER_REGISTRY } from '../trace/NoopTracerRegistry';
import { TracerRegistry } from '../trace/tracer_registry';
import { Tracer } from '../trace/tracer';

export class TracingAPI {
  private static _instance?: TracingAPI;
  private _tracerRegistry: TracerRegistry = NOOP_TRACER_REGISTRY;

  private constructor() {}

  public static getInstance(): TracingAPI {
    if (!this._instance) {
      this._instance = new TracingAPI();
    }

    return this._instance;
  }

  public initGlobalTracerRegistry(registry: TracerRegistry) {
    this._tracerRegistry = registry;
  }

  public getTracerRegistry(): TracerRegistry {
    return this._tracerRegistry;
  }

  public getTracer(name: string, version?: string): Tracer {
    return this.getTracerRegistry().getTracer(name, version);
  }
}

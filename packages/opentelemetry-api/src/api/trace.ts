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

import { NOOP_TRACER_PROVIDER } from '../trace/NoopTracerProvider';
import { TracerProvider } from '../trace/tracer_provider';
import { Tracer } from '../trace/tracer';

/**
 * Singleton object which represents the entry point to the OpenTelemetry Tracing API
 */
export class TraceAPI {
  private static _instance?: TraceAPI;
  private _tracerProvider: TracerProvider = NOOP_TRACER_PROVIDER;

  /** Empty private constructor prevents end users from constructing a new instance of the API */
  private constructor() {}

  /** Get the singleton instance of the Trace API */
  public static getInstance(): TraceAPI {
    if (!this._instance) {
      this._instance = new TraceAPI();
    }

    return this._instance;
  }

  /**
   * Set the current global tracer. Returns the initialized global tracer provider
   */
  public initGlobalTracerProvider(provider: TracerProvider): TracerProvider {
    this._tracerProvider = provider;
    return provider;
  }

  /**
   * Returns the global tracer provider.
   */
  public getTracerProvider(): TracerProvider {
    return this._tracerProvider;
  }

  /**
   * Returns a tracer from the global tracer provider.
   */
  public getTracer(name: string, version?: string): Tracer {
    return this.getTracerProvider().getTracer(name, version);
  }
}

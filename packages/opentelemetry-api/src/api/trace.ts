/*
 * Copyright The OpenTelemetry Authors
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

import { ProxyTracerProvider } from '../trace/ProxyTracerProvider';
import { Tracer } from '../trace/tracer';
import { TracerProvider } from '../trace/tracer_provider';
import { isSpanContextValid } from '../trace/spancontext-utils';
import {
  getGlobal,
  isCompatible,
  registerGlobal,
  unregisterGlobal,
} from './global-utils';

/**
 * Singleton object which represents the entry point to the OpenTelemetry Tracing API
 */
export class TraceAPI {
  private static _instance?: TraceAPI;

  private _proxyTracerProvider = new ProxyTracerProvider();

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
  public setGlobalTracerProvider(provider: TracerProvider): TracerProvider {
    this._proxyTracerProvider.setDelegate(provider);
    registerGlobal('trace', this._proxyTracerProvider);
    return this._proxyTracerProvider;
  }

  /**
   * Returns the global tracer provider.
   */
  public getTracerProvider(): TracerProvider {
    const version = getGlobal('version');
    return (
      (version && isCompatible(version) && getGlobal('trace')) ||
      this._proxyTracerProvider
    );
  }

  /**
   * Returns a tracer from the global tracer provider.
   */
  public getTracer(name: string, version?: string): Tracer {
    return this.getTracerProvider().getTracer(name, version);
  }

  /** Remove the global tracer provider */
  public disable() {
    unregisterGlobal('trace');
    this._proxyTracerProvider = new ProxyTracerProvider();
  }

  public isSpanContextValid = isSpanContextValid;
}

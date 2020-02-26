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

import { Context } from '@opentelemetry/scope-base';
import { Carrier } from '../context/propagation/carrier';
import { HttpTextFormat } from '../context/propagation/HttpTextFormat';
import { NOOP_HTTP_TEXT_FORMAT } from '../context/propagation/NoopHttpTextFormat';
import { ContextAPI } from './context';

const contextApi = ContextAPI.getInstance();

/**
 * Singleton object which represents the entry point to the OpenTelemetry Propagation API
 */
export class PropagationAPI {
  private static _instance?: PropagationAPI;
  private _propagator: HttpTextFormat = NOOP_HTTP_TEXT_FORMAT;

  /** Empty private constructor prevents end users from constructing a new instance of the API */
  private constructor() {}

  /** Get the singleton instance of the Propagator API */
  public static getInstance(): PropagationAPI {
    if (!this._instance) {
      this._instance = new PropagationAPI();
    }

    return this._instance;
  }

  /**
   * Set the current propagator. Returns the initialized propagator
   */
  public initGlobalPropagator(propagator: HttpTextFormat): HttpTextFormat {
    this._propagator = propagator;
    return propagator;
  }

  /**
   * Inject context into a carrier to be propagated inter-process
   *
   * @param carrier carrier to inject context into
   * @param context Context carrying tracing data to inject. Defaults to the currently active context.
   */
  public inject(carrier: Carrier, context = contextApi.active()): void {
    return this._propagator.inject(context, carrier);
  }

  /**
   * Extract context from a carrier
   *
   * @param carrier Carrier to extract context from
   * @param context Context which the newly created context will inherit from. Defaults to the currently active context.
   */
  public extract(carrier: Carrier, context = contextApi.active()): Context {
    return this._propagator.extract(context, carrier);
  }
}

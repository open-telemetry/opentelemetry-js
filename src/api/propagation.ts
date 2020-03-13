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
import { defaultGetter, GetterFunction } from '../context/propagation/getter';
import { HttpTextPropagator } from '../context/propagation/HttpTextPropagator';
import { NOOP_HTTP_TEXT_PROPAGATOR } from '../context/propagation/NoopHttpTextPropagator';
import { defaultSetter, SetterFunction } from '../context/propagation/setter';
import { ContextAPI } from './context';

const contextApi = ContextAPI.getInstance();

/**
 * Singleton object which represents the entry point to the OpenTelemetry Propagation API
 */
export class PropagationAPI {
  private static _instance?: PropagationAPI;
  private _propagator: HttpTextPropagator = NOOP_HTTP_TEXT_PROPAGATOR;

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
  public setGlobalPropagator(
    propagator: HttpTextPropagator
  ): HttpTextPropagator {
    this._propagator = propagator;
    return propagator;
  }

  /**
   * Inject context into a carrier to be propagated inter-process
   *
   * @param carrier carrier to inject context into
   * @param setter Function used to set values on the carrier
   * @param context Context carrying tracing data to inject. Defaults to the currently active context.
   */
  public inject<Carrier>(
    carrier: Carrier,
    setter: SetterFunction<Carrier> = defaultSetter,
    context = contextApi.active()
  ): void {
    return this._propagator.inject(context, carrier, setter);
  }

  /**
   * Extract context from a carrier
   *
   * @param carrier Carrier to extract context from
   * @param getter Function used to extract keys from a carrier
   * @param context Context which the newly created context will inherit from. Defaults to the currently active context.
   */
  public extract<Carrier>(
    carrier: Carrier,
    getter: GetterFunction<Carrier> = defaultGetter,
    context = contextApi.active()
  ): Context {
    return this._propagator.extract(context, carrier, getter);
  }
}

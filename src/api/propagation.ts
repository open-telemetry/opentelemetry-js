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

import { Context } from '../context/types';
import {
  getGlobal,
  registerGlobal,
  unregisterGlobal,
} from '../internal/global-utils';
import { NoopTextMapPropagator } from '../propagation/NoopTextMapPropagator';
import {
  defaultTextMapGetter,
  defaultTextMapSetter,
  TextMapGetter,
  TextMapPropagator,
  TextMapSetter,
} from '../propagation/TextMapPropagator';
import {
  getBaggage,
  setBaggage,
  deleteBaggage,
} from '../baggage/context-helpers';
import { createBaggage } from '../baggage/utils';

const API_NAME = 'propagation';
const NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator();

/**
 * Singleton object which represents the entry point to the OpenTelemetry Propagation API
 */
export class PropagationAPI {
  private static _instance?: PropagationAPI;

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
   * Set the current propagator.
   *
   * @returns true if the propagator was successfully registered, else false
   */
  public setGlobalPropagator(propagator: TextMapPropagator): boolean {
    return registerGlobal(API_NAME, propagator);
  }

  /**
   * Inject context into a carrier to be propagated inter-process
   *
   * @param context Context carrying tracing data to inject
   * @param carrier carrier to inject context into
   * @param setter Function used to set values on the carrier
   */
  public inject<Carrier>(
    context: Context,
    carrier: Carrier,
    setter: TextMapSetter<Carrier> = defaultTextMapSetter
  ): void {
    return this._getGlobalPropagator().inject(context, carrier, setter);
  }

  /**
   * Extract context from a carrier
   *
   * @param context Context which the newly created context will inherit from
   * @param carrier Carrier to extract context from
   * @param getter Function used to extract keys from a carrier
   */
  public extract<Carrier>(
    context: Context,
    carrier: Carrier,
    getter: TextMapGetter<Carrier> = defaultTextMapGetter
  ): Context {
    return this._getGlobalPropagator().extract(context, carrier, getter);
  }

  /**
   * Return a list of all fields which may be used by the propagator.
   */
  public fields(): string[] {
    return this._getGlobalPropagator().fields();
  }

  /** Remove the global propagator */
  public disable() {
    unregisterGlobal(API_NAME);
  }

  public createBaggage = createBaggage;

  public getBaggage = getBaggage;

  public setBaggage = setBaggage;

  public deleteBaggage = deleteBaggage;

  private _getGlobalPropagator(): TextMapPropagator {
    return getGlobal(API_NAME) || NOOP_TEXT_MAP_PROPAGATOR;
  }
}

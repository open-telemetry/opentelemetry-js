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

import {
  API_BACKWARDS_COMPATIBILITY_VERSION,
  GLOBAL_EVENTS_API_KEY,
  _global,
  makeGetter,
} from '../internal/global-utils';
import { EventEmitterProvider } from '../types/EventEmitterProvider';
import { NOOP_EVENT_EMITTER_PROVIDER } from '../NoopEventEmitterProvider';
import { EventEmitter } from '../types/EventEmitter';
import { EventEmitterOptions } from '../types/EventEmitterOptions';

export class EventsAPI {
  private static _instance?: EventsAPI;

  private constructor() {}

  public static getInstance(): EventsAPI {
    if (!this._instance) {
      this._instance = new EventsAPI();
    }

    return this._instance;
  }

  public setGlobalEventEmitterProvider(
    provider: EventEmitterProvider
  ): EventEmitterProvider {
    if (_global[GLOBAL_EVENTS_API_KEY]) {
      return this.getEventEmitterProvider();
    }

    _global[GLOBAL_EVENTS_API_KEY] = makeGetter<EventEmitterProvider>(
      API_BACKWARDS_COMPATIBILITY_VERSION,
      provider,
      NOOP_EVENT_EMITTER_PROVIDER
    );

    return provider;
  }

  /**
   * Returns the global event emitter provider.
   *
   * @returns EventEmitterProvider
   */
  public getEventEmitterProvider(): EventEmitterProvider {
    return (
      _global[GLOBAL_EVENTS_API_KEY]?.(API_BACKWARDS_COMPATIBILITY_VERSION) ??
      NOOP_EVENT_EMITTER_PROVIDER
    );
  }

  /**
   * Returns a event emitter from the global event emitter provider.
   *
   * @returns EventEmitter
   */
  public getEventEmitter(
    name: string,
    domain: string,
    version?: string,
    options?: EventEmitterOptions
  ): EventEmitter {
    return this.getEventEmitterProvider().getEventEmitter(
      name,
      domain,
      version,
      options
    );
  }

  /** Remove the global event emitter provider */
  public disable(): void {
    delete _global[GLOBAL_EVENTS_API_KEY];
  }
}

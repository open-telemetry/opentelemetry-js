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
import { EventLoggerProvider } from '../types/EventLoggerProvider';
import { NOOP_EVENT_LOGGER_PROVIDER } from '../NoopEventLoggerProvider';
import { EventLogger } from '../types/EventLogger';
import { EventLoggerOptions } from '../types/EventLoggerOptions';

export class EventsAPI {
  private static _instance?: EventsAPI;

  private constructor() {}

  public static getInstance(): EventsAPI {
    if (!this._instance) {
      this._instance = new EventsAPI();
    }

    return this._instance;
  }

  public setGlobalEventLoggerProvider(
    provider: EventLoggerProvider
  ): EventLoggerProvider {
    if (_global[GLOBAL_EVENTS_API_KEY]) {
      return this.getEventLoggerProvider();
    }

    _global[GLOBAL_EVENTS_API_KEY] = makeGetter<EventLoggerProvider>(
      API_BACKWARDS_COMPATIBILITY_VERSION,
      provider,
      NOOP_EVENT_LOGGER_PROVIDER
    );

    return provider;
  }

  /**
   * Returns the global event logger provider.
   *
   * @returns EventLoggerProvider
   */
  public getEventLoggerProvider(): EventLoggerProvider {
    return (
      _global[GLOBAL_EVENTS_API_KEY]?.(API_BACKWARDS_COMPATIBILITY_VERSION) ??
      NOOP_EVENT_LOGGER_PROVIDER
    );
  }

  /**
   * Returns a event logger from the global event logger provider.
   *
   * @returns EventLogger
   */
  public getEventLogger(
    name: string,
    version?: string,
    options?: EventLoggerOptions
  ): EventLogger {
    return this.getEventLoggerProvider().getEventLogger(name, version, options);
  }

  /** Remove the global event logger provider */
  public disable(): void {
    delete _global[GLOBAL_EVENTS_API_KEY];
  }
}

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

import { Meter } from '../metrics/Meter';
import { MeterProvider } from '../metrics/MeterProvider';
import { NOOP_METER_PROVIDER } from '../metrics/NoopMeterProvider';
import {
  API_BACKWARDS_COMPATIBILITY_VERSION,
  GLOBAL_METRICS_API_KEY,
  makeGetter,
  _global,
} from './global-utils';

/**
 * Singleton object which represents the entry point to the OpenTelemetry Metrics API
 */
export class MetricsAPI {
  private static _instance?: MetricsAPI;

  /** Empty private constructor prevents end users from constructing a new instance of the API */
  private constructor() {}

  /** Get the singleton instance of the Metrics API */
  public static getInstance(): MetricsAPI {
    if (!this._instance) {
      this._instance = new MetricsAPI();
    }

    return this._instance;
  }

  /**
   * Set the current global meter. Returns the initialized global meter provider.
   */
  public setGlobalMeterProvider(provider: MeterProvider): MeterProvider {
    if (_global[GLOBAL_METRICS_API_KEY]) {
      // global meter provider has already been set
      return this.getMeterProvider();
    }

    _global[GLOBAL_METRICS_API_KEY] = makeGetter(
      API_BACKWARDS_COMPATIBILITY_VERSION,
      provider,
      NOOP_METER_PROVIDER
    );

    return provider;
  }

  /**
   * Returns the global meter provider.
   */
  public getMeterProvider(): MeterProvider {
    return (
      _global[GLOBAL_METRICS_API_KEY]?.(API_BACKWARDS_COMPATIBILITY_VERSION) ??
      NOOP_METER_PROVIDER
    );
  }

  /**
   * Returns a meter from the global meter provider.
   */
  public getMeter(name: string, version?: string): Meter {
    return this.getMeterProvider().getMeter(name, version);
  }

  /** Remove the global meter provider */
  public disable() {
    delete _global[GLOBAL_METRICS_API_KEY];
  }
}

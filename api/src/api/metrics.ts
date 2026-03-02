/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Meter, MeterOptions } from '../metrics/Meter';
import { MeterProvider } from '../metrics/MeterProvider';
import { NOOP_METER_PROVIDER } from '../metrics/NoopMeterProvider';
import {
  getGlobal,
  registerGlobal,
  unregisterGlobal,
} from '../internal/global-utils';
import { DiagAPI } from './diag';

const API_NAME = 'metrics';

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
   * Set the current global meter provider.
   * Returns true if the meter provider was successfully registered, else false.
   */
  public setGlobalMeterProvider(provider: MeterProvider): boolean {
    return registerGlobal(API_NAME, provider, DiagAPI.instance());
  }

  /**
   * Returns the global meter provider.
   */
  public getMeterProvider(): MeterProvider {
    return getGlobal(API_NAME) || NOOP_METER_PROVIDER;
  }

  /**
   * Returns a meter from the global meter provider.
   */
  public getMeter(
    name: string,
    version?: string,
    options?: MeterOptions
  ): Meter {
    return this.getMeterProvider().getMeter(name, version, options);
  }

  /** Remove the global meter provider */
  public disable(): void {
    unregisterGlobal(API_NAME, DiagAPI.instance());
  }
}

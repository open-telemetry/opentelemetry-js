/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  API_BACKWARDS_COMPATIBILITY_VERSION,
  GLOBAL_CONFIG_API_KEY,
  _global,
  makeGetter,
} from '../internal/global-utils';
import type { ConfigProvider } from '../types/ConfigProvider';
import { NOOP_CONFIG_PROVIDER } from '../NoopConfigProvider';

export class ConfigAPI {
  private static _instance?: ConfigAPI;

  private constructor() {}

  public static getInstance(): ConfigAPI {
    if (!this._instance) {
      this._instance = new ConfigAPI();
    }

    return this._instance;
  }

  /**
   * Set the global ConfigProvider. The first registration wins; later calls are
   * ignored and return the already-registered provider.
   */
  public setGlobalConfigProvider(provider: ConfigProvider): ConfigProvider {
    if (_global[GLOBAL_CONFIG_API_KEY]) {
      return this.getConfigProvider();
    }

    _global[GLOBAL_CONFIG_API_KEY] = makeGetter<ConfigProvider>(
      API_BACKWARDS_COMPATIBILITY_VERSION,
      provider,
      NOOP_CONFIG_PROVIDER
    );

    return provider;
  }

  /**
   * Returns the global ConfigProvider, or a no-op provider when none is
   * registered.
   */
  public getConfigProvider(): ConfigProvider {
    return (
      _global[GLOBAL_CONFIG_API_KEY]?.(API_BACKWARDS_COMPATIBILITY_VERSION) ??
      NOOP_CONFIG_PROVIDER
    );
  }

  /** Remove the global ConfigProvider. */
  public disable(): void {
    delete _global[GLOBAL_CONFIG_API_KEY];
  }
}

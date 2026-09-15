/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ConfigProvider, ConfigProperties } from './types/ConfigProvider';

// Exported for testing.
export const EMPTY_CONFIG_PROPERTIES = Object.freeze({});

/**
 * A {@link ConfigProvider} that yields empty configuration for every lookup, so
 * instrumentations fall back to their constructor defaults.
 */
export class NoopConfigProvider implements ConfigProvider {
  getInstrumentationConfig(_name?: string): ConfigProperties {
    return EMPTY_CONFIG_PROPERTIES;
  }

  getGeneralInstrumentationConfig(): ConfigProperties {
    return EMPTY_CONFIG_PROPERTIES;
  }
}

export const NOOP_CONFIG_PROVIDER = new NoopConfigProvider();

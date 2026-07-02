/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ConfigProvider } from './types/ConfigProvider';
import type { ConfigProperties } from './types/ConfigProperties';
import { createConfigProperties } from './ConfigPropertiesImpl';

/**
 * A {@link ConfigProvider} that yields empty configuration for every lookup, so
 * instrumentations fall back to their constructor defaults.
 */
export class NoopConfigProvider implements ConfigProvider {
  getInstrumentationConfig(_name?: string): ConfigProperties {
    return createConfigProperties(undefined);
  }

  getGeneralInstrumentationConfig(): ConfigProperties {
    return createConfigProperties(undefined);
  }
}

export const NOOP_CONFIG_PROVIDER = new NoopConfigProvider();

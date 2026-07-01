/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ConfigProperties,
  ConfigProvider,
} from '@opentelemetry/api-config';
import { createConfigProperties } from '@opentelemetry/api-config';
import type { ConfigurationModel } from './generated/types';

/**
 * A {@link ConfigProvider} over a parsed {@link ConfigurationModel}. Exposes the
 * `instrumentation/development` node; per-instrumentation config lives at
 * `.js.<name>` and shared config at `.general`.
 */
class SdkConfigProvider implements ConfigProvider {
  private readonly _instrumentationConfig: ConfigProperties;

  constructor(model: ConfigurationModel) {
    this._instrumentationConfig = createConfigProperties(
      model['instrumentation/development']
    );
  }

  getInstrumentationConfig(name?: string): ConfigProperties {
    if (name === undefined) {
      return this._instrumentationConfig;
    }
    return (
      this._instrumentationConfig.getStructured('js')?.getStructured(name) ??
      createConfigProperties(undefined)
    );
  }

  getGeneralInstrumentationConfig(): ConfigProperties {
    return (
      this._instrumentationConfig.getStructured('general') ??
      createConfigProperties(undefined)
    );
  }
}

/**
 * Build a {@link ConfigProvider} from a parsed configuration model.
 */
export function createConfigProvider(
  model: ConfigurationModel
): ConfigProvider {
  return new SdkConfigProvider(model);
}

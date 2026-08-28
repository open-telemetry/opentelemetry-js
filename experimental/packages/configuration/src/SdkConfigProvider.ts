/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ConfigProperties,
  ConfigProvider,
} from '@opentelemetry/api-config';
import type {
  ConfigurationModel,
  ExperimentalInstrumentation,
} from './generated/types';

export const EMPTY_CONFIG_PROPERTIES: ConfigProperties = Object.freeze({});

/**
 * The schema types a config node as an object, but the parsed file is only as
 * good as its input. Callers index the returned node, so anything that is not a
 * mapping is reported as absent.
 */
function asConfigProperties(node: unknown): ConfigProperties {
  return typeof node === 'object' && node !== null && !Array.isArray(node)
    ? (node as ConfigProperties)
    : EMPTY_CONFIG_PROPERTIES;
}

/**
 * A {@link ConfigProvider} over a parsed {@link ConfigurationModel}. Exposes the
 * `instrumentation/development` node; per-instrumentation config lives at
 * `.js.<name>` and shared config at `.general`.
 */
class SdkConfigProvider implements ConfigProvider {
  private readonly _instrumentationConfig:
    | ExperimentalInstrumentation
    | undefined;

  constructor(config: ConfigurationModel) {
    this._instrumentationConfig = config['instrumentation/development'];
  }

  getInstrumentationConfig(name?: string): ConfigProperties {
    if (name === undefined) {
      return asConfigProperties(this._instrumentationConfig);
    }
    return asConfigProperties(this._instrumentationConfig?.js?.[name]);
  }

  getGeneralInstrumentationConfig(): ConfigProperties {
    return asConfigProperties(this._instrumentationConfig?.general);
  }
}

/**
 * Build a {@link ConfigProvider} from a parsed configuration model.
 */
export function createConfigProvider(
  config: ConfigurationModel
): ConfigProvider {
  return new SdkConfigProvider(config);
}

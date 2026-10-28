/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { diag } from '@opentelemetry/api';
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
 * mapping is reported as absent, with a warning naming the node.
 */
function asConfigProperties(node: unknown, path: string): ConfigProperties {
  if (node === undefined || node === null) {
    return EMPTY_CONFIG_PROPERTIES;
  }
  if (typeof node !== 'object' || Array.isArray(node)) {
    diag.warn(
      `declarative config node "${path}" is not a mapping, ignoring it: got ${
        Array.isArray(node) ? 'array' : typeof node
      }`
    );
    return EMPTY_CONFIG_PROPERTIES;
  }
  return node as ConfigProperties;
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
      return asConfigProperties(
        this._instrumentationConfig,
        'instrumentation/development'
      );
    }
    return asConfigProperties(
      this._instrumentationConfig?.js?.[name],
      `instrumentation/development.js.${name}`
    );
  }

  getGeneralInstrumentationConfig(): ConfigProperties {
    return asConfigProperties(
      this._instrumentationConfig?.general,
      'instrumentation/development.general'
    );
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

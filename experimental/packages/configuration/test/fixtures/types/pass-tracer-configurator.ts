/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ConfigurationModel,
  ExperimentalTracerConfigConfigModel,
  ExperimentalTracerConfiguratorConfigModel,
  ExperimentalTracerMatcherAndConfigConfigModel,
} from '@opentelemetry/configuration';

const disabledConfig: ExperimentalTracerConfigConfigModel = { enabled: false };
const matcher: ExperimentalTracerMatcherAndConfigConfigModel = {
  name: 'library-*',
  config: disabledConfig,
};
const tracerConfigurator: ExperimentalTracerConfiguratorConfigModel = {
  default_config: {},
  tracers: [matcher],
};
const config: ConfigurationModel = {
  tracer_provider: {
    processors: [],
    'tracer_configurator/development': tracerConfigurator,
  },
};

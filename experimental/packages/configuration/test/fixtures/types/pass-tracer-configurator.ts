/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ConfigurationModel,
  ExperimentalTracerConfigModel,
  ExperimentalTracerConfiguratorConfigModel,
  ExperimentalTracerMatcherAndConfigModel,
} from '@opentelemetry/configuration';

const disabledConfig: ExperimentalTracerConfigModel = { enabled: false };
const matcher: ExperimentalTracerMatcherAndConfigModel = {
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

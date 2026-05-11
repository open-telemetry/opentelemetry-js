/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getStringFromEnv } from '@opentelemetry/core';
import type { ConfigFactory } from './IConfigFactory';
import { EnvironmentConfigFactory } from './EnvironmentConfigFactory';
import { FileConfigFactory } from './FileConfigFactory';

export function createConfigFactory(): ConfigFactory {
  const configFile = getStringFromEnv('OTEL_CONFIG_FILE');
  if (configFile) {
    return new FileConfigFactory();
  }
  return new EnvironmentConfigFactory();
}

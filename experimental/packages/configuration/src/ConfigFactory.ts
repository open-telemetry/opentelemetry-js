/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigFactory } from './IConfigFactory';
import { EnvironmentConfigFactory } from './EnvironmentConfigFactory';
import { FileConfigFactory, hasValidConfigFile } from './FileConfigFactory';

export function createConfigFactory(): ConfigFactory {
  if (hasValidConfigFile()) {
    return new FileConfigFactory();
  }
  return new EnvironmentConfigFactory();
}

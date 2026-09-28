/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ConfigurationModel } from './generated/types';

export interface ConfigFactory {
  /**
   * Returns a ConfigurationModel.
   *
   * @returns ConfigurationModel a ConfigurationModel with all configuration attributes
   */
  getConfigModel(): ConfigurationModel;
}

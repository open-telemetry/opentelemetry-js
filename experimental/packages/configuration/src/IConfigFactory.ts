/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigurationModel } from './models/configModel';

export interface ConfigFactory {
  /**
   * Returns a ConfigurationModel.
   *
   * @returns ConfigurationModel a Configuration Model with all configuration attributes
   */
  getConfigModel(): ConfigurationModel;
}

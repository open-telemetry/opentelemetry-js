/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Configuration } from './generated/types';

export interface ConfigFactory {
  /**
   * Returns a Configuration.
   *
   * @returns Configuration a Configuration with all configuration attributes
   */
  getConfigModel(): Configuration;
}

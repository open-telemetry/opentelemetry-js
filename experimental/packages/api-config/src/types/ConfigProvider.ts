/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ConfigProperties } from './ConfigProperties';

/**
 * @experimental This feature is in development as per the OpenTelemetry
 * specification.
 *
 * Provides access to declarative instrumentation configuration. An SDK builds a
 * provider from a parsed config file and registers it globally; instrumentations
 * read their config from it. The global default is a no-op yielding empty
 * configuration.
 */
export interface ConfigProvider {
  /**
   * Returns the `instrumentation/development` node, or an empty accessor when it
   * is absent.
   */
  getInstrumentationConfig(): ConfigProperties;
  /**
   * Returns the config for a single instrumentation
   * (`instrumentation/development.js.<name>`), or an empty accessor when absent.
   *
   * @param name the instrumentation's npm package name
   */
  getInstrumentationConfig(name: string): ConfigProperties;
  /**
   * Returns the shared `instrumentation/development.general` node, or an empty
   * accessor when absent.
   */
  getGeneralInstrumentationConfig(): ConfigProperties;
}

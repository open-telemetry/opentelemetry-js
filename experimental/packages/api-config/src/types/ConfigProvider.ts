/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Representation of a declarative config mapping node.
 * https://opentelemetry.io/docs/specs/otel/configuration/api/#configproperties
 */
export type ConfigProperties = Record<string, unknown>;

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
   * Returns the config for a single instrumentation
   * (`instrumentation/development.js.<name>`), or an empty accessor when absent.
   *
   * @param name the instrumentation scope name (often the npm package name)
   */
  getInstrumentationConfig(name: string): ConfigProperties;

  /**
   * Returns the shared `instrumentation/development.general` node, or an empty
   * accessor when absent.
   */
  getGeneralInstrumentationConfig(): ConfigProperties;

  /**
   * Returns the whole `instrumentation/development` node, or an empty accessor
   * when absent. Instrumentation code should rarely need this; prefer
   * `getInstrumentationConfig(name)` and `getGeneralInstrumentationConfig()`.
   */
  getInstrumentationConfigRoot(): ConfigProperties;
}

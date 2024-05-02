/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { TracerProvider, MeterProvider } from '@opentelemetry/api';
import { LoggerProvider } from '@opentelemetry/api-logs';

/** Interface Instrumentation to apply patch. */
export interface Instrumentation<
  ConfigType extends InstrumentationConfig = InstrumentationConfig,
> {
  /** Instrumentation Name  */
  instrumentationName: string;

  /** Instrumentation Version  */
  instrumentationVersion: string;

  /**
   * Instrumentation Description - please describe all useful information
   * as Instrumentation might patch different version of different modules,
   * or support different browsers etc.
   */
  instrumentationDescription?: string;

  /** Method to disable the instrumentation  */
  disable(): void;

  /** Method to enable the instrumentation  */
  enable(): void;

  /** Method to set tracer provider  */
  setTracerProvider(tracerProvider: TracerProvider): void;

  /** Method to set meter provider  */
  setMeterProvider(meterProvider: MeterProvider): void;

  /** Method to set logger provider  */
  setLoggerProvider?(loggerProvider: LoggerProvider): void;

  /** Method to set instrumentation config  */
  setConfig(config: ConfigType): void;

  /** Method to get instrumentation config  */
  getConfig(): ConfigType;

  /**
   * Contains all supported versions.
   * All versions must be compatible with [semver](https://semver.org/spec/v2.0.0.html) format.
   * If the version is not supported, we won't apply instrumentation patch (see `enable` method).
   * If omitted, all versions of the module will be patched.
   */
  supportedVersions?: string[];
}

/**
 * Base interface for configuration options common to all instrumentations.
 * This interface can be extended by individual instrumentations to include
 * additional configuration options specific to that instrumentation.
 * All configuration options must be optional.
 */
export interface InstrumentationConfig {
  /**
   * Whether to enable the plugin.
   * @default true
   */
  enabled?: boolean;
}

/**
 * This interface defines the params that are be added to the wrapped function
 * using the "shimmer.wrap"
 */
export interface ShimWrapped extends Function {
  __wrapped: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  __unwrap: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  __original: Function;
}

export interface InstrumentationModuleFile {
  /** Name of file to be patched with relative path */
  name: string;

  moduleExports?: unknown;

  /** Supported version this file */
  supportedVersions: string[];

  /** Method to patch the instrumentation  */
  patch(moduleExports: unknown, moduleVersion?: string): unknown;

  /** Method to patch the instrumentation  */

  /** Method to unpatch the instrumentation  */
  unpatch(moduleExports?: unknown, moduleVersion?: string): void;
}

export interface InstrumentationModuleDefinition {
  /** Module name or path  */
  name: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  moduleExports?: any;

  /** Instrumented module version */
  moduleVersion?: string;

  /** Supported version of module  */
  supportedVersions: string[];

  /** Module internal files to be patched  */
  files: InstrumentationModuleFile[];

  /** If set to true, the includePrerelease check will be included when calling semver.satisfies */
  includePrerelease?: boolean;

  /** Method to patch the instrumentation  */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch?: (moduleExports: any, moduleVersion?: string) => any;

  /** Method to unpatch the instrumentation  */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unpatch?: (moduleExports: any, moduleVersion?: string) => void;
}

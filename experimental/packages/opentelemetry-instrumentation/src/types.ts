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

import { TracerProvider, MeterProvider, Span } from '@opentelemetry/api';
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

  /** Supported versions for the file.
   *
   * A module version is supported if one of the supportedVersions in the array satisfies the module version.
   * The syntax of the version is checked with the `satisfies` function of "The semantic versioner for npm", see
   * [`semver` package](https://www.npmjs.com/package/semver)
   * If the version is not supported, we won't apply instrumentation patch.
   * If omitted, all versions of the module will be patched.
   *
   * It is recommended to always specify a range that is bound to a major version, to avoid breaking changes.
   * New major versions should be reviewed and tested before being added to the supportedVersions array.
   *
   * Example: ['>=1.2.3 <3']
   */
  supportedVersions: string[];

  /** Method to patch the instrumentation  */
  patch(moduleExports: unknown, moduleVersion?: string): unknown;

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

  /** Supported version of module.
   *
   * A module version is supported if one of the supportedVersions in the array satisfies the module version.
   * The syntax of the version is checked with the `satisfies` function of "The semantic versioner for npm", see
   * [`semver` package](https://www.npmjs.com/package/semver)
   * If the version is not supported, we won't apply instrumentation patch (see `enable` method).
   * If omitted, all versions of the module will be patched.
   *
   * It is recommended to always specify a range that is bound to a major version, to avoid breaking changes.
   * New major versions should be reviewed and tested before being added to the supportedVersions array.
   *
   * Example: ['>=1.2.3 <3']
   */
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

/**
 * SpanCustomizationHook is a common way for instrumentations to expose extension points
 * where users can add custom behavior to a span based on info object passed to the hook at different times of the span lifecycle.
 * This is an advanced feature, commonly used to add additional or non-spec-compliant attributes to the span,
 * capture payloads, modify the span in some way, or carry some other side effect.
 *
 * The hook is registered with the instrumentation specific config by implementing an handler function with this signature,
 * and if the hook is present, it will be called with the span and the event information
 * when the event is emitted.
 *
 * When and under what conditions the hook is called and what data is passed
 * in the info argument, is specific to each instrumentation and life-cycle event
 * and should be documented where it is used.
 *
 * Instrumentation may define multiple hooks, for different spans, or different span life-cycle events.
 */
export type SpanCustomizationHook<SpanCustomizationInfoType> = (
  span: Span,
  info: SpanCustomizationInfoType
) => void;

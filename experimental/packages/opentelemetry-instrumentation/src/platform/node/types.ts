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

export interface InstrumentationModuleFile<T> {
  /** Name of file to be patched with relative path */
  name: string;

  moduleExports?: T;

  /** Supported version this file */
  supportedVersions: string[];

  /** Method to patch the instrumentation  */
  patch(moduleExports: T, moduleVersion?: string): T;

  /** Method to patch the instrumentation  */

  /** Method to unpatch the instrumentation  */
  unpatch(moduleExports?: T, moduleVersion?: string): void;
}

export interface InstrumentationModuleDefinition<T> {
  /** Module name or path  */
  name: string;

  moduleExports?: T;

  /** Instrumented module version */
  moduleVersion?: string;

  /** Supported version of module  */
  supportedVersions: string[];

  /** Module internal files to be patched  */
  files: InstrumentationModuleFile<any>[];

  /** If set to true, the includePrerelease check will be included when calling semver.satisfies */
  includePrerelease?: boolean;

  /** Method to patch the instrumentation  */
  patch?: (moduleExports: T, moduleVersion?: string) => T;

  /** Method to unpatch the instrumentation  */
  unpatch?: (moduleExports: T, moduleVersion?: string) => void;
}

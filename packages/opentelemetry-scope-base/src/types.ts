/**
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface ScopeManager {
  /**
   * Get the current active scope
   */
  active(): unknown;

  /**
   * Run the fn callback with object set as the current active scope
   * @param scope Any object to set as the current active scope
   * @param fn A callback to be immediately run within a specific scope
   */
  with<T extends (...args: unknown[]) => ReturnType<T>>(
    scope: unknown,
    fn: T
  ): ReturnType<T>;

  /**
   * Bind an object as the current scope (or a specific one)
   * @param target Any object to which a scope need to be set
   * @param [scope] Optionally specify the scope which you want to assign
   */
  bind<T>(target: T, scope?: unknown): T;

  /**
   * Enable scope management
   */
  enable(): this;

  /**
   * Disable scope management
   */
  disable(): this;
}

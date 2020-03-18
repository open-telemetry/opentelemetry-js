/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { Context } from './context';

export interface ContextManager {
  /**
   * Get the current active context
   */
  active(): Context;

  /**
   * Run the fn callback with object set as the current active context
   * @param context Any object to set as the current active context
   * @param fn A callback to be immediately run within a specific context
   */
  with<T extends (...args: unknown[]) => ReturnType<T>>(
    context: Context,
    fn: T
  ): ReturnType<T>;

  /**
   * Run the async fn callback with an active scope
   *
   * @param scope Context to be active during function invocation
   * @param fn An async callback to be immediately run with an active context
   */
  withAsync<T extends Promise<any>, U extends (...args: unknown[]) => T>(
    scope: Context,
    fn: U
  ): Promise<T>;

  /**
   * Bind an object as the current context (or a specific one)
   * @param target Any object to which a context need to be set
   * @param [context] Optionally specify the context which you want to assign
   */
  bind<T>(target: T, context?: Context): T;

  /**
   * Enable context management
   */
  enable(): this;

  /**
   * Disable context management
   */
  disable(): this;
}

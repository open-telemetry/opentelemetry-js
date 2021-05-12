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

import { Context } from './types';

/** Get a key to uniquely identify a context value */
export function createContextKey(description: string) {
  // The specification states that for the same input, multiple calls should
  // return different keys. Due to the nature of the JS dependency management
  // system, this creates problems where multiple versions of some package
  // could hold different keys for the same property.
  //
  // Therefore, we use Symbol.for which returns the same key for the same input.
  return Symbol.for(description);
}

class BaseContext implements Context {
  private _currentContext!: Map<symbol, unknown>;

  /**
   * Construct a new context which inherits values from an optional parent context.
   *
   * @param parentContext a context from which to inherit values
   */
  constructor(parentContext?: Map<symbol, unknown>) {
    // for minification
    const self = this;

    self._currentContext = parentContext ? new Map(parentContext) : new Map();

    self.getValue = (key: symbol) => self._currentContext.get(key);

    self.setValue = (key: symbol, value: unknown): Context => {
      const context = new BaseContext(self._currentContext);
      context._currentContext.set(key, value);
      return context;
    };

    self.deleteValue = (key: symbol): Context => {
      const context = new BaseContext(self._currentContext);
      context._currentContext.delete(key);
      return context;
    };
  }

  /**
   * Get a value from the context.
   *
   * @param key key which identifies a context value
   */
  public getValue!: (key: symbol) => unknown;

  /**
   * Create a new context which inherits from this context and has
   * the given key set to the given value.
   *
   * @param key context key for which to set the value
   * @param value value to set for the given key
   */
  public setValue!: (key: symbol, value: unknown) => Context;

  /**
   * Return a new context which inherits from this context but does
   * not contain a value for the given key.
   *
   * @param key context key for which to clear a value
   */
  public deleteValue!: (key: symbol) => Context;
}

/** The root context is used as the default parent context when there is no active context */
export const ROOT_CONTEXT: Context = new BaseContext();

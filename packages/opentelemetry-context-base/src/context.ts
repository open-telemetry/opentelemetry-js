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

export class BaseContext implements Context {
  private _currentContext: Map<symbol, unknown>;

  /**
   * Construct a new context which inherits values from an optional parent context.
   *
   * @param parentContext a context from which to inherit values
   */
  constructor(parentContext?: Map<symbol, unknown>) {
    this._currentContext = parentContext ? new Map(parentContext) : new Map();
  }

  /**
   * Get a value from the context.
   *
   * @param key key which identifies a context value
   */
  getValue(key: symbol): unknown {
    return this._currentContext.get(key);
  }

  /**
   * Create a new context which inherits from this context and has
   * the given key set to the given value.
   *
   * @param key context key for which to set the value
   * @param value value to set for the given key
   */
  setValue(key: symbol, value: unknown): Context {
    const context = new BaseContext(this._currentContext);
    context._currentContext.set(key, value);
    return context;
  }

  /**
   * Return a new context which inherits from this context but does
   * not contain a value for the given key.
   *
   * @param key context key for which to clear a value
   */
  deleteValue(key: symbol): Context {
    const context = new BaseContext(this._currentContext);
    context._currentContext.delete(key);
    return context;
  }
}

/** The root context is used as the default parent context when there is no active context */
export const ROOT_CONTEXT: Context = new BaseContext();

/** Get a key to uniquely identify a context value */
export function createContextKey(description: string) {
  return Symbol.for(description);
}

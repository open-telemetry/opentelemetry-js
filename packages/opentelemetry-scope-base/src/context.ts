/*!
 * Copyright 2020, OpenTelemetry Authors
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

/** Map of identifiers to an unknown value used internally to store context */
type Store = { [identifer: string]: unknown };

/**
 * Class which stores and manages current context values. All methods which
 * update context such as get and delete do not modify an existing context,
 * but create a new one with updated values.
 */
export class Context {
  private _currentContext: Store;

  /** The root context is used as the default parent context when there is no active context */
  public static readonly ROOT_CONTEXT = new Context();

  /**
   * Construct a new context which inherits values from an optional parent context.
   *
   * @param parentContext a context from which to inherit values
   */
  private constructor(parentContext?: Store) {
    this._currentContext = Object.assign(Object.create(null), parentContext);
  }

  /**
   * Get a value from the context.
   *
   * @param key key which identifies a context value
   */
  getValue(key: string): unknown {
    return this._currentContext[key];
  }

  /**
   * Create a new context which inherits from this context and has
   * the given key set to the given value.
   *
   * @param key context key for which to set the value
   * @param value value to set for the given key
   */
  setValue(key: string, value: unknown): Context {
    const context = new Context(this._currentContext);
    context._currentContext[key] = value;
    return context;
  }

  /**
   * Return a new context which inherits from this context but does
   * not contain a value for the given key.
   *
   * @param key context key for which to clear a value
   */
  deleteValue(key: string): Context {
    const context = new Context(this._currentContext);
    delete context._currentContext[key];
    return context;
  }
}

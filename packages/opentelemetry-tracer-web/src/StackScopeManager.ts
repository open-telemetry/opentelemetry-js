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

import { ScopeManager } from '@opentelemetry/scope-base';

/**
 * Stack Scope Manager for managing the state in web
 * it doesn't fully support the async calls though
 */
export class StackScopeManager implements ScopeManager {
  /**
   * whether the scope manager is enabled or not
   */
  private _enabled = false;

  /**
   * Keeps the reference to current scope
   */
  public _currentScope: unknown;

  /**
   *
   * @param target Function to be executed within the scope
   * @param scope
   * @private
   */
  private _bindFunction<T extends Function>(target: T, scope?: unknown): T {
    const manager = this;
    const contextWrapper = function(...args: unknown[]) {
      return manager.with(scope, () => target.apply(scope, args));
    };
    Object.defineProperty(contextWrapper, 'length', {
      enumerable: false,
      configurable: true,
      writable: false,
      value: target.length,
    });
    return (contextWrapper as unknown) as T;
  }

  /**
   * Returns the active scope
   */
  active(): unknown {
    return this._currentScope;
  }

  /**
   * Binds a the certain scope or the active one to the target function and then returns the target
   * @param target
   * @param scope
   */
  bind<T>(target: T, scope?: unknown): T {
    // if no specific scope to propagate is given, we use the current one
    if (scope === undefined) {
      scope = this.active();
    }
    if (typeof target === 'function') {
      return this._bindFunction(target, scope);
    }
    return target;
  }

  /**
   * Disable the scope manager (clears the current scope)
   */
  disable(): this {
    this._currentScope = undefined;
    this._enabled = false;
    return this;
  }

  /**
   * Enables the scope manager and creates a default(root) scope
   */
  enable(): this {
    if (this._enabled) {
      return this;
    }
    this._enabled = true;
    this._currentScope = window;
    return this;
  }

  /**
   * Calls the callback function [fn] with the provided [scope]. If [scope] is undefined then it will use the window.
   * The scope will be set as active
   * @param scope
   * @param fn Callback function
   */
  with<T extends (...args: unknown[]) => ReturnType<T>>(
    scope: unknown,
    fn: () => ReturnType<T>
  ): ReturnType<T> {
    if (typeof scope === 'undefined' || scope === null) {
      scope = window;
    }

    const previousScope = this._currentScope;
    this._currentScope = scope;

    try {
      return fn.apply(scope);
    } catch (err) {
      throw err;
    } finally {
      this._currentScope = previousScope;
    }
  }
}

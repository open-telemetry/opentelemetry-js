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
   * keeps the information of scopes so that it can be restored properly after being used
   */
  public _scopesStack: any[] = [];

  /**
   *
   * @param scope Scope to be activated
   * @private
   */
  private _activateScope(scope: any) {
    this._scopesStack.push(scope);
  }

  /**
   *
   * @param target Function to be executed within the scope
   * @param scope
   * @private
   */
  private _bindFunction<T extends Function>(target: T, scope?: unknown): T {
    const manager = this;
    const contextWrapper: any = function(...args: unknown[]) {
      return manager.with(scope, () => target.apply(scope, args));
    };
    Object.defineProperty(contextWrapper, 'length', {
      enumerable: false,
      configurable: true,
      writable: false,
      value: target.length,
    });
    return contextWrapper as any;
  }

  /**
   * Creates a root / main scope
   * @param scope
   * @private
   */
  private _createRootScope(scope: any) {
    this._activateScope(scope);
  }

  /**
   * Returns last active scope
   * @private
   */
  private _lastScope(): unknown {
    return this._scopesStack[this._scopesStack.length - 1] || undefined;
  }

  /**
   * Removes scope from stack
   * @param scope
   * @private
   */
  private _removeFromStack(scope: any) {
    const index = this._scopesStack.lastIndexOf(scope);
    // don't remove root scope
    if (index > 0) {
      this._scopesStack.splice(index, 1);
    }
  }

  /**
   * Returns the active scope
   */
  active(): unknown {
    return this._lastScope();
  }

  /**
   * Binds a the certain scope or the active one to the target function and then returns the target
   * @param target
   * @param scope
   */
  bind<T>(target: T | any, scope?: unknown): T {
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
   * Disable the scope manager (clears the scopes)
   */
  disable(): this {
    this._scopesStack = [];
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
    this._createRootScope(window);
    return this;
  }

  /**
   * Calls the callback function [fn] with the provided [scope]. If [scope] is undefined then it will use the window.
   * The scope will be set as active
   * @param scope
   * @param fn Callback function
   */
  with<T extends (...args: unknown[]) => ReturnType<T>>(
    scope: any,
    fn: any
  ): ReturnType<T> {
    if (typeof scope === 'undefined' || scope === null) {
      scope = window;
    }
    this._activateScope(scope);

    try {
      return fn.apply(scope);
    } catch (err) {
      throw err;
    } finally {
      this._removeFromStack(scope);
    }
  }
}

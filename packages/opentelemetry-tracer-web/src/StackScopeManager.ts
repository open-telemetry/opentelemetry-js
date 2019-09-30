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
 */
export class StackScopeManager implements ScopeManager {
  private _currentUid: number = 0;
  private _enabled = false;

  public _scopes: { [uid: number]: unknown } = Object.create(null);
  public _scopesStack: any[] = [];

  private _activateScope(scope: any, uid: number) {
    if (typeof scope === 'object') {
      scope.uid = uid;
    }
    this._scopes[uid] = scope;
    this._scopesStack.push(scope);
  }

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

  private _createNewUid(): number {
    return (this._currentUid = this._currentUid + 1);
  }

  private _createRootScope(scope: any) {
    const uid =
      typeof scope.uid === 'number' ? scope.uid : this._createNewUid();
    this._activateScope(scope, uid);
  }

  private _lastScope(): unknown {
    return this._scopesStack[this._scopesStack.length - 1] || undefined;
  }

  private _removeFromStack(uid: number) {
    const index = this._scopesStack.lastIndexOf(this._scopes[uid]);
    // don't remove root scope
    if (index > 0) {
      this._scopesStack.splice(index, 1);
    }
  }

  private _removeScope(uid: number) {
    this._removeFromStack(uid);
    const index = this._scopesStack.indexOf(this._scopes[uid]);

    // don't remove root scope
    if (index < 0 && this._scopes[uid] !== window) {
      delete this._scopes[uid];
    }
  }

  active(): unknown {
    return this._lastScope();
  }

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

  disable(): this {
    this._scopes = {};
    this._scopesStack = [];
    this._enabled = false;
    return this;
  }

  enable(): this {
    if (this._enabled) {
      return this;
    }
    this._enabled = true;
    this._createRootScope(window);
    return this;
  }

  with<T extends (...args: unknown[]) => ReturnType<T>>(
    scope: any,
    fn: any
  ): ReturnType<T> {
    if (typeof scope === 'undefined' || scope === null) {
      scope = window;
    }
    const uid =
      typeof scope.uid === 'number' ? scope.uid : this._createNewUid();
    this._activateScope(scope, uid);

    try {
      return fn.apply(scope);
    } catch (err) {
      throw err;
    } finally {
      this._removeScope(uid);
    }
  }
}

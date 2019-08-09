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

import { ScopeManager } from '@opentelemetry/scope-base';
import * as asyncHooks from 'async_hooks';

export class AsyncHooksScopeManager implements ScopeManager {
  private _asyncHook: asyncHooks.AsyncHook;
  private _scopes: { [uid: number]: unknown } = Object.create(null);

  constructor() {
    this._asyncHook = asyncHooks.createHook({
      init: this._init.bind(this),
      destroy: this._destroy.bind(this),
      promiseResolve: this._destroy.bind(this),
    });
  }

  active(): unknown {
    return this._scopes[asyncHooks.executionAsyncId()] || null;
  }

  with<T extends (...args: unknown[]) => ReturnType<T>>(
    scope: unknown,
    fn: T
  ): ReturnType<T> {
    const uid = asyncHooks.executionAsyncId();
    const oldScope = this._scopes[uid];
    this._scopes[uid] = scope;
    try {
      return fn();
    } catch (err) {
      throw err;
    } finally {
      if (oldScope === undefined) {
        this._destroy(uid);
      } else {
        this._scopes[uid] = oldScope;
      }
    }
  }

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

  enable(): this {
    this._asyncHook.enable();
    return this;
  }

  disable(): this {
    this._asyncHook.disable();
    this._scopes = {};
    return this;
  }

  private _bindFunction<T extends Function>(target: T, scope?: unknown): T {
    const manager = this;
    const contextWrapper = function(this: {}, ...args: unknown[]) {
      return manager.with(scope, () => target.apply(this, args));
    };
    Object.defineProperty(contextWrapper, 'length', {
      enumerable: false,
      configurable: true,
      writable: false,
      value: target.length,
    });
    /**
     * It isn't possible to tell Typescript that contextWrapper is the same as T
     * so we forced to cast as any here.
     */
    // tslint:disable-next-line:no-any
    return contextWrapper as any;
  }

  /**
   * Init hook will be called when userland create a async scope, setting the
   * scope as the current one if it exist.
   * @param uid id of the async scope
   */
  private _init(uid: number) {
    this._scopes[uid] = this._scopes[asyncHooks.executionAsyncId()];
  }

  /**
   * Destroy hook will be called when a given scope is no longer used so we can
   * remove its attached scope.
   * @param uid uid of the async scope
   */
  private _destroy(uid: number) {
    delete this._scopes[uid];
  }
}

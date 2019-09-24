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

export class StackScopeManager implements ScopeManager {
  private currentUid: number = 0;
  private enabled = false;

  public scopes: { [uid: number]: unknown } = Object.create(null);
  public scopesStack: any[] = [];

  constructor() {}

  private activateScope(scope: any, uid: number) {
    if (typeof scope === 'object') {
      scope.uid = uid;
    }
    this.scopes[uid] = scope;
    this.scopesStack.push(scope);
  }

  private bindFunction<T extends Function>(target: T, scope?: unknown): T {
    const manager = this;
    const contextWrapper: any = function (...args: unknown[]) {
      return manager.with(scope, () => target.apply(scope, args));
    };
    Object.defineProperty(contextWrapper, 'length', {
      enumerable: false,
      configurable: true,
      writable: false,
      value: target.length
    });
    return contextWrapper as any;
  }

  private createNewUid(): number {
    return (this.currentUid = this.currentUid + 1);
  }

  private createRootScope(scope: any) {
    const uid = typeof scope.uid === 'number' ? scope.uid : this.createNewUid();
    this.activateScope(scope, uid);
  }

  private lastScope(): unknown {
    return this.scopesStack[this.scopesStack.length - 1] || undefined;
  }

  private removeFromStack(uid: number) {
    const index = this.scopesStack.lastIndexOf(this.scopes[uid]);
    // don't remove root scope
    if (index > 0) {
      this.scopesStack.splice(index, 1);
    }
  }

  private removeScope(uid: number) {
    this.removeFromStack(uid);
    const index = this.scopesStack.indexOf(this.scopes[uid]);

    // don't remove root scope
    if (index < 0 && this.scopes[uid] !== window) {
      delete this.scopes[uid];
    }
  }

  active(): unknown {
    return this.lastScope();
  }

  bind<T>(target: T | any, scope?: unknown): T {
    // if no specific scope to propagate is given, we use the current one
    if (scope === undefined) {
      scope = this.active();
    }
    if (typeof target === 'function') {
      return this.bindFunction(target, scope);
    }
    return target;
  }

  disable(): this {
    this.scopes = {};
    this.scopesStack = [];
    this.enabled = false;
    return this;
  }

  enable(): this {
    if (this.enabled) {
      return this;
    }
    this.enabled = true;
    this.createRootScope(window);
    return this;
  }

  with<T extends (...args: unknown[]) => ReturnType<T>>(
    scope: any,
    fn: any
  ): ReturnType<T> {
    if (typeof scope === 'undefined' || scope === null) {
      scope = window;
    }
    const uid = typeof scope.uid === 'number' ? scope.uid : this.createNewUid();
    this.activateScope(scope, uid);

    try {
      return fn.apply(scope);
    } catch (err) {
      throw err;
    } finally {
      this.removeScope(uid);
    }
  }

  // @TODO make async
  // private _withAsync<T extends (...args: unknown[]) => ReturnType<T>>(
  //   scope: any,
  //   fn: any
  // ): Promise<T> {
  //   const uid = typeof scope.uid === 'number' ? scope.uid : this.createNewUid();
  //   // const oldScope = this.scopes[uid];
  //   this.activateScope(scope, uid);
  //
  //   return new Promise(async (resolve, reject) => {
  //     Promise.resolve().then(() => {
  //       return fn.apply(scope);
  //     }).then((result) => {
  //       resolve(result);
  //       this.removeScope(uid);
  //     }).catch((e) => {
  //       console.log('error', e);
  //       throw e;
  //     });
  //   });
  //
  //   // try {
  //   //   return fn.apply(scope);
  //   // } catch (err) {
  //   //   console.log('error', err);
  //   //   throw err;
  //   // } finally {
  //   //   this.removeScope(uid);
  //   // }
  // }
}

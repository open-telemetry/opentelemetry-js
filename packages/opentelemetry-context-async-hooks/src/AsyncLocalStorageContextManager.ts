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

import { Context, ROOT_CONTEXT, Token } from '@opentelemetry/api';
import { AsyncLocalStorage } from 'async_hooks';
import { AbstractAsyncHooksContextManager } from './AbstractAsyncHooksContextManager';

export class AsyncLocalStorageContextManager extends AbstractAsyncHooksContextManager {
  private _asyncLocalStorage: AsyncLocalStorage<Context>;

  constructor() {
    super();
    this._asyncLocalStorage = new AsyncLocalStorage();
  }

  active(): Context {
    return this._asyncLocalStorage.getStore() ?? ROOT_CONTEXT;
  }

  with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    context: Context,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F> {
    const cb = thisArg == null ? fn : fn.bind(thisArg);
    return this._asyncLocalStorage.run(context, cb as never, ...args);
  }

  enable(): this {
    return this;
  }

  disable(): this {
    this._asyncLocalStorage.disable();
    return this;
  }

  /**
   * Attach a context to the current asynchronous execution chain.
   *
   * This method synchronously sets the given context as active for the current
   * async execution chain and all subsequent async operations spawned from it
   * (e.g., Promises, setTimeout, setImmediate, async/await).
   *
   * Unlike `with()`, which automatically restores context when the callback completes,
   * `attach()` requires manual cleanup via `detach()` to prevent context leaks.
   *
   * @param context The context to attach
   * @returns A token containing the previous context, used to restore it via detach()
   * @example
   * ```typescript
   * const token = contextManager.attach(myContext);
   * // myContext is now active and will propagate to async operations
   * await doSomethingAsync(); // myContext is still active here
   * contextManager.detach(token); // Restore previous context
   * ```
   */
  attach(context: Context): Token {
    const previousContext = this.active();
    this._asyncLocalStorage.enterWith(context);
    return previousContext as unknown as Token;
  }

  /**
   * Restore the context to the value it had before the corresponding attach() call.
   *
   * This method synchronously restores the context stored in the token, which should
   * be the return value from a previous `attach()` call. Each `attach()` call should
   * have a corresponding `detach()` to avoid context leaks.
   *
   * @param token The token returned by attach(), containing the previous context
   * @example
   * ```typescript
   * const token = contextManager.attach(myContext);
   * try {
   *   // Do work with myContext active
   * } finally {
   *   contextManager.detach(token); // Always restore context
   * }
   * ```
   */
  detach(token: Token): void {
    this._asyncLocalStorage.enterWith(token as unknown as Context);
  }
}

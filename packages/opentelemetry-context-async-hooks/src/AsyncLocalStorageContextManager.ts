/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context, Token } from '@opentelemetry/api';
import { ROOT_CONTEXT } from '@opentelemetry/api';
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
   * Imperatively sets `context` as active for the current async execution chain
   * and operations spawned from it. Returns a {@link Token} whose `dispose()`
   * restores the previous context (see {@link ContextManager.attach}).
   *
   * On Node.js 25.9+, delegates to `AsyncLocalStorage.withScope()` which returns
   * a native `RunScope` that also implements `[Symbol.dispose]` for use with the
   * `using` keyword. On older Node.js versions, falls back to `enterWith()` and
   * returns a manual wrapper with a `dispose()` method.
   *
   * @experimental This API is experimental and may change in minor releases without prior notice.
   */
  attach(context: Context): Token {
    // Node.js 25.9+: withScope() returns a RunScope with dispose() + [Symbol.dispose]()
    const withScope = (
      this._asyncLocalStorage as AsyncLocalStorage<Context> & {
        withScope?: (value: Context) => Token;
      }
    ).withScope;
    if (withScope) {
      return withScope.call(this._asyncLocalStorage, context);
    }

    // Fallback for older Node.js: enterWith() + manual disposable wrapper
    const previousContext = this.active();
    this._asyncLocalStorage.enterWith(context);
    const token: Token = {
      dispose: () => {
        this._asyncLocalStorage.enterWith(previousContext);
      },
    };
    // Forward compat: add [Symbol.dispose] for TypeScript 5.2+ `using` keyword
    const symbolDispose = (Symbol as { dispose?: symbol }).dispose;
    if (symbolDispose !== undefined) {
      (token as unknown as Record<symbol, () => void>)[symbolDispose] =
        token.dispose;
    }
    return token;
  }
}

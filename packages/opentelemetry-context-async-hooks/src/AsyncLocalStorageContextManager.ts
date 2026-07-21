/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Context, Token } from '@opentelemetry/api';
import { ROOT_CONTEXT } from '@opentelemetry/api';
import { AsyncLocalStorage } from 'async_hooks';
import { AbstractAsyncHooksContextManager } from './AbstractAsyncHooksContextManager';

/**
 * Wrapper around a token and _asyncLocalStorage to mirror the behavior of
 * a Node.js RunScope
 *
 * @internal not intended for direct public consumption. Will be removed once
 * withScope is available on all supported Node.js versions
 */
class DisposeOnceToken implements Token {
  private _isDisposed = false;
  private readonly _previousContext: Context;
  private readonly _asyncLocalStorage: AsyncLocalStorage<Context>;

  constructor(
    previousContext: Context,
    asyncLocalStorage: AsyncLocalStorage<Context>
  ) {
    this._previousContext = previousContext;
    this._asyncLocalStorage = asyncLocalStorage;
  }

  dispose() {
    if (this._isDisposed) {
      return;
    }

    this._asyncLocalStorage.enterWith(this._previousContext);
    this._isDisposed = true;
  }
  [Symbol.dispose]() {
    this.dispose();
  }
}

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
   * a native `RunScope` implementing both `dispose()` and `[Symbol.dispose]()`.
   * On older Node.js versions, falls back to `enterWith()` with a manual token.
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

    // Fallback for older Node.js - this can be dropped when the minimum supported
    // Node.js version of this package is 25.9 or higher.
    const previousContext = this.active();
    this._asyncLocalStorage.enterWith(context);
    return new DisposeOnceToken(previousContext, this._asyncLocalStorage);
  }
}

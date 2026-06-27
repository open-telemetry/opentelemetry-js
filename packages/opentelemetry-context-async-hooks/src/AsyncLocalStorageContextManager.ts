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
   * and operations spawned from it. Propagates across async boundaries, but does
   * not auto-restore - see the contract on {@link ContextManager.attach} (prefer
   * `with()`/`bind()`; pair every `attach` with a `detach`).
   *
   * @experimental This API is experimental and may change in minor releases without prior notice.
   */
  attach(context: Context): Token {
    const previousContext = this.active();
    this._asyncLocalStorage.enterWith(context);
    return previousContext as unknown as Token;
  }

  /**
   * Restores the context captured by the {@link attach} call that produced
   * `token`. See {@link ContextManager.detach}. Calling detach twice will
   * result in unspecified behavior.
   *
   * @experimental This API is experimental and may change in minor releases without prior notice.
   */
  detach(token: Token): void {
    this._asyncLocalStorage.enterWith(token as unknown as Context);
  }
}

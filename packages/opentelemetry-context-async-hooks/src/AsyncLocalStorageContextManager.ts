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

import { Context, ROOT_CONTEXT } from '@opentelemetry/api';

// In some JS runtimes, AsyncLocalStorage is not accessible through the
// `async_hooks` API. This may cause crashes when `async_hooks` is attempted to
// be imported. Node.js provides all of its APIs via the global object, including
// `async_hooks`, meaning we can access `AsyncLocalStorage` through the global
// object. Other runtimes, like the Vercel Edge runtime put the `AsyncLocalStorage`
// binding on the global object directly.
// The import below is only used for type information and needs to be a `type`
// import, otherwise, it may create errors on runtimes that don't support the
// `async_hooks` API.
import type { AsyncLocalStorage } from 'async_hooks';

import { AbstractAsyncHooksContextManager } from './AbstractAsyncHooksContextManager';

type AsyncLocalStorageClass = new () => AsyncLocalStorage<Context>;

export class AsyncLocalStorageContextManager extends AbstractAsyncHooksContextManager {
  private _asyncLocalStorage: AsyncLocalStorage<Context>;

  constructor() {
    super();

    const _globalThis = typeof globalThis === 'object' ? globalThis : global;
    const globalWithAsyncLocalStorage = _globalThis as typeof _globalThis & {
      // Available in Node 14+
      async_hooks?: {
        AsyncLocalStorage?: AsyncLocalStorageClass;
      };
      // Available in environments like Vercel Edge
      AsyncLocalStorage?: AsyncLocalStorageClass;
    };

    const AsyncLocalStorageClass =
      (globalWithAsyncLocalStorage.async_hooks &&
        globalWithAsyncLocalStorage.async_hooks.AsyncLocalStorage) ||
      globalWithAsyncLocalStorage.AsyncLocalStorage;

    if (!AsyncLocalStorageClass) {
      throw new Error(
        'AbstractAsyncHooksContext manager is not supported in this JavaScript runtime'
      );
    }

    this._asyncLocalStorage = new AsyncLocalStorageClass();
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
}

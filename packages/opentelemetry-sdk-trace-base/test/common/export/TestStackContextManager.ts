/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContextManager, Context, ROOT_CONTEXT } from '@opentelemetry/api';

/**
 * A test-only ContextManager that uses an in-memory stack to keep track of
 * the active context.
 *
 * This is not intended for advanced or asynchronous use cases.
 */
export class TestStackContextManager implements ContextManager {
  private _contextStack: Context[] = [];

  active(): Context {
    return this._contextStack[this._contextStack.length - 1] ?? ROOT_CONTEXT;
  }

  with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    context: Context,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F> {
    this._contextStack.push(context);
    try {
      return fn.call(thisArg, ...args);
    } finally {
      this._contextStack.pop();
    }
  }

  bind<T>(context: Context, target: T): T {
    throw new Error('Method not implemented.');
  }

  enable(): this {
    return this;
  }

  disable(): this {
    return this;
  }
}

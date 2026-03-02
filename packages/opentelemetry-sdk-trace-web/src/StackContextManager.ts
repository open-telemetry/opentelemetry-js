/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, ContextManager, ROOT_CONTEXT } from '@opentelemetry/api';

/**
 * Stack Context Manager for managing the state in web
 * it doesn't fully support the async calls though
 */
export class StackContextManager implements ContextManager {
  /**
   * whether the context manager is enabled or not
   */
  private _enabled = false;

  /**
   * Keeps the reference to current context
   */
  public _currentContext = ROOT_CONTEXT;

  /**
   *
   * @param context
   * @param target Function to be executed within the context
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private _bindFunction<T extends Function>(
    context = ROOT_CONTEXT,
    target: T
  ): T {
    const manager = this;
    const contextWrapper = function (this: unknown, ...args: unknown[]) {
      return manager.with(context, () => target.apply(this, args));
    };
    Object.defineProperty(contextWrapper, 'length', {
      enumerable: false,
      configurable: true,
      writable: false,
      value: target.length,
    });
    return contextWrapper as unknown as T;
  }

  /**
   * Returns the active context
   */
  active(): Context {
    return this._currentContext;
  }

  /**
   * Binds a the certain context or the active one to the target function and then returns the target
   * @param context A context (span) to be bind to target
   * @param target a function or event emitter. When target or one of its callbacks is called,
   *  the provided context will be used as the active context for the duration of the call.
   */
  bind<T>(context: Context, target: T): T {
    // if no specific context to propagate is given, we use the current one
    if (context === undefined) {
      context = this.active();
    }
    if (typeof target === 'function') {
      return this._bindFunction(context, target);
    }
    return target;
  }

  /**
   * Disable the context manager (clears the current context)
   */
  disable(): this {
    this._currentContext = ROOT_CONTEXT;
    this._enabled = false;
    return this;
  }

  /**
   * Enables the context manager and creates a default(root) context
   */
  enable(): this {
    if (this._enabled) {
      return this;
    }
    this._enabled = true;
    this._currentContext = ROOT_CONTEXT;
    return this;
  }

  /**
   * Calls the callback function [fn] with the provided [context]. If [context] is undefined then it will use the window.
   * The context will be set as active
   * @param context
   * @param fn Callback function
   * @param thisArg optional receiver to be used for calling fn
   * @param args optional arguments forwarded to fn
   */
  with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    context: Context | null,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F> {
    const previousContext = this._currentContext;
    this._currentContext = context || ROOT_CONTEXT;

    try {
      return fn.call(thisArg, ...args);
    } finally {
      this._currentContext = previousContext;
    }
  }
}

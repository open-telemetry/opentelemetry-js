/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NoopContextManager } from '../context/NoopContextManager';
import type { Context, ContextManager, Token } from '../context/types';
import {
  getGlobal,
  registerGlobal,
  unregisterGlobal,
} from '../internal/global-utils';
import { DiagAPI } from './diag';

const API_NAME = 'context';
const NOOP_CONTEXT_MANAGER = new NoopContextManager();

/**
 * Singleton object which represents the entry point to the OpenTelemetry Context API
 *
 * @since 1.0.0
 */
export class ContextAPI {
  private static _instance?: ContextAPI;

  /** Empty private constructor prevents end users from constructing a new instance of the API */
  private constructor() {}

  /** Get the singleton instance of the Context API */
  public static getInstance(): ContextAPI {
    if (!this._instance) {
      this._instance = new ContextAPI();
    }

    return this._instance;
  }

  /**
   * Set the current context manager.
   *
   * @returns true if the context manager was successfully registered, else false
   */
  public setGlobalContextManager(contextManager: ContextManager): boolean {
    return registerGlobal(API_NAME, contextManager, DiagAPI.instance());
  }

  /**
   * Get the currently active context
   */
  public active(): Context {
    return this._getContextManager().active();
  }

  /**
   * Execute a function with an active context
   *
   * @param context context to be active during function execution
   * @param fn function to execute in a context
   * @param thisArg optional receiver to be used for calling fn
   * @param args optional arguments forwarded to fn
   */
  public with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    context: Context,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F> {
    return this._getContextManager().with(context, fn, thisArg, ...args);
  }

  /**
   * Bind a context to a target function or event emitter
   *
   * @param context context to bind to the event emitter or function. Defaults to the currently active context
   * @param target function or event emitter to bind
   */
  public bind<T>(context: Context, target: T): T {
    return this._getContextManager().bind(context, target);
  }

  /**
   * Associates a Context with the caller's current execution unit. This allows
   * context to be set imperatively rather than via the callback-scoped with().
   * It is primarily intended for bridging callback boundaries that with() cannot
   * wrap, such as Node.js `diagnostics_channel` tracing-channel subscribers.
   *
   * NOTE: support is best-effort and varies by the active ContextManager - see
   * {@link ContextManager.attach}. When guaranteed propagation across asynchronous
   * operations is required, prefer with()/bind().
   *
   * Every attach() call must be paired with a detach() call to avoid context
   * leaks.
   *
   * @param context The Context to attach
   * @returns A Token that can be used to restore the previous Context
   * @since 1.10.0
   */
  public attach(context: Context): Token {
    return this._getContextManager().attach(context);
  }

  /**
   * Restores the Context associated with the caller's current execution unit
   * to the value it had before the corresponding attach() call.
   *
   * As with attach(), support is best-effort and varies by the active
   * ContextManager.
   *
   * @param token A Token returned by a previous call to attach()
   * @since 1.10.0
   */
  public detach(token: Token): void {
    return this._getContextManager().detach(token);
  }

  private _getContextManager(): ContextManager {
    return getGlobal(API_NAME) || NOOP_CONTEXT_MANAGER;
  }

  /** Disable and remove the global context manager */
  public disable() {
    this._getContextManager().disable();
    unregisterGlobal(API_NAME, DiagAPI.instance());
  }
}

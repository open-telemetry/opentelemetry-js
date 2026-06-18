/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ROOT_CONTEXT } from '../context/context';
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

  /**
   * Tracks whether we have already warned that the active ContextManager does
   * not implement attach()/detach(), so we warn at most once per operation
   * instead of on every call.
   */
  private _attachUnsupportedWarned = false;
  private _detachUnsupportedWarned = false;

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
   * Imperatively sets `context` as active, returning a {@link Token} for {@link detach}.
   *
   * This is a delicate, low-level API - prefer {@link with}/{@link bind}, which
   * restore context automatically. Use `attach`/`detach` only to bridge callback
   * boundaries that `with` cannot wrap (e.g. Node.js `diagnostics_channel`
   * tracing-channel subscribers). You then own the bookkeeping `with` handles:
   * pair every `attach` with a `detach` in reverse (LIFO) order; unpaired or
   * out-of-order calls leak or mis-restore context.
   *
   * Support is best-effort and varies by the active ContextManager (see
   * {@link ContextManager.attach}); if it does not implement `attach`, this logs
   * a warning and returns a token that has no effect when passed to detach().
   *
   * @param context The Context to attach
   * @returns A Token that can be used to restore the previous Context
   * @since 1.10.0
   * @experimental This API is experimental and may change in minor releases without prior notice.
   */
  public attach(context: Context): Token {
    const contextManager = this._getContextManager();
    if (contextManager.attach) {
      return contextManager.attach(context);
    }
    if (!this._attachUnsupportedWarned) {
      this._attachUnsupportedWarned = true;
      DiagAPI.instance().warn(
        'The current ContextManager does not implement attach(). The context will not be attached. Use a ContextManager that supports attach()/detach() (e.g. AsyncLocalStorageContextManager) or use with()/bind() instead.'
      );
    }
    return ROOT_CONTEXT as unknown as Token;
  }

  /**
   * Restores the Context to the value it had before the corresponding
   * {@link attach} call. Best-effort and varies by the active ContextManager;
   * see {@link attach} for the usage contract.
   *
   * @param token A Token returned by a previous call to attach()
   * @since 1.10.0
   * @experimental This API is experimental and may change in minor releases without prior notice.
   */
  public detach(token: Token): void {
    const contextManager = this._getContextManager();
    if (contextManager.detach) {
      return contextManager.detach(token);
    }
    if (!this._detachUnsupportedWarned) {
      this._detachUnsupportedWarned = true;
      DiagAPI.instance().warn(
        'The current ContextManager does not implement detach(). The context will not be restored.'
      );
    }
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

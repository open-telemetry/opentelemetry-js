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

import { NoopContextManager } from '../context/NoopContextManager';
import { Context, ContextManager } from '../context/types';
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

  private _getContextManager(): ContextManager {
    return getGlobal(API_NAME) || NOOP_CONTEXT_MANAGER;
  }

  /** Disable and remove the global context manager */
  public disable() {
    this._getContextManager().disable();
    unregisterGlobal(API_NAME, DiagAPI.instance());
  }
}

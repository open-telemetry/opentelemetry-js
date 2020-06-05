/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { ContextManager, Context } from '@opentelemetry/context-base';
import * as asyncHooks from 'async_hooks';
import { EventEmitter } from 'events';

type Func<T> = (...args: unknown[]) => T;

type PatchedEventEmitter = {
  /**
   * Store a map for each event of all original listener and their "patched"
   * version so when the listener is removed by the user, we remove the
   * corresponding "patched" function.
   */
  __ot_listeners?: { [name: string]: WeakMap<Func<void>, Func<void>> };
} & EventEmitter;

const ADD_LISTENER_METHODS = [
  'addListener' as 'addListener',
  'on' as 'on',
  'once' as 'once',
  'prependListener' as 'prependListener',
  'prependOnceListener' as 'prependOnceListener',
];

export class AsyncHooksContextManager implements ContextManager {
  private _asyncHook: asyncHooks.AsyncHook;
  private _contexts: Map<number, Context | undefined> = new Map();
  private _stack: Array<Context | undefined> = [];

  constructor() {
    this._asyncHook = asyncHooks.createHook({
      init: this._init.bind(this),
      before: this._before.bind(this),
      after: this._after.bind(this),
      destroy: this._destroy.bind(this),
      promiseResolve: this._destroy.bind(this),
    });
  }

  active(): Context {
    return this._stack[this._stack.length - 1] ?? Context.ROOT_CONTEXT;
  }

  with<T extends (...args: unknown[]) => ReturnType<T>>(
    context: Context,
    fn: T
  ): ReturnType<T> {
    this._enterContext(context);
    try {
      return fn();
    } finally {
      this._exitContext();
    }
  }

  bind<T>(target: T, context?: Context): T {
    // if no specific context to propagate is given, we use the current one
    if (context === undefined) {
      context = this.active();
    }
    if (target instanceof EventEmitter) {
      return this._bindEventEmitter(target, context);
    } else if (typeof target === 'function') {
      return this._bindFunction(target, context);
    }
    return target;
  }

  enable(): this {
    this._asyncHook.enable();
    return this;
  }

  disable(): this {
    this._asyncHook.disable();
    this._contexts.clear();
    this._stack = [];
    return this;
  }

  private _bindFunction<T extends Function>(target: T, context: Context): T {
    const manager = this;
    const contextWrapper = function (this: {}, ...args: unknown[]) {
      return manager.with(context, () => target.apply(this, args));
    };
    Object.defineProperty(contextWrapper, 'length', {
      enumerable: false,
      configurable: true,
      writable: false,
      value: target.length,
    });
    /**
     * It isn't possible to tell Typescript that contextWrapper is the same as T
     * so we forced to cast as any here.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return contextWrapper as any;
  }

  /**
   * By default, EventEmitter call their callback with their context, which we do
   * not want, instead we will bind a specific context to all callbacks that
   * go through it.
   * @param target EventEmitter a instance of EventEmitter to patch
   * @param context the context we want to bind
   */
  private _bindEventEmitter<T extends EventEmitter>(
    target: T,
    context: Context
  ): T {
    const ee = (target as unknown) as PatchedEventEmitter;
    if (ee.__ot_listeners !== undefined) return target;
    ee.__ot_listeners = {};

    // patch methods that add a listener to propagate context
    ADD_LISTENER_METHODS.forEach(methodName => {
      if (ee[methodName] === undefined) return;
      ee[methodName] = this._patchAddListener(ee, ee[methodName], context);
    });
    // patch methods that remove a listener
    if (typeof ee.removeListener === 'function') {
      ee.removeListener = this._patchRemoveListener(ee, ee.removeListener);
    }
    if (typeof ee.off === 'function') {
      ee.off = this._patchRemoveListener(ee, ee.off);
    }
    // patch method that remove all listeners
    if (typeof ee.removeAllListeners === 'function') {
      ee.removeAllListeners = this._patchRemoveAllListeners(
        ee,
        ee.removeAllListeners
      );
    }
    return target;
  }

  /**
   * Patch methods that remove a given listener so that we match the "patched"
   * version of that listener (the one that propagate context).
   * @param ee EventEmitter instance
   * @param original reference to the patched method
   */
  private _patchRemoveListener(ee: PatchedEventEmitter, original: Function) {
    return function (this: {}, event: string, listener: Func<void>) {
      if (
        ee.__ot_listeners === undefined ||
        ee.__ot_listeners[event] === undefined
      ) {
        return original.call(this, event, listener);
      }
      const events = ee.__ot_listeners[event];
      const patchedListener = events.get(listener);
      return original.call(this, event, patchedListener || listener);
    };
  }

  /**
   * Patch methods that remove all listeners so we remove our
   * internal references for a given event.
   * @param ee EventEmitter instance
   * @param original reference to the patched method
   */
  private _patchRemoveAllListeners(
    ee: PatchedEventEmitter,
    original: Function
  ) {
    return function (this: {}, event: string) {
      if (
        ee.__ot_listeners === undefined ||
        ee.__ot_listeners[event] === undefined
      ) {
        return original.call(this, event);
      }
      delete ee.__ot_listeners[event];
      return original.call(this, event);
    };
  }

  /**
   * Patch methods on an event emitter instance that can add listeners so we
   * can force them to propagate a given context.
   * @param ee EventEmitter instance
   * @param original reference to the patched method
   * @param [context] context to propagate when calling listeners
   */
  private _patchAddListener(
    ee: PatchedEventEmitter,
    original: Function,
    context: Context
  ) {
    const contextManager = this;
    return function (this: {}, event: string, listener: Func<void>) {
      if (ee.__ot_listeners === undefined) ee.__ot_listeners = {};
      let listeners = ee.__ot_listeners[event];
      if (listeners === undefined) {
        listeners = new WeakMap();
        ee.__ot_listeners[event] = listeners;
      }
      const patchedListener = contextManager.bind(listener, context);
      // store a weak reference of the user listener to ours
      listeners.set(listener, patchedListener);
      return original.call(this, event, patchedListener);
    };
  }

  /**
   * Init hook will be called when userland create a async context, setting the
   * context as the current one if it exist.
   * @param uid id of the async context
   */
  private _init(uid: number) {
    const context = this._stack[this._stack.length - 1];
    if (context !== undefined) {
      this._contexts.set(uid, context);
    }
  }

  /**
   * Destroy hook will be called when a given context is no longer used so we can
   * remove its attached context.
   * @param uid uid of the async context
   */
  private _destroy(uid: number) {
    this._contexts.delete(uid);
  }

  /**
   * Before hook is called just beforing executing a async context.
   * @param uid uid of the async context
   */
  private _before(uid: number) {
    const context = this._contexts.get(uid);
    if (context !== undefined) {
      this._enterContext(context);
    }
  }

  /**
   * After hook is called just after completing the execution of a async context.
   */
  private _after() {
    this._exitContext();
  }

  /**
   * Set the given context as active
   */
  private _enterContext(context: Context) {
    this._stack.push(context);
  }

  /**
   * Remove the context at the root of the stack
   */
  private _exitContext() {
    this._stack.pop();
  }
}

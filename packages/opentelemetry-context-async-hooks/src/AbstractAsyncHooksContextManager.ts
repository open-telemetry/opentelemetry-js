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

import { ContextManager, Context } from '@opentelemetry/context-base';
import { EventEmitter } from 'events';

const kOtListeners = Symbol('OtListeners');

type Func<T> = (...args: unknown[]) => T;

type PatchedEventEmitter = {
  /**
   * Store a map for each event of all original listener and their "patched"
   * version so when the listener is removed by the user, we remove the
   * corresponding "patched" function.
   */
  [kOtListeners]?: { [name: string]: WeakMap<Func<void>, Func<void>> };
} & EventEmitter;

const ADD_LISTENER_METHODS = [
  'addListener' as const,
  'on' as const,
  'once' as const,
  'prependListener' as const,
  'prependOnceListener' as const,
];

export abstract class AbstractAsyncHooksContextManager
  implements ContextManager {
  abstract active(): Context;

  abstract with<T extends (...args: unknown[]) => ReturnType<T>>(
    context: Context,
    fn: T
  ): ReturnType<T>;

  abstract enable(): this;

  abstract disable(): this;

  bind<T>(target: T, context: Context = this.active()): T {
    if (target instanceof EventEmitter) {
      return this._bindEventEmitter(target, context);
    }

    if (typeof target === 'function') {
      return this._bindFunction(target, context);
    }
    return target;
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
    if (ee[kOtListeners] !== undefined) return target;
    ee[kOtListeners] = {};

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
      const events = ee[kOtListeners]?.[event];
      if (events === undefined) {
        return original.call(this, event, listener);
      }
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
      if (ee[kOtListeners]?.[event] !== undefined) {
        delete ee[kOtListeners]![event];
      }
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
      if (ee[kOtListeners] === undefined) ee[kOtListeners] = {};
      let listeners = ee[kOtListeners]![event];
      if (listeners === undefined) {
        listeners = new WeakMap();
        ee[kOtListeners]![event] = listeners;
      }
      const patchedListener = contextManager.bind(listener, context);
      // store a weak reference of the user listener to ours
      listeners.set(listener, patchedListener);
      return original.call(this, event, patchedListener);
    };
  }
}

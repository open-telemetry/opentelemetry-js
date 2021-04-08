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

import { ContextManager, Context } from '@opentelemetry/api';
import { EventEmitter } from 'events';

type Func<T> = (...args: unknown[]) => T;

/**
 * Store a map for each event of all original listeners and their "patched"
 * version. So when a listener is removed by the user, the corresponding
 * patched function will be also removed.
 */
interface PatchMap {
  [name: string]: WeakMap<Func<void>, Func<void>>;
}

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

  abstract with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    context: Context,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F>;

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
    const contextWrapper = function (this: never, ...args: unknown[]) {
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
   * @param ee EventEmitter an instance of EventEmitter to patch
   * @param context the context we want to bind
   */
  private _bindEventEmitter<T extends EventEmitter>(
    ee: T,
    context: Context
  ): T {
    const map = this._getPatchMap(ee);
    if (map !== undefined) return ee;
    this._createPatchMap(ee);

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
    return ee;
  }

  /**
   * Patch methods that remove a given listener so that we match the "patched"
   * version of that listener (the one that propagate context).
   * @param ee EventEmitter instance
   * @param original reference to the patched method
   */
  private _patchRemoveListener(ee: EventEmitter, original: Function) {
    const contextManager = this;
    return function (this: never, event: string, listener: Func<void>) {
      const events = contextManager._getPatchMap(ee)?.[event];
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
  private _patchRemoveAllListeners(ee: EventEmitter, original: Function) {
    const contextManager = this;
    return function (this: never, event: string) {
      const map = contextManager._getPatchMap(ee);
      if (map !== undefined) {
        if (arguments.length === 0) {
          contextManager._createPatchMap(ee);
        } else if (map[event] !== undefined) {
          delete map[event];
        }
      }
      return original.apply(this, arguments);
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
    ee: EventEmitter,
    original: Function,
    context: Context
  ) {
    const contextManager = this;
    return function (this: never, event: string, listener: Func<void>) {
      let map = contextManager._getPatchMap(ee);
      if (map === undefined) {
        map = contextManager._createPatchMap(ee);
      }
      let listeners = map[event];
      if (listeners === undefined) {
        listeners = new WeakMap();
        map[event] = listeners;
      }
      const patchedListener = contextManager.bind(listener, context);
      // store a weak reference of the user listener to ours
      listeners.set(listener, patchedListener);
      return original.call(this, event, patchedListener);
    };
  }

  private _createPatchMap(ee: EventEmitter): PatchMap {
    const map = Object.create(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ee as any)[this._kOtListeners] = map;
    return map;
  }
  private _getPatchMap(ee: EventEmitter): PatchMap | undefined {
    return (ee as never)[this._kOtListeners];
  }

  private readonly _kOtListeners = Symbol('OtListeners');
}

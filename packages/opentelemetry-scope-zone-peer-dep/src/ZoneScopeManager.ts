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

import { ScopeManager } from '@opentelemetry/scope-base';
import { Func, TargetWithEvents } from './types';
import { isListenerObject } from './util';

/* Key name to be used to save a scope reference in Zone */
const ZONE_SCOPE_KEY = 'OT_ZONE_SCOPE';

/**
 * ZoneScopeManager
 * This module provides an easy functionality for tracing action between asynchronous operations in web.
 * It was not possible with standard [StackScopeManager]{@link https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-web/src/StackScopeManager.ts}.
 * It heavily depends on [zone.js]{@link https://www.npmjs.com/package/zone.js}.
 * It stores the information about scope in zone. Each Scope will have always new Zone;
 * It also supports binding a certain Span to a target that has "addEventListener" and "removeEventListener".
 * When this happens a new zone is being created and the provided Span is being assigned to this zone.
 */
export class ZoneScopeManager implements ScopeManager {
  /**
   * whether the scope manager is enabled or not
   */
  private _enabled = false;

  /**
   * Helps to create a unique name for the zones - part of zone name
   */
  private _zoneCounter = 0;

  /**
   * Returns the active scope from certain zone name
   * @param activeZone
   */
  private _activeScopeFromZone(
    activeZone: Zone | undefined
  ): unknown | undefined {
    return activeZone && activeZone.get(ZONE_SCOPE_KEY);
  }

  /**
   * @param target Function to be executed within the scope
   * @param scope A scope (span) to be executed within target function
   */
  private _bindFunction<T extends Function>(target: T, scope?: unknown): T {
    const manager = this;
    const contextWrapper = function(this: any, ...args: unknown[]) {
      return manager.with(scope, () => target.apply(this || scope, args));
    };
    Object.defineProperty(contextWrapper, 'length', {
      enumerable: false,
      configurable: true,
      writable: false,
      value: target.length,
    });
    return (contextWrapper as unknown) as T;
  }

  /**
   * @param obj target object on which the listeners will be patched
   * @param scope A scope (span) to be bind to target
   */
  private _bindListener<T>(obj: T, scope?: unknown): T {
    const target = (obj as unknown) as TargetWithEvents;
    if (target.__ot_listeners !== undefined) {
      return obj;
    }
    target.__ot_listeners = {};

    if (typeof target.addEventListener === 'function') {
      target.addEventListener = this._patchAddEventListener(
        target,
        target.addEventListener,
        scope
      );
    }

    if (typeof target.removeEventListener === 'function') {
      target.removeEventListener = this._patchRemoveEventListener(
        target,
        target.removeEventListener
      );
    }

    return obj;
  }

  /**
   * Creates a new unique zone name
   */
  private _createZoneName() {
    this._zoneCounter++;
    const random = Math.random();
    return `${this._zoneCounter}-${random}`;
  }

  /**
   * Creates a new zone
   * @param zoneName zone name
   * @param scope A scope (span) to be bind with Zone
   */
  private _createZone(zoneName: string, scope: unknown): Zone {
    return Zone.root.fork({
      name: zoneName,
      properties: {
        [ZONE_SCOPE_KEY]: scope,
      },
    });
  }

  /**
   * Returns the active zone
   */
  private _getActiveZone(): Zone | undefined {
    return Zone.current;
  }

  /**
   * Patches addEventListener method
   * @param target any target that has "addEventListener" method
   * @param original reference to the patched method
   * @param [scope] scope to be bind to the listener
   */
  private _patchAddEventListener(
    target: TargetWithEvents,
    original: Function,
    scope?: unknown
  ) {
    const scopeManager = this;

    return function(this: {}, event: string, listener: Func<void>, opts?: any) {
      if (target.__ot_listeners === undefined) {
        target.__ot_listeners = {};
      }
      let listeners = target.__ot_listeners[event];
      if (listeners === undefined) {
        listeners = new WeakMap();
        target.__ot_listeners[event] = listeners;
      }
      const patchedListener = scopeManager.bind(listener, scope);
      // store a weak reference of the user listener to ours
      listeners.set(listener, patchedListener);
      return original.call(this, event, patchedListener, opts);
    };
  }

  /**
   * Patches removeEventListener method
   * @param target any target that has "removeEventListener" method
   * @param original reference to the patched method
   */
  private _patchRemoveEventListener(
    target: TargetWithEvents,
    original: Function
  ) {
    return function(this: {}, event: string, listener: Func<void>) {
      if (
        target.__ot_listeners === undefined ||
        target.__ot_listeners[event] === undefined
      ) {
        return original.call(this, event, listener);
      }
      const events = target.__ot_listeners[event];
      const patchedListener = events.get(listener);
      events.delete(listener);
      return original.call(this, event, patchedListener || listener);
    };
  }

  /**
   * Returns the active scope
   */
  active(): unknown | undefined {
    const activeZone = this._getActiveZone();

    const active = this._activeScopeFromZone(activeZone);
    if (active) {
      return active;
    }
    if (this._enabled) {
      return window;
    }
    return undefined;
  }

  /**
   * Binds a the certain scope or the active one to the target function and then returns the target
   * @param target
   * @param scope A scope (span) to be bind to target
   */
  bind<T>(target: T | TargetWithEvents, scope?: unknown): T {
    // if no specific scope to propagate is given, we use the current one
    if (scope === undefined) {
      scope = this.active();
    }
    if (typeof target === 'function') {
      return this._bindFunction(target, scope);
    } else if (isListenerObject(target)) {
      this._bindListener(target, scope);
    }
    return (target as unknown) as T;
  }

  /**
   * Disable the scope manager (clears all the scopes)
   */
  disable(): this {
    this._enabled = false;
    return this;
  }

  /**
   * Enables the scope manager and creates a default(root) scope
   */
  enable(): this {
    if (this._enabled) {
      return this;
    }
    this._enabled = true;
    return this;
  }

  /**
   * Calls the callback function [fn] with the provided [scope].
   *     If [scope] is undefined then it will use the active scope.
   *     The scope will be set as active
   * @param scope A scope (span) to be called with provided callback
   * @param fn Callback function
   */
  with<T extends (...args: unknown[]) => ReturnType<T>>(
    scope: unknown,
    fn: () => ReturnType<T>
  ): ReturnType<T> {
    // if no scope use active from active zone
    if (typeof scope === 'undefined' || scope === null) {
      scope = this.active();
    }

    const zoneName = this._createZoneName();

    const newZone = this._createZone(zoneName, scope);

    return newZone.run(fn, scope);
  }
}

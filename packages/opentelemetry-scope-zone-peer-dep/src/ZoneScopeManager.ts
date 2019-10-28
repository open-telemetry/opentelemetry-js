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
import { Func, ScopeWithEventTargets, TargetWithEvents } from './types';
import { isListenerObject } from './util';

/**
 * Zone Scope Manager for managing the state in web
 * it fully supports the async calls
 */
export class ZoneScopeManager implements ScopeManager {
  /**
   * whether the scope manager is enabled or not
   */
  private _enabled = false;

  /**
   * Keeps the the information whether to prevent restoring the scope after zone onInvoke
   */
  private _preventScopeRestoring: { [key: string]: boolean } = {};

  /**
   * Keeps the reference to the scopes per zone
   */
  private _scopes: { [key: string]: unknown[] } = {};

  /**
   * Keeps the reference to the scopes with original event targets
   */
  private _scopesWithEventTargets: ScopeWithEventTargets[] = [];

  /**
   * Helps to create a unique name for the zones - part of zone name
   */
  private _zoneCounter = 0;

  /**
   * Returns the active scope from certain zone name
   * @param activeZoneName
   */
  private _activeScopeFromZoneName(
    activeZoneName: string | undefined
  ): unknown | undefined {
    if (activeZoneName) {
      const scopes = this._scopes[activeZoneName];
      if (scopes) {
        return scopes[scopes.length - 1];
      }
    }
    return undefined;
  }

  /**
   * @param target Function to be executed within the scope
   * @param scope
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
   * @param scope
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
        target.removeEventListener,
        scope
      );
    }

    return obj;
  }

  /**
   * Removes references to the targets that were bind to certain scope / span
   * @param scope
   */
  private _cleanEventTargetsFromScope(scope: any, target?: TargetWithEvents) {
    // console.log('_cleanEventTargetsFromScope1', this._scopesWithEventTargets.length, scope && scope.name);
    for (let i = this._scopesWithEventTargets.length - 1; i >= 0; i--) {
      const scopeWithEventTargets = this._scopesWithEventTargets[i];
      if (scopeWithEventTargets.scope === scope) {
        if (
          typeof target !== 'undefined' &&
          scopeWithEventTargets.target !== target
        ) {
          continue;
        }

        if (scopeWithEventTargets.target) {
          try {
            scopeWithEventTargets.target.addEventListener =
              scopeWithEventTargets.eventTargets.addEventListener;

            scopeWithEventTargets.target.removeEventListener =
              scopeWithEventTargets.eventTargets.removeEventListener;

            delete scopeWithEventTargets.target.__ot_listeners;
          } catch (e) {
            console.log(e);
          }
        }

        this._scopesWithEventTargets.splice(i, 1);

        if (
          typeof target !== 'undefined' &&
          scopeWithEventTargets.target === target
        ) {
          break;
        }
      }
    }
    // console.log('_cleanEventTargetsFromScope2', this._scopesWithEventTargets.length);
  }

  /**
   * Removes all the associated scopes with zone after the zone has no more tasks
   * @param zoneName
   */
  private _cleanScopesFromZone(zoneName: string) {
    const scopes = this._scopes[zoneName];
    for (let i = scopes.length - 1; i >= 0; i--) {
      this._cleanEventTargetsFromScope(scopes[i]);
      scopes.splice(i, 1);
    }
    delete this._scopes[zoneName];
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
   */
  private _createZone(zoneName: string): Zone {
    return Zone.root.fork({
      name: zoneName,
      onInvoke: this._onZoneInvoke.bind(this),
      onHasTask: this._onHasTask.bind(this),
    });
  }

  /**
   * Ensure that appropriate {@link ScopeWithEventTargets} exists if not then create a new one
   * @param scope
   * @param target
   */
  private _ensureScopeWithEventTargetsExists(
    scope: unknown,
    target: TargetWithEvents
  ): ScopeWithEventTargets {
    let foundScope;
    for (const scopeWithEventTargets of this._scopesWithEventTargets) {
      if (
        scopeWithEventTargets.scope === scope &&
        scopeWithEventTargets.target === target
      ) {
        foundScope = scopeWithEventTargets;
        break;
      }
    }
    if (!foundScope) {
      this._scopesWithEventTargets.push({
        scope,
        target,
        eventTargets: {},
      });
      foundScope = this._scopesWithEventTargets[
        this._scopesWithEventTargets.length - 1
      ];
    }
    return foundScope;
  }

  /**
   * Returns the active zone
   */
  private _getActiveZone(): Zone | undefined {
    const currentZone = Zone.current;
    if (currentZone) {
      if (
        this._scopes[currentZone.name] &&
        this._scopes[currentZone.name].length
      ) {
        return currentZone;
      }
    }
    return undefined;
  }

  /**
   * Returns the active zone name if such zone has any scope
   */
  private _getActiveZoneName(): string | undefined {
    const activeZone = this._getActiveZone();
    if (activeZone) {
      return activeZone.name;
    }
    return undefined;
  }

  /**
   * Called when zone executes any async task or after the last async task was executed
   * @param parentZoneDelegate
   * @param currentZone
   * @param targetZone
   * @param hasTaskState
   */
  private _onHasTask(
    parentZoneDelegate: ZoneDelegate,
    currentZone: Zone,
    targetZone: Zone,
    hasTaskState: HasTaskState
  ) {
    // console.log('onHasTask', hasTaskState, this._preventScopeRestoring[currentZone.name]);
    if (
      !hasTaskState.eventTask &&
      !hasTaskState.microTask &&
      !hasTaskState.macroTask
    ) {
      // no more tasks can clean up zone data
      this._cleanScopesFromZone(currentZone.name);
    } else {
      this._preventScopeRestoring[currentZone.name] = true;
    }
  }

  /**
   * Called when zone invokes a delegate (callback) function
   * @param parentZoneDelegate
   * @param currentZone
   * @param targetZone
   * @param delegate
   * @param applyThis
   * @param applyArgs
   * @param source
   */
  private _onZoneInvoke(
    parentZoneDelegate: ZoneDelegate,
    currentZone: Zone,
    targetZone: Zone,
    delegate: Function,
    applyThis: any,
    applyArgs?: any[],
    source?: string
  ) {
    // console.log('onInvoke before', typeof applyThis === 'string' ? applyThis : applyThis && applyThis.name || 'window');
    const result = parentZoneDelegate.invoke(
      targetZone,
      delegate,
      applyThis,
      applyArgs,
      source
    );
    // console.log('onInvoke after', typeof applyThis === 'string' ? applyThis : applyThis && applyThis.name || 'window', this._preventScopeRestoring[currentZone.name]);
    // if zone has asynchronous task then restoring scope cannot be done immediately
    // scopes will be cleaned later in _onHasTask - when there are no more tasks
    if (!this._preventScopeRestoring[currentZone.name]) {
      this._restorePreviousScope(currentZone);
    }
    return result;
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
    this._saveOriginalAddEventWithScope(scope, target, original);

    return function(this: {}, event: string, listener: Func<void>) {
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
      return original.call(this, event, patchedListener);
    };
  }

  /**
   * Patches removeEventListener method
   * @param target any target that has "removeEventListener" method
   * @param original reference to the patched method
   * @param [scope] scope to be bind to the listener
   */
  private _patchRemoveEventListener(
    target: TargetWithEvents,
    original: Function,
    scope?: unknown
  ) {
    const scopeManager = this;
    this._saveOriginalRemoveEventWithScope(scope, target, original);
    return function(this: {}, event: string, listener: Func<void>) {
      if (
        target.__ot_listeners === undefined ||
        target.__ot_listeners[event] === undefined
      ) {
        return original.call(this, event, listener);
      }
      const events = target.__ot_listeners[event];
      const patchedListener = events.get(listener);
      scopeManager._cleanEventTargetsFromScope(scope, target);
      return original.call(this, event, patchedListener || listener);
    };
  }

  /**
   * Restores previous scope for certain zone
   * @param zone
   */
  private _restorePreviousScope(zone: Zone) {
    const zoneName = zone.name;
    const scopes = this._scopes[zoneName];
    if (scopes && scopes.length > 0) {
      this._cleanEventTargetsFromScope(scopes[scopes.length - 1]);
      scopes.splice(scopes.length - 1, 1);
    }
  }

  /**
   * Saves original addEventListener method so it can be restored later
   * @param scope
   * @param target
   * @param original original addEventListener method
   */
  private _saveOriginalAddEventWithScope(
    scope: unknown,
    target: TargetWithEvents,
    original: any
  ) {
    const foundScope = this._ensureScopeWithEventTargetsExists(scope, target);
    if (foundScope) {
      foundScope.eventTargets.addEventListener = original;
    }
  }

  /**
   * Saves original removeEventListener method so it can be restored later
   * @param scope
   * @param target
   * @param original original removeEventListener method
   */
  private _saveOriginalRemoveEventWithScope(
    scope: unknown,
    target: TargetWithEvents,
    original: any
  ) {
    const foundScope = this._ensureScopeWithEventTargetsExists(scope, target);
    if (foundScope) {
      foundScope.eventTargets.removeEventListener = original;
    }
  }

  /**
   * Returns the active scope
   */
  active(): unknown | undefined {
    const activeZoneName = this._getActiveZoneName();

    const active = this._activeScopeFromZoneName(activeZoneName);
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
   * @param scope
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
    const zoneNames = Object.keys(this._scopes);
    for (const zoneName of zoneNames) {
      this._cleanScopesFromZone(zoneName);
    }
    this._scopes = {};
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
   * @param scope
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

    let zoneName: string;
    let activeZone = this._getActiveZone();
    if (!activeZone) {
      zoneName = this._createZoneName();
    } else {
      zoneName = activeZone.name;
    }

    this._scopes[zoneName] = this._scopes[zoneName] || [];
    this._scopes[zoneName].push(scope);

    if (!activeZone) {
      activeZone = this._createZone(zoneName);
    }

    return activeZone.run(fn, scope);
  }
}

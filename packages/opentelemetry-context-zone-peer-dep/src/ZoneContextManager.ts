/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="zone.js" />
import type { Context, ContextManager, Token } from '@opentelemetry/api';
import { ROOT_CONTEXT } from '@opentelemetry/api';
import type { TargetWithEvents } from './types';
import { isListenerObject } from './util';

/* Key name to be used to save a context reference in Zone */
const ZONE_CONTEXT_KEY = 'OT_ZONE_CONTEXT';
/* Key name to be used to save the sequence number of a Zone context. It is used
 * to determine recency relative to imperatively attached contexts. */
const ZONE_CONTEXT_SEQ_KEY = 'OT_ZONE_CONTEXT_SEQ';

/* An imperatively attached context together with the sequence number assigned at
 * attach time, used by active() to resolve precedence against Zone contexts. */
interface AttachedContext {
  context: Context;
  seq: number;
}

/**
 * ZoneContextManager
 * This module provides an easy functionality for tracing action between asynchronous operations in web.
 * It was not possible with standard [StackContextManager]{@link https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-sdk-trace-web/src/StackContextManager.ts}.
 * It heavily depends on [zone.js]{@link https://www.npmjs.com/package/zone.js}.
 * It stores the information about context in zone. Each Context will have always new Zone;
 * It also supports binding a certain Span to a target that has "addEventListener" and "removeEventListener".
 * When this happens a new zone is being created and the provided Span is being assigned to this zone.
 */
export class ZoneContextManager implements ContextManager {
  /**
   * whether the context manager is enabled or not
   */
  private _enabled = false;

  /**
   * Monotonically increasing counter used to order contexts established via
   * `with()` (stored on the Zone) and via `attach()` (stored on the manager),
   * so that `active()` can return whichever was established most recently.
   */
  private _seq = 0;

  /**
   * Stack of contexts attached imperatively via `attach()`. This state is
   * manager-global and therefore not isolated across concurrent asynchronous
   * Zones - see the note on `attach()`.
   */
  private _attachedContexts: AttachedContext[] = [];

  /**
   * @param context A context (span) to be executed within target function
   * @param target Function to be executed within the context
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private _bindFunction<T extends Function>(context: Context, target: T): T {
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
   * @param context A context (span) to be bind to target
   * @param obj target object on which the listeners will be patched
   */
  private _bindListener<T>(context: Context, obj: T): T {
    const target = obj as unknown as TargetWithEvents;
    if (target.__ot_listeners !== undefined) {
      return obj;
    }
    target.__ot_listeners = {};

    if (typeof target.addEventListener === 'function') {
      target.addEventListener = this._patchAddEventListener(
        target,
        target.addEventListener,
        context
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
   * Creates a new zone
   * @param zoneName zone name
   * @param context A context (span) to be bind with Zone
   */
  private _createZone(zoneName: string, context: unknown): Zone {
    return Zone.current.fork({
      name: zoneName,
      properties: {
        [ZONE_CONTEXT_KEY]: context,
        [ZONE_CONTEXT_SEQ_KEY]: ++this._seq,
      },
      onCancelTask(
        parentZoneDelegate: ZoneDelegate,
        currentZone: Zone,
        targetZone: Zone,
        task: Task
      ): Task {
        if (task.state === 'notScheduled' || task.state === 'running') {
          return task;
        }
        return parentZoneDelegate.cancelTask(targetZone, task);
      },
    });
  }

  /**
   * Patches addEventListener method
   * @param target any target that has "addEventListener" method
   * @param original reference to the patched method
   * @param [context] context to be bind to the listener
   */
  private _patchAddEventListener(
    target: TargetWithEvents,
    original: NonNullable<TargetWithEvents['addEventListener']>,
    context: Context
  ) {
    const contextManager = this;

    return function (this: TargetWithEvents, event, listener, opts) {
      if (target.__ot_listeners === undefined) {
        target.__ot_listeners = {};
      }
      let listeners = target.__ot_listeners[event];
      if (listeners === undefined) {
        listeners = new WeakMap();
        target.__ot_listeners[event] = listeners;
      }
      const patchedListener = contextManager.bind(context, listener);
      // store a weak reference of the user listener to ours
      listeners.set(listener, patchedListener);
      return original.call(this, event, patchedListener, opts);
    } as TargetWithEvents['addEventListener'];
  }

  /**
   * Patches removeEventListener method
   * @param target any target that has "removeEventListener" method
   * @param original reference to the patched method
   */
  private _patchRemoveEventListener(
    target: TargetWithEvents,
    original: NonNullable<TargetWithEvents['removeEventListener']>
  ) {
    return function (this: TargetWithEvents, event, listener) {
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
    } as TargetWithEvents['removeEventListener'];
  }

  /**
   * Returns the active context
   */
  active(): Context {
    if (!this._enabled || !Zone.current) {
      return ROOT_CONTEXT;
    }
    // Prefer an imperatively attached context over the current Zone context when
    // it was established more recently (higher sequence number). A Zone without a
    // sequence (e.g. the root Zone) is treated as older than any attached context.
    const attached = this._attachedContexts[this._attachedContexts.length - 1];
    if (attached) {
      const zoneSeq = Zone.current.get(ZONE_CONTEXT_SEQ_KEY) as
        | number
        | undefined;
      if (zoneSeq === undefined || attached.seq > zoneSeq) {
        return attached.context;
      }
    }
    return Zone.current.get(ZONE_CONTEXT_KEY) || ROOT_CONTEXT;
  }

  /**
   * Binds a the certain context or the active one to the target function and then returns the target
   * @param context A context (span) to be bind to target
   * @param target a function or event emitter. When target or one of its callbacks is called,
   *  the provided context will be used as the active context for the duration of the call.
   */
  bind<T>(context: Context, target: T | TargetWithEvents): T {
    if (typeof target === 'function') {
      return this._bindFunction(context, target);
    } else if (isListenerObject(target)) {
      this._bindListener(context, target);
    }
    return target as unknown as T;
  }

  /**
   * Disable the context manager (clears all the contexts)
   */
  disable(): this {
    this._enabled = false;
    this._attachedContexts = [];
    return this;
  }

  /**
   * Sets the given context as the active one and returns a token that can be
   * used to restore the previous context via {@link detach}.
   *
   * This is a best-effort implementation. Unlike {@link with}, which relies on
   * Zone.js to propagate context across asynchronous boundaries, `attach` stores
   * the context on the manager itself and is therefore **not isolated across
   * concurrent asynchronous Zones**. It is intended for synchronous scopes (and
   * for bridging callback boundaries that `with` cannot wrap). When guaranteed
   * propagation across asynchronous operations is required, prefer
   * {@link with}/{@link bind}.
   *
   * Every `attach` call must be paired with a {@link detach} call to avoid
   * context leaks. `detach` may be called in any order relative to other
   * `attach`/`detach` pairs.
   *
   * @param context the context to set as active
   * @returns a token identifying the attached context
   */
  attach(context: Context): Token {
    const attached: AttachedContext = { context, seq: ++this._seq };
    this._attachedContexts.push(attached);
    return attached as unknown as Token;
  }

  /**
   * Restores the active context to the value it had before the corresponding
   * {@link attach} call. Tokens that were never attached (or were already
   * detached) are ignored.
   *
   * @param token a token returned by a previous call to {@link attach}
   */
  detach(token: Token): void {
    const attached = token as unknown as AttachedContext;
    const index = this._attachedContexts.lastIndexOf(attached);
    if (index !== -1) {
      this._attachedContexts.splice(index, 1);
    }
  }

  /**
   * Enables the context manager and creates a default(root) context
   */
  enable(): this {
    this._enabled = true;
    return this;
  }

  /**
   * Calls the callback function [fn] with the provided [context].
   *     If [context] is undefined then it will use the active context.
   *     The context will be set as active
   * @param context A context (span) to be called with provided callback
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
    let zoneName = 'otel:with';
    if (fn.name) {
      zoneName += `:${fn.name}`;
    }
    return this._createZone(zoneName, context).run(fn, thisArg, args);
  }
}

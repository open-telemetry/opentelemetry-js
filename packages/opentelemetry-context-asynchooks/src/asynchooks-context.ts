/**
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ContextManager,
  Func,
  ContextStore,
} from '@opentelemetry/context-base';
import * as asyncHook from 'async_hooks';
import * as shimmer from 'shimmer';

const WRAPPED = Symbol('context_wrapped');
/** A map of AsyncResource IDs to Context objects. */
const contexts: { [asyncId: number]: ContextStore } = {};
let current: ContextStore = {};

// Create the hook.
asyncHook.createHook({ init, before, destroy }).enable();

// A list of well-known EventEmitter methods that add event listeners.
const EVENT_EMITTER_METHODS: Array<keyof NodeJS.EventEmitter> = [
  'addListener',
  'on',
  'once',
  'prependListener',
  'prependOnceListener',
];

export class AsyncHooksContextManager implements ContextManager {
  constructor() {
    // Create the hook.
    asyncHook.createHook({ init, before, destroy }).enable();
  }

  // This function is not technically needed and all tests currently pass
  // without it (after removing call sites). While it is not a complete
  // solution, restoring correct context before running every request/response
  // event handler reduces the number of situations in which userspace queuing
  // will cause us to lose context.
  wrapEmitter(ee: NodeJS.EventEmitter): void {
    const ns = this;
    EVENT_EMITTER_METHODS.forEach(method => {
      if (ee[method]) {
        shimmer.wrap(ee, method, (originalMethod: Function) => {
          return function(this: {}, event: string, cb: Func<void>) {
            return originalMethod.call(this, event, ns.wrapFunction(cb));
          };
        });
      }
    });
  }

  wrapFunction<T>(fn: Func<T>): Func<T> {
    // TODO: Monitor https://github.com/Microsoft/TypeScript/pull/15473.
    // When it's landed and released, we can remove these `any` casts.
    // tslint:disable-next-line:no-any
    if (((fn as any)[WRAPPED] as boolean) || !current) {
      return fn;
    }
    const boundContext = current;
    const contextWrapper = function(this: {}) {
      const oldContext = current;
      current = boundContext;
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore Typescript say that arguments should be an array except its
      // known that arguments are "array" like. We should not cast here since
      // it could impact performance a lot.
      const res = fn.apply(this, arguments) as T;
      current = oldContext;
      return res;
    };
    // tslint:disable-next-line:no-any
    (contextWrapper as any)[WRAPPED] = true;
    Object.defineProperty(contextWrapper, 'length', {
      enumerable: false,
      configurable: true,
      writable: false,
      value: fn.length,
    });
    return contextWrapper;
  }

  getCurrentContext() {
    return current;
  }
}

// AsyncHooks methods

/** init is called during object construction. */
function init(
  uid: number,
  provider: string,
  parentUid: number,
  parentHandle: {}
) {
  contexts[uid] = current;
}

/** before is called just before the resource's callback is called. */
function before(uid: number) {
  if (contexts[uid]) {
    current = contexts[uid];
  }
}

/**
 * destroy is called when the object is no longer used, so also delete
 * its entry in the map.
 */
function destroy(uid: number) {
  delete contexts[uid];
}

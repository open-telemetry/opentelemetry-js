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
import { context, Context } from '@opentelemetry/api';
import { EventEmitter } from 'events';

const LISTENER_SYMBOL = Symbol('OtHttpInstrumentationListeners');

const ADD_LISTENER_METHODS = [
  'addListener' as const,
  'on' as const,
  'once' as const,
  'prependListener' as const,
  'prependOnceListener' as const,
];

interface ListenerMap {
  [name: string]: WeakMap<Function, Function>;
}

function getListenerMap(emitter: EventEmitter): ListenerMap {
  let map: ListenerMap = (emitter as never)[LISTENER_SYMBOL];
  if (map === undefined) {
    map = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (emitter as any)[LISTENER_SYMBOL] = map;
  }
  return map;
}

export function bindEmitter<E extends EventEmitter>(
  emitter: E,
  getContext: (event: string) => Context
): E {
  function getPatchedAddFunction(original: Function) {
    return function (this: never, event: string, listener: Function) {
      const listenerMap = getListenerMap(emitter);
      let listeners = listenerMap[event];
      if (listeners === undefined) {
        listeners = new WeakMap();
        listenerMap[event] = listeners;
      }
      const patchedListener = context.bind(listener, getContext(event));
      listeners.set(listener, patchedListener);
      return original.call(this, event, patchedListener);
    };
  }

  function getPatchedRemoveListener(original: Function) {
    return function (this: never, event: string, listener: Function) {
      const listeners = getListenerMap(emitter)[event];
      if (listeners === undefined) {
        return original.call(this, event, listener);
      }
      return original.call(this, event, listeners.get(listener) || listener);
    };
  }

  function getPatchedRemoveAllListeners(original: Function) {
    return function (this: never, event: string) {
      delete getListenerMap(emitter)[event];
      return original.call(this, event);
    };
  }

  for (const method of ADD_LISTENER_METHODS) {
    if (emitter[method] !== undefined) {
      emitter[method] = getPatchedAddFunction(emitter[method]);
    }
  }

  if (typeof emitter.removeListener === 'function') {
    emitter.removeListener = getPatchedRemoveListener(emitter.removeListener);
  }

  if (typeof emitter.off === 'function') {
    emitter.off = getPatchedRemoveListener(emitter.off);
  }

  if (typeof emitter.removeAllListeners === 'function') {
    emitter.removeAllListeners = getPatchedRemoveAllListeners(
      emitter.removeAllListeners
    );
  }

  return emitter;
}

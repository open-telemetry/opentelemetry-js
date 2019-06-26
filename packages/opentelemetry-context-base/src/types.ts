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

/** Default type for functions */
// tslint:disable:no-any
export type Func<T> = (...args: any[]) => T;

/** A key/value object for anything that can be stored in the context */
export interface ContextStore {
  [key: string]: unknown;
}

export interface ContextManager {
  /**
   * Binds the trace context to the given function.
   * This is necessary in order to create child spans correctly in functions
   * that are called asynchronously (for example, in a network response
   * handler).
   * @param fn A function to which to bind the trace context.
   */
  wrapFunction<T>(fn: Func<T>): Func<T>;

  /**
   * Binds the trace context to the given event emitter.
   * This is necessary in order to create child spans correctly in event
   * handlers.
   * @param emitter An event emitter whose handlers should have
   *     the trace context binded to them.
   */
  wrapEmitter(emitter: NodeJS.EventEmitter): void;

  /**
   * Get the current key/value storage from the current context.
   * There are specific case where the context is not propagated by specific
   * code (ex: user space queueing) so expect it to be null sometimes.
   */
  getCurrentContext(): ContextStore | null;
}

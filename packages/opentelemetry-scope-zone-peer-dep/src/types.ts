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

export type Func<T> = (...args: unknown[]) => T;

/**
 * Minimum requirements that the object needs to have so that it can bind to the events instead of function
 * this is "addEventListener" and "removeEventListener" - see {@link isListenerObject}
 */
export interface TargetWithEvents {
  addEventListener?(
    event: string,
    listener: (...args: any[]) => void,
    opts?: { once: boolean }
  ): any;
  removeEventListener?(
    event: string,
    listener: (...args: any[]) => void,
    opts?: { once: boolean }
  ): any;
  __ot_listeners?: { [name: string]: WeakMap<Func<void>, Func<void>> };
}

/**
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

/**
 * Tracestate carries system-specific configuration data, represented as a list
 * of key-value pairs. TraceState allows multiple tracing systems to
 * participate in the same trace.
 */
export interface TraceState {
  /**
   * Adds or updates the TraceState that has the given `key` if it is
   * present. The new State will always be added in the front of the
   * list of states.
   */
  set(name: string, value: string): void;

  /**
   * Returns the value to which the specified key is mapped, or `undefined` if
   * this map contains no mapping for the key.
   */
  get(name: string): string | undefined;

  /** Returns a list of key string contained in this TraceState. */
  keys(): string[];
}

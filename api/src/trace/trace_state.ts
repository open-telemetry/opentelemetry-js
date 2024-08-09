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

/**
 * @since 1.0.0
 */
export interface TraceState {
  /**
   * Create a new TraceState which inherits from this TraceState and has the
   * given key set.
   * The new entry will always be added in the front of the list of states.
   *
   * @param key key of the TraceState entry.
   * @param value value of the TraceState entry.
   */
  set(key: string, value: string): TraceState;

  /**
   * Return a new TraceState which inherits from this TraceState but does not
   * contain the given key.
   *
   * @param key the key for the TraceState entry to be removed.
   */
  unset(key: string): TraceState;

  /**
   * Returns the value to which the specified key is mapped, or `undefined` if
   * this map contains no mapping for the key.
   *
   * @param key with which the specified value is to be associated.
   * @returns the value to which the specified key is mapped, or `undefined` if
   *     this map contains no mapping for the key.
   */
  get(key: string): string | undefined;

  // TODO: Consider to add support for merging an object as well by also
  // accepting a single internalTraceState argument similar to the constructor.

  /**
   * Serializes the TraceState to a `list` as defined below. The `list` is a
   * series of `list-members` separated by commas `,`, and a list-member is a
   * key/value pair separated by an equals sign `=`. Spaces and horizontal tabs
   * surrounding `list-members` are ignored. There can be a maximum of 32
   * `list-members` in a `list`.
   *
   * @returns the serialized string.
   */
  serialize(): string;
}

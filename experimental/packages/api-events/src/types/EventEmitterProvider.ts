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

import { EventEmitter } from './EventEmitter';
import { EventEmitterOptions } from './EventEmitterOptions';

/**
 * A registry for creating named {@link EventEmitter}s.
 */
export interface EventEmitterProvider {
  /**
   * Returns an EventEmitter, creating one if one with the given name, version, and
   * schemaUrl pair is not already created.
   *
   * @param name The name of the event emitter or instrumentation library.
   * @param domain The domain for events created by the event emitter.
   * @param version The version of the event emitter or instrumentation library.
   * @param options The options of the event emitter or instrumentation library.
   * @returns EventEmitter An event emitter with the given name and version.
   */
  getEventEmitter(
    name: string,
    domain: string,
    version?: string,
    options?: EventEmitterOptions
  ): EventEmitter;
}

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

import { EventEmitterProvider } from './types/EventEmitterProvider';
import { EventEmitter } from './types/EventEmitter';
import { EventEmitterOptions } from './types/EventEmitterOptions';
import { NoopEventEmitter } from './NoopEventEmitter';

export class NoopEventEmitterProvider implements EventEmitterProvider {
  getEventEmitter(
    _name: string,
    _domain: string,
    _version?: string | undefined,
    _options?: EventEmitterOptions | undefined
  ): EventEmitter {
    return new NoopEventEmitter();
  }
}

export const NOOP_EVENT_EMITTER_PROVIDER = new NoopEventEmitterProvider();

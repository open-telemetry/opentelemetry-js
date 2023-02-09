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

import * as assert from 'assert';
import { NoopEventEmitter } from '../../src/NoopEventEmitter';
import { NoopEventEmitterProvider } from '../../src/NoopEventEmitterProvider';

describe('NoopEventEmitter', () => {
  it('constructor should not crash', () => {
    const logger = new NoopEventEmitterProvider().getEventEmitter(
      'test-noop',
      'test-domain'
    );
    assert(logger instanceof NoopEventEmitter);
  });

  it('calling emit should not crash', () => {
    const emitter = new NoopEventEmitterProvider().getEventEmitter(
      'test-noop',
      'test-domain'
    );
    emitter.emit({
      name: 'event name',
    });
  });
});

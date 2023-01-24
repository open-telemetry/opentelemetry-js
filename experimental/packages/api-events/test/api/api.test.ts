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
import { EventEmitter, events } from '../../src';
import { NoopEventEmitter } from '../../src/NoopEventEmitter';
import { NoopEventEmitterProvider } from '../../src/NoopEventEmitterProvider';

describe('API', () => {
  const dummyEventEmitter = new NoopEventEmitter();

  it('should expose a event emitter provider via getEventEmitterProvider', () => {
    const provider = events.getEventEmitterProvider();
    assert.ok(provider);
    assert.strictEqual(typeof provider, 'object');
  });

  describe('GlobalEventEmitterProvider', () => {
    beforeEach(() => {
      events.disable();
    });

    it('should use the global event emitter provider', () => {
      events.setGlobalEventEmitterProvider(new TestEventEmitterProvider());
      const eventEmitter = events
        .getEventEmitterProvider()
        .getEventEmitter('name', 'domain');
      assert.deepStrictEqual(eventEmitter, dummyEventEmitter);
    });

    it('should not allow overriding global provider if already set', () => {
      const provider1 = new TestEventEmitterProvider();
      const provider2 = new TestEventEmitterProvider();
      events.setGlobalEventEmitterProvider(provider1);
      assert.equal(events.getEventEmitterProvider(), provider1);
      events.setGlobalEventEmitterProvider(provider2);
      assert.equal(events.getEventEmitterProvider(), provider1);
    });
  });

  describe('getEventEmitter', () => {
    beforeEach(() => {
      events.disable();
    });

    it('should return a event emitter instance from global provider', () => {
      events.setGlobalEventEmitterProvider(new TestEventEmitterProvider());
      const eventEmitter = events.getEventEmitter('myEventEmitter', 'domain');
      assert.deepStrictEqual(eventEmitter, dummyEventEmitter);
    });
  });

  class TestEventEmitterProvider extends NoopEventEmitterProvider {
    override getEventEmitter(): EventEmitter {
      return dummyEventEmitter;
    }
  }
});

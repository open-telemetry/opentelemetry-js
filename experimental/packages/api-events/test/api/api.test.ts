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
import { EventLogger, events } from '../../src';
import { NoopEventLogger } from '../../src/NoopEventLogger';
import { NoopEventLoggerProvider } from '../../src/NoopEventLoggerProvider';

describe('API', () => {
  const dummyEventLogger = new NoopEventLogger();

  it('should expose a event logger provider via getEventLoggerProvider', () => {
    const provider = events.getEventLoggerProvider();
    assert.ok(provider);
    assert.strictEqual(typeof provider, 'object');
  });

  describe('GlobalEventLoggerProvider', () => {
    beforeEach(() => {
      events.disable();
    });

    it('should use the global event logger provider', () => {
      events.setGlobalEventLoggerProvider(new TestEventLoggerProvider());
      const eventLogger = events
        .getEventLoggerProvider()
        .getEventLogger('name');
      assert.deepStrictEqual(eventLogger, dummyEventLogger);
    });

    it('should not allow overriding global provider if already set', () => {
      const provider1 = new TestEventLoggerProvider();
      const provider2 = new TestEventLoggerProvider();
      events.setGlobalEventLoggerProvider(provider1);
      assert.equal(events.getEventLoggerProvider(), provider1);
      events.setGlobalEventLoggerProvider(provider2);
      assert.equal(events.getEventLoggerProvider(), provider1);
    });
  });

  describe('getEventLogger', () => {
    beforeEach(() => {
      events.disable();
    });

    it('should return a event logger instance from global provider', () => {
      events.setGlobalEventLoggerProvider(new TestEventLoggerProvider());
      const eventLogger = events.getEventLogger('myEventLogger');
      assert.deepStrictEqual(eventLogger, dummyEventLogger);
    });
  });

  class TestEventLoggerProvider extends NoopEventLoggerProvider {
    override getEventLogger(): EventLogger {
      return dummyEventLogger;
    }
  }
});

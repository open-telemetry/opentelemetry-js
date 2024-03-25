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
import {
  _global,
  GLOBAL_EVENTS_API_KEY,
} from '../../src/internal/global-utils';
import { NoopEventLoggerProvider } from '../../src/NoopEventLoggerProvider';

const api1 = require('../../src') as typeof import('../../src');

// clear cache and load a second instance of the api
for (const key of Object.keys(require.cache)) {
  delete require.cache[key];
}
const api2 = require('../../src') as typeof import('../../src');

describe('Global Utils', () => {
  // prove they are separate instances
  assert.notStrictEqual(api1, api2);
  // that return separate noop instances to start
  assert.notStrictEqual(
    api1.events.getEventLoggerProvider(),
    api2.events.getEventLoggerProvider()
  );

  beforeEach(() => {
    api1.events.disable();
    api2.events.disable();
  });

  it('should change the global event logger provider', () => {
    const original = api1.events.getEventLoggerProvider();
    const newEventLoggerProvider = new NoopEventLoggerProvider();
    api1.events.setGlobalEventLoggerProvider(newEventLoggerProvider);
    assert.notStrictEqual(api1.events.getEventLoggerProvider(), original);
    assert.strictEqual(
      api1.events.getEventLoggerProvider(),
      newEventLoggerProvider
    );
  });

  it('should load an instance from one which was set in the other', () => {
    api1.events.setGlobalEventLoggerProvider(new NoopEventLoggerProvider());
    assert.strictEqual(
      api1.events.getEventLoggerProvider(),
      api2.events.getEventLoggerProvider()
    );
  });

  it('should disable both if one is disabled', () => {
    const original = api1.events.getEventLoggerProvider();

    api1.events.setGlobalEventLoggerProvider(new NoopEventLoggerProvider());

    assert.notStrictEqual(original, api1.events.getEventLoggerProvider());
    api2.events.disable();
    assert.strictEqual(original, api1.events.getEventLoggerProvider());
  });

  it('should return the module NoOp implementation if the version is a mismatch', () => {
    const original = api1.events.getEventLoggerProvider();
    api1.events.setGlobalEventLoggerProvider(new NoopEventLoggerProvider());
    const afterSet = _global[GLOBAL_EVENTS_API_KEY]!(-1);

    assert.strictEqual(original, afterSet);
  });
});

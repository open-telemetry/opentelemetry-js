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
import { _global, GLOBAL_LOGS_API_KEY } from '../../src/internal/global-utils';
import { NoopLoggerProvider } from '../../src/NoopLoggerProvider';
import { ProxyLoggerProvider } from '../../src/ProxyLoggerProvider';

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
    api1.logs.getLoggerProvider(),
    api2.logs.getLoggerProvider()
  );

  beforeEach(() => {
    api1.logs.disable();
    api2.logs.disable();
  });

  it('should change the global logger provider', () => {
    const original = api1.logs.getLoggerProvider();
    const newLoggerProvider = new NoopLoggerProvider();
    api1.logs.setGlobalLoggerProvider(newLoggerProvider);
    assert.notStrictEqual(api1.logs.getLoggerProvider(), original);
    assert.strictEqual(api1.logs.getLoggerProvider(), newLoggerProvider);
  });

  it('should load an instance from one which was set in the other', () => {
    api1.logs.setGlobalLoggerProvider(new NoopLoggerProvider());
    assert.strictEqual(
      api1.logs.getLoggerProvider(),
      api2.logs.getLoggerProvider()
    );
  });

  it('should disable both if one is disabled', () => {
    const original = api1.logs.getLoggerProvider();

    api1.logs.setGlobalLoggerProvider(new NoopLoggerProvider());

    assert.notStrictEqual(original, api1.logs.getLoggerProvider());
    api2.logs.disable();
    assert.strictEqual(original, api1.logs.getLoggerProvider());
  });

  it('should return the module no op implementation if the version is a mismatch', () => {
    api1.logs.setGlobalLoggerProvider(new ProxyLoggerProvider());
    const afterSet = _global[GLOBAL_LOGS_API_KEY]!(-1);

    assert.ok(afterSet instanceof NoopLoggerProvider);
  });
});

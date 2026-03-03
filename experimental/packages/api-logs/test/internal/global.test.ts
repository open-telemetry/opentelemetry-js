/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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

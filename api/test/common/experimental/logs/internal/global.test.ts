/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { NoopLoggerProvider } from '../../../../../src/experimental/logs/NoopLoggerProvider';

const api1 = require('../../../../../src/experimental');

// clear cache and load a second instance of the api
for (const key of Object.keys(require.cache)) {
  delete require.cache[key];
}
const api2 = require('../../../../../src/experimental');

const GLOBAL_API_SYMBOL_KEY = 'opentelemetry.js.api.1';

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
    // @ts-expect-error we are modifying internals for testing purposes here
    delete globalThis[Symbol.for(GLOBAL_API_SYMBOL_KEY)];
  });

  it('should change the global logger provider', () => {
    const newLoggerProvider = new NoopLoggerProvider();
    api1.logs.setGlobalLoggerProvider(newLoggerProvider);
    assert.strictEqual(
      api1.logs.getLoggerProvider()._getDelegate(),
      newLoggerProvider
    );
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

    assert.strictEqual(api2.logs.getLoggerProvider(), original);
    api2.logs.disable();
    assert.strictEqual(original, api1.logs.getLoggerProvider());
  });

  it('should not register if the version is a mismatch', () => {
    // @ts-expect-error we are modifying internals for testing purposes here
    globalThis[Symbol.for(GLOBAL_API_SYMBOL_KEY)] = { version: '0.0.1' };
    assert.strictEqual(
      api1.logs.setGlobalLoggerProvider(new NoopLoggerProvider()),
      false
    );
  });
});

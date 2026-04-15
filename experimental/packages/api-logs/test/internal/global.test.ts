/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { beforeAll, vi } from 'vitest';
import { _global, GLOBAL_LOGS_API_KEY } from '../../src/internal/global-utils';
import type * as ApiModule from '../../src';
import type { NoopLoggerProvider as NoopLoggerProviderType } from '../../src/NoopLoggerProvider';
import type { ProxyLoggerProvider as ProxyLoggerProviderType } from '../../src/ProxyLoggerProvider';

describe('Global Utils', () => {
  let api1: typeof ApiModule;
  let api2: typeof ApiModule;
  let NoopLoggerProvider: typeof NoopLoggerProviderType;
  let ProxyLoggerProvider: typeof ProxyLoggerProviderType;

  beforeAll(async () => {
    vi.resetModules();
    api1 = await import('../../src/index.js');
    // Import from the same module graph as api1 so instanceof checks match
    ({ NoopLoggerProvider } = await import('../../src/NoopLoggerProvider'));
    ({ ProxyLoggerProvider } = await import('../../src/ProxyLoggerProvider'));
    vi.resetModules();
    api2 = await import('../../src/index.js');
  });

  // prove they are separate instances
  // that return separate noop instances to start

  beforeEach(() => {
    api1.logs.disable();
    api2.logs.disable();
  });

  it('should be separate instances', () => {
    assert.notStrictEqual(api1, api2);
    assert.notStrictEqual(
      api1.logs.getLoggerProvider(),
      api2.logs.getLoggerProvider()
    );
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

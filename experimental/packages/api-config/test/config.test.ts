/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { config, createConfigProperties, NoopConfigProvider } from '../src';
import type { ConfigProperties, ConfigProvider } from '../src';

class StubConfigProvider implements ConfigProvider {
  private readonly _block: Record<string, unknown>;

  constructor(block: Record<string, unknown>) {
    this._block = block;
  }

  getInstrumentationConfig(_name?: string): ConfigProperties {
    return createConfigProperties(this._block);
  }

  getGeneralInstrumentationConfig(): ConfigProperties {
    return createConfigProperties(undefined);
  }
}

describe('config (global ConfigProvider API)', function () {
  afterEach(function () {
    config.disable();
  });

  it('returns a no-op provider when none is registered', function () {
    const provider = config.getConfigProvider();
    assert.ok(provider instanceof NoopConfigProvider);
    assert.deepStrictEqual(
      provider.getInstrumentationConfig().getPropertyKeys(),
      []
    );
    assert.deepStrictEqual(
      provider.getGeneralInstrumentationConfig().getPropertyKeys(),
      []
    );
  });

  it('returns the registered provider after setGlobalConfigProvider', function () {
    const provider = new StubConfigProvider({ enabled: true });
    const returned = config.setGlobalConfigProvider(provider);
    assert.strictEqual(returned, provider);
    assert.strictEqual(config.getConfigProvider(), provider);
    assert.strictEqual(
      config
        .getConfigProvider()
        .getInstrumentationConfig()
        .getBoolean('enabled'),
      true
    );
  });

  it('keeps the first registration; later calls are ignored', function () {
    const first = new StubConfigProvider({ order: 'first' } as never);
    const second = new StubConfigProvider({ order: 'second' } as never);
    assert.strictEqual(config.setGlobalConfigProvider(first), first);
    // Second registration returns the already-registered provider.
    assert.strictEqual(config.setGlobalConfigProvider(second), first);
    assert.strictEqual(config.getConfigProvider(), first);
  });

  it('reverts to the no-op provider after disable', function () {
    config.setGlobalConfigProvider(new StubConfigProvider({}));
    config.disable();
    assert.ok(config.getConfigProvider() instanceof NoopConfigProvider);
  });
});

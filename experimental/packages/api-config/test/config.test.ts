/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { config } from '../src';
import type { ConfigProperties, ConfigProvider } from '../src';
import {
  EMPTY_CONFIG_PROPERTIES,
  NoopConfigProvider,
} from '../src/NoopConfigProvider';

class StubConfigProvider implements ConfigProvider {
  private readonly _config: Record<string, unknown>;

  constructor(config: Record<string, unknown>) {
    this._config = config;
  }

  getInstrumentationConfig(name?: string): ConfigProperties {
    if (!name) {
      return (this._config['instrumentation/development'] ??
        EMPTY_CONFIG_PROPERTIES) as ConfigProperties;
    } else {
      return (
        (this._config['instrumentation/development'] as any)?.js?.[name] ??
        EMPTY_CONFIG_PROPERTIES
      );
    }
  }

  getGeneralInstrumentationConfig(): ConfigProperties {
    return (this._config['instrumentation/development'] as any)?.general;
  }
}

describe('config (global ConfigProvider API)', function () {
  afterEach(function () {
    config.disable();
  });

  it('returns a no-op provider when none is registered', function () {
    const provider = config.getConfigProvider();
    assert.ok(provider instanceof NoopConfigProvider);
    assert.deepStrictEqual(provider.getInstrumentationConfig(), {});
    assert.deepStrictEqual(provider.getInstrumentationConfig('aName'), {});
    assert.deepStrictEqual(provider.getGeneralInstrumentationConfig(), {});
  });

  it('returns the registered provider after setGlobalConfigProvider', function () {
    const provider = new StubConfigProvider({
      'instrumentation/development': { foo: true },
    });
    const returned = config.setGlobalConfigProvider(provider);
    assert.strictEqual(returned, provider);
    assert.strictEqual(config.getConfigProvider(), provider);
    assert.strictEqual(
      (config.getConfigProvider().getInstrumentationConfig() as any).foo,
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

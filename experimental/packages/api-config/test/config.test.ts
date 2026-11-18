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

  getInstrumentationConfig(name: string): ConfigProperties {
    return (
      (this._config['instrumentation/development'] as any)?.js?.[name] ??
      EMPTY_CONFIG_PROPERTIES
    );
  }

  getGeneralInstrumentationConfig(): ConfigProperties {
    return (this._config['instrumentation/development'] as any)?.general;
  }

  getInstrumentationConfigRoot(): ConfigProperties {
    return (this._config['instrumentation/development'] ??
      EMPTY_CONFIG_PROPERTIES) as ConfigProperties;
  }
}

describe('config (global ConfigProvider API)', function () {
  afterEach(function () {
    config.disable();
  });

  it('returns a no-op provider when none is registered', function () {
    const provider = config.getConfigProvider();
    assert.ok(provider instanceof NoopConfigProvider);
    assert.deepStrictEqual(provider.getInstrumentationConfigRoot(), {});
    assert.deepStrictEqual(provider.getInstrumentationConfig('aName'), {});
    assert.deepStrictEqual(provider.getGeneralInstrumentationConfig(), {});
  });

  it('registers the provider and returns true', function () {
    const provider = new StubConfigProvider({
      'instrumentation/development': { foo: true },
    });
    const returned = config.setGlobalConfigProvider(provider);
    assert.strictEqual(returned, true);
    assert.strictEqual(config.getConfigProvider(), provider);
    assert.strictEqual(
      (config.getConfigProvider().getInstrumentationConfigRoot() as any).foo,
      true
    );
  });

  it('keeps the first registration; later calls are ignored', function () {
    const first = new StubConfigProvider({ order: 'first' } as never);
    const second = new StubConfigProvider({ order: 'second' } as never);
    assert.strictEqual(config.setGlobalConfigProvider(first), true);
    // A later registration is ignored and returns false.
    assert.strictEqual(config.setGlobalConfigProvider(second), false);
    assert.strictEqual(config.getConfigProvider(), first);
  });

  it('reverts to the no-op provider after disable', function () {
    config.setGlobalConfigProvider(new StubConfigProvider({}));
    config.disable();
    assert.ok(config.getConfigProvider() instanceof NoopConfigProvider);
  });
});

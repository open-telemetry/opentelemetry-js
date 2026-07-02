/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { diag, DiagLogLevel } from '@opentelemetry/api';
import { config, createConfigProperties } from '@opentelemetry/api-config';
import type {
  ConfigProperties,
  ConfigProvider,
} from '@opentelemetry/api-config';
import { InstrumentationBase } from '../../src';
import type { InstrumentationConfig } from '../../src';

// A provider over in-memory blocks: `byName` maps an instrumentation name to its
// own block; `general` is the shared block.
function stubProvider(
  byName: Record<string, Record<string, unknown>>,
  general: Record<string, unknown> = {}
): ConfigProvider {
  return {
    getInstrumentationConfig(name?: string): ConfigProperties {
      if (name === undefined) {
        return createConfigProperties({ js: byName, general });
      }
      return createConfigProperties(byName[name]);
    },
    getGeneralInstrumentationConfig: () => createConfigProperties(general),
  };
}

interface TestConfig extends InstrumentationConfig {
  serverName?: string;
  captured?: string[];
}

// Reads its declarative config in the constructor, the recommended pattern.
class TestInstrumentation extends InstrumentationBase<TestConfig> {
  constructor(config: TestConfig = {}) {
    super('@otel/test', '1.0.0', config);
    this.applyDeclarativeConfig((own, general) => ({
      serverName: own.getString('server_name'),
      captured: general
        .getStructured('http')
        ?.getStructured('client')
        ?.getStringArray('request_captured_headers'),
    }));
  }
  init() {
    return [];
  }
  override enable() {}
  override disable() {}
}

describe('declarative config', function () {
  let warn: sinon.SinonStub;

  beforeEach(function () {
    config.disable();
    warn = sinon.stub();
    diag.setLogger(
      {
        verbose: () => {},
        debug: () => {},
        info: () => {},
        warn,
        error: () => {},
      },
      DiagLogLevel.WARN
    );
  });

  afterEach(function () {
    config.disable();
    diag.disable();
    sinon.restore();
  });

  it('reads own and general config in the constructor', function () {
    config.setGlobalConfigProvider(
      stubProvider(
        { '@otel/test': { server_name: 'srv' } },
        { http: { client: { request_captured_headers: ['x-id'] } } }
      )
    );
    const instrumentation = new TestInstrumentation();
    assert.strictEqual(instrumentation.getConfig().serverName, 'srv');
    assert.deepStrictEqual(instrumentation.getConfig().captured, ['x-id']);
    sinon.assert.notCalled(warn);
  });

  it('keeps the existing value when a key is absent', function () {
    config.setGlobalConfigProvider(stubProvider({ '@otel/test': {} }));
    const instrumentation = new TestInstrumentation({ serverName: 'keep' });
    assert.strictEqual(instrumentation.getConfig().serverName, 'keep');
  });

  it('warns about a key no reader read', function () {
    config.setGlobalConfigProvider(
      stubProvider({ '@otel/test': { server_name: 'srv', typo_key: 1 } })
    );
    new TestInstrumentation();
    sinon.assert.calledOnce(warn);
    assert.match(warn.firstCall.args.join(' '), /unrecognized.*typo_key/);
  });

  it('does not warn about enabled (owned by the SDK registry)', function () {
    config.setGlobalConfigProvider(
      stubProvider({ '@otel/test': { enabled: false, server_name: 'srv' } })
    );
    const instrumentation = new TestInstrumentation();
    assert.strictEqual(instrumentation.getConfig().serverName, 'srv');
    sinon.assert.notCalled(warn);
  });

  it('warns and keeps the default on a type mismatch', function () {
    config.setGlobalConfigProvider(
      stubProvider({ '@otel/test': { server_name: 5 } })
    );
    const instrumentation = new TestInstrumentation({ serverName: 'keep' });
    assert.strictEqual(instrumentation.getConfig().serverName, 'keep');
    sinon.assert.calledOnce(warn);
  });

  it('is a no-op when no provider is registered', function () {
    const instrumentation = new TestInstrumentation({ serverName: 'in-code' });
    assert.strictEqual(instrumentation.getConfig().serverName, 'in-code');
    sinon.assert.notCalled(warn);
  });
});

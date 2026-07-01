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
import { InstrumentationBase, registerInstrumentations } from '../../src';
import type { Instrumentation, InstrumentationConfig } from '../../src';

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
    getGeneralInstrumentationConfig(): ConfigProperties {
      return createConfigProperties(general);
    },
  };
}

interface TestConfig extends InstrumentationConfig {
  serverName?: string;
  captured?: string[];
}

class DefaultInstrumentation extends InstrumentationBase<TestConfig> {
  constructor(config: TestConfig = {}) {
    super('@otel/default', '1.0.0', config);
  }
  init() {
    return [];
  }
  override enable() {}
  override disable() {}
}

class ReaderInstrumentation extends InstrumentationBase<TestConfig> {
  constructor(config: TestConfig = {}) {
    super('@otel/reader', '1.0.0', config);
  }
  init() {
    return [];
  }
  override enable() {}
  override disable() {}
  protected override readDeclarativeConfig(
    own: ConfigProperties,
    general: ConfigProperties
  ): Partial<TestConfig> {
    return {
      serverName: own.getString('server_name'),
      captured: general
        .getStructured('http')
        ?.getStructured('client')
        ?.getStringArray('request_captured_headers'),
    };
  }
}

describe('declarative config', function () {
  let warn: sinon.SinonStub;

  beforeEach(function () {
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

  describe('applyDeclarativeConfig', function () {
    it('applies a reader output from own and general blocks', function () {
      config.setGlobalConfigProvider(
        stubProvider(
          { '@otel/reader': { server_name: 'srv' } },
          { http: { client: { request_captured_headers: ['x-id'] } } }
        )
      );
      const instrumentation = new ReaderInstrumentation();
      instrumentation.applyDeclarativeConfig();
      assert.strictEqual(instrumentation.getConfig().serverName, 'srv');
      assert.deepStrictEqual(instrumentation.getConfig().captured, ['x-id']);
      sinon.assert.notCalled(warn);
    });

    it('does not apply enabled (owned by the registrar)', function () {
      config.setGlobalConfigProvider(
        stubProvider({ '@otel/reader': { enabled: false, server_name: 'srv' } })
      );
      const instrumentation = new ReaderInstrumentation();
      const disable = sinon.spy(instrumentation, 'disable');
      instrumentation.applyDeclarativeConfig();
      // enabled is left to the registrar; applyDeclarativeConfig neither toggles
      // nor warns about it.
      sinon.assert.notCalled(disable);
      sinon.assert.notCalled(warn);
      assert.strictEqual(instrumentation.getConfig().serverName, 'srv');
    });

    it('is silent for an enabled-only block with no reader', function () {
      config.setGlobalConfigProvider(
        stubProvider({ '@otel/default': { enabled: false } })
      );
      new DefaultInstrumentation().applyDeclarativeConfig();
      sinon.assert.notCalled(warn);
    });

    it('warns about unsupported keys when there is no reader', function () {
      config.setGlobalConfigProvider(
        stubProvider({ '@otel/default': { enabled: true, server_name: 'srv' } })
      );
      new DefaultInstrumentation().applyDeclarativeConfig();
      sinon.assert.calledOnce(warn);
      const message = warn.firstCall.args.join(' ');
      assert.match(message, /not supported/);
      // Only the unsupported key is listed; `enabled` is never reported.
      assert.match(message, /had no effect: server_name$/);
    });

    it('warns about keys a reader did not read', function () {
      config.setGlobalConfigProvider(
        stubProvider({ '@otel/reader': { server_name: 'srv', typo_key: 1 } })
      );
      new ReaderInstrumentation().applyDeclarativeConfig();
      sinon.assert.calledOnce(warn);
      assert.match(warn.firstCall.args.join(' '), /unrecognized.*typo_key/);
    });

    it('is a no-op when no provider is registered', function () {
      const instrumentation = new ReaderInstrumentation();
      instrumentation.applyDeclarativeConfig();
      assert.strictEqual(instrumentation.getConfig().serverName, undefined);
      sinon.assert.notCalled(warn);
    });
  });

  describe('enabled gate at registration', function () {
    it('disables an instrumentation whose config sets enabled: false', function () {
      config.setGlobalConfigProvider(
        stubProvider({ '@otel/default': { enabled: false } })
      );
      const instrumentation = new DefaultInstrumentation();
      const enable = sinon.spy(instrumentation, 'enable');
      const disable = sinon.spy(instrumentation, 'disable');
      registerInstrumentations({ instrumentations: [instrumentation] });
      sinon.assert.calledOnce(disable);
      sinon.assert.notCalled(enable);
    });

    it('enables when the config omits enabled', function () {
      config.setGlobalConfigProvider(
        stubProvider({ '@otel/default': { server_name: 'srv' } })
      );
      const instrumentation = new DefaultInstrumentation({ enabled: false });
      const enable = sinon.spy(instrumentation, 'enable');
      registerInstrumentations({ instrumentations: [instrumentation] });
      sinon.assert.calledOnce(enable);
    });

    it('enables when config sets enabled: true even if constructed disabled', function () {
      config.setGlobalConfigProvider(
        stubProvider({ '@otel/default': { enabled: true } })
      );
      const instrumentation = new DefaultInstrumentation({ enabled: false });
      const enable = sinon.spy(instrumentation, 'enable');
      const disable = sinon.spy(instrumentation, 'disable');
      registerInstrumentations({ instrumentations: [instrumentation] });
      sinon.assert.calledOnce(enable);
      sinon.assert.notCalled(disable);
    });

    it('gates enabled for an instrumentation without applyDeclarativeConfig', function () {
      config.setGlobalConfigProvider(
        stubProvider({ '@otel/legacy': { enabled: false } })
      );
      const disable = sinon.spy();
      const legacy: Instrumentation = {
        instrumentationName: '@otel/legacy',
        instrumentationVersion: '1.0.0',
        getConfig: () => ({ enabled: true }),
        setConfig: () => {},
        enable: () => {},
        disable,
        setTracerProvider: () => {},
        setMeterProvider: () => {},
        // no applyDeclarativeConfig: predates declarative config
      };
      registerInstrumentations({ instrumentations: [legacy] });
      sinon.assert.calledOnce(disable);
    });
  });
});

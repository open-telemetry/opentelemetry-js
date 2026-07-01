/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { context, propagation, diag } from '@opentelemetry/api';
import { config } from '@opentelemetry/api-config';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import type {
  ConfigProperties,
  InstrumentationConfig,
} from '@opentelemetry/instrumentation';
import { startNodeSDK } from '../src/start';

interface TestConfig extends InstrumentationConfig {
  serverName?: string;
}

class TestInstrumentation extends InstrumentationBase<TestConfig> {
  constructor(name: string, config: TestConfig = {}) {
    super(name, '1.0.0', config);
  }
  init() {
    return [];
  }
  override enable() {}
  override disable() {}
  protected override readDeclarativeConfig(
    own: ConfigProperties
  ): Partial<TestConfig> {
    return { serverName: own.getString('server_name') };
  }
}

describe('startNodeSDK declarative instrumentation config', function () {
  const origEnv = { ...process.env };
  let sdk: { shutdown: () => Promise<void> } | undefined;

  beforeEach(function () {
    // Clear any global provider a prior test may have registered.
    config.disable();
  });

  afterEach(async function () {
    if (sdk) {
      await sdk.shutdown();
      sdk = undefined;
    }
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    for (const [key, value] of Object.entries(origEnv)) {
      process.env[key] = value;
    }
    config.disable();
    context.disable();
    propagation.disable();
    diag.disable();
    sinon.restore();
  });

  it('sets a global ConfigProvider from the config file', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/instrumentations.yaml';
    sdk = startNodeSDK();

    const provider = config.getConfigProvider();
    assert.strictEqual(
      provider
        .getInstrumentationConfig('@otel/with-config')
        .getString('server_name'),
      'from-file'
    );
    assert.deepStrictEqual(
      provider
        .getGeneralInstrumentationConfig()
        .getStructured('http')
        ?.getStructured('client')
        ?.getStringArray('request_captured_headers'),
      ['content-type']
    );
  });

  it('applies config and gates enabled per instrumentation', function () {
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/instrumentations.yaml';
    const withConfig = new TestInstrumentation('@otel/with-config');
    const disabledOne = new TestInstrumentation('@otel/enabled-false');
    const withConfigDisable = sinon.spy(withConfig, 'disable');
    const disabledOneDisable = sinon.spy(disabledOne, 'disable');

    sdk = startNodeSDK({ instrumentations: [withConfig, disabledOne] });

    // @otel/with-config: its reader applied server_name; it is not disabled.
    assert.strictEqual(withConfig.getConfig().serverName, 'from-file');
    sinon.assert.notCalled(withConfigDisable);
    // @otel/enabled-false: the registrar disabled it.
    sinon.assert.called(disabledOneDisable);
  });
});

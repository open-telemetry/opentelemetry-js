/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { context, propagation, diag } from '@opentelemetry/api';
import type { ConfigProvider } from '@opentelemetry/api-config';
import { config } from '@opentelemetry/api-config';
import {
  InstrumentationBase,
  readConfigProperties,
} from '@opentelemetry/instrumentation';
import type { InstrumentationConfig } from '@opentelemetry/instrumentation';
import { startNodeSDK } from '../src/start';

interface TestConfig extends InstrumentationConfig {
  serverName?: string;
  captureHeaders?: string[];
}

// A test Instrumentation that reads some declarative config.
class TestInstrumentation extends InstrumentationBase<TestConfig> {
  constructor(name: string, config: TestConfig = {}) {
    super(name, '1.0.0', config);
  }
  init() {
    return [];
  }
  override enable() {}
  override disable() {}

  setConfigProvider(configProvider: ConfigProvider): void {
    const config = readConfigProperties({
      configProvider,
      instrumentationName: this.instrumentationName,
      instrumentationProps: [['server_name', 'string', 'serverName']],
      generalProps: [
        ['http.client.request_captured_headers', 'string[]', 'captureHeaders'],
      ],
      diag: this._diag,
    });

    if (Object.keys(config).length > 0) {
      this.setConfig({ ...this.getConfig(), ...config });
    }
  }
}

describe('startNodeSDK declarative instrumentation config', function () {
  const origEnv = { ...process.env };
  let sdk: { shutdown: () => Promise<void> } | undefined;

  beforeEach(function () {
    config.disable();
    process.env.OTEL_CONFIG_FILE = 'test/fixtures/instrumentations.yaml';
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
    sdk = startNodeSDK();
    const provider = config.getConfigProvider();
    assert.deepStrictEqual(
      provider.getInstrumentationConfig('@otel/with-config'),
      { server_name: 'from-file' }
    );
    assert.deepStrictEqual(provider.getGeneralInstrumentationConfig(), {
      http: { client: { request_captured_headers: ['content-type'] } },
    });
  });

  it('instrumentations load their declarative config', function () {
    const instrumentations = [new TestInstrumentation('@otel/with-config')];
    sdk = startNodeSDK({ instrumentations });

    assert.strictEqual(instrumentations[0].getConfig().serverName, 'from-file');
    assert.deepStrictEqual(instrumentations[0].getConfig().captureHeaders, [
      'content-type',
    ]);
  });
});

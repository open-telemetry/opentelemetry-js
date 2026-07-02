/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { context, propagation, diag } from '@opentelemetry/api';
import { config } from '@opentelemetry/api-config';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import type { InstrumentationConfig } from '@opentelemetry/instrumentation';
import { startNodeSDK } from '../src/start';

interface TestConfig extends InstrumentationConfig {
  serverName?: string;
}

// Reads its declarative config in the constructor.
class TestInstrumentation extends InstrumentationBase<TestConfig> {
  constructor(name: string, config: TestConfig = {}) {
    super(name, '1.0.0', config);
    this.applyDeclarativeConfig(own => ({
      serverName: own.getString('server_name'),
    }));
  }
  init() {
    return [];
  }
  override enable() {}
  override disable() {}
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

  it('constructs enabled registry entries and applies their config', function () {
    const built: Record<string, TestInstrumentation> = {};
    const make = (name: string) => () =>
      (built[name] = new TestInstrumentation(name));

    sdk = startNodeSDK({
      instrumentationRegistry: {
        '@otel/with-config': make('@otel/with-config'),
        '@otel/enabled-false': make('@otel/enabled-false'),
      },
    });

    // Enabled entry is constructed and configured from the file.
    assert.ok(built['@otel/with-config']);
    assert.strictEqual(
      built['@otel/with-config'].getConfig().serverName,
      'from-file'
    );
    // Disabled entry is never constructed.
    assert.strictEqual(built['@otel/enabled-false'], undefined);
  });

  it('throws when both instrumentations and instrumentationRegistry are passed', function () {
    assert.throws(
      () =>
        startNodeSDK({
          instrumentations: [new TestInstrumentation('@otel/a')],
          instrumentationRegistry: {
            '@otel/b': () => new TestInstrumentation('@otel/b'),
          },
        }),
      /not both/
    );
  });
});

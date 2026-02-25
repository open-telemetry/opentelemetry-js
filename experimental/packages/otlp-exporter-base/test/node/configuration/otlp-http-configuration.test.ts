/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import { mergeOtlpNodeHttpConfigurationWithDefaults } from '../../../src/configuration/otlp-node-http-configuration';
import { OtlpNodeHttpConfiguration } from '../../../src/configuration/otlp-node-http-configuration';
import { VERSION } from '../../../src/version';

describe('mergeOtlpNodeHttpConfigurationWithDefaults', function () {
  const testDefaults: OtlpNodeHttpConfiguration = {
    url: 'http://default.example.test',
    timeoutMillis: 1,
    compression: 'none',
    concurrencyLimit: 2,
    headers: async () => ({}),
    agentFactory: () => null!,
    userAgent: `OTel-OTLP-Exporter-JavaScript/${VERSION}`,
  };

  it('throws error when the user-provided url is not parseable', function () {
    assert.throws(() => {
      mergeOtlpNodeHttpConfigurationWithDefaults(
        { url: 'this is not a URL' },
        {},
        testDefaults
      );
    }, new Error("Configuration: Could not parse user-provided export URL: 'this is not a URL'"));
  });

  it('takes user-agent from the user provided config over the defaults', function () {
    const config = mergeOtlpNodeHttpConfigurationWithDefaults(
      { userAgent: 'Custom-User-Agent/1.2.3' },
      {},
      testDefaults
    );

    assert.strictEqual(config.userAgent, 'Custom-User-Agent/1.2.3');
  });
});

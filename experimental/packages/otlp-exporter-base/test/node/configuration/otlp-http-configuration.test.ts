/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import * as http from 'http';
import * as https from 'https';
import {
  httpAgentFactoryFromOptions,
  mergeOtlpNodeHttpConfigurationWithDefaults,
} from '../../../src/configuration/otlp-node-http-configuration';
import type { OtlpNodeHttpConfiguration } from '../../../src/configuration/otlp-node-http-configuration';
import { VERSION } from '../../../src/version';

describe('httpAgentFactoryFromOptions', function () {
  it('creates protocol-specific agents with the provided options', async function () {
    const factory = httpAgentFactoryFromOptions({ keepAlive: true });

    const httpAgent = await factory('http:');
    const httpsAgent = await factory('https:');

    assert.ok(httpAgent instanceof http.Agent);
    assert.ok(httpsAgent instanceof https.Agent);
  });
});

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

  it('takes the agent factory from the user provided config', function () {
    const agentFactory = () => new http.Agent();
    const config = mergeOtlpNodeHttpConfigurationWithDefaults(
      { agentFactory },
      {},
      testDefaults
    );

    assert.strictEqual(config.agentFactory, agentFactory);
  });
});

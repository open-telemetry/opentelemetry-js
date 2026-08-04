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

const TEST_ENV_VARIABLES = [
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'NO_PROXY',
  'http_proxy',
  'https_proxy',
  'no_proxy',
  'ALL_PROXY',
] as const;

type AgentOptionsWithProxyEnv = http.AgentOptions & {
  proxyEnv?: NodeJS.ProcessEnv;
};

function getAgentOptions(
  agent: http.Agent | https.Agent
): AgentOptionsWithProxyEnv {
  return (agent as unknown as { options: AgentOptionsWithProxyEnv }).options;
}

describe('httpAgentFactoryFromOptions', function () {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(function () {
    originalEnv = {};
    for (const envVar of TEST_ENV_VARIABLES) {
      originalEnv[envVar] = process.env[envVar];
      delete process.env[envVar];
    }
  });

  afterEach(function () {
    for (const envVar of TEST_ENV_VARIABLES) {
      const originalValue = originalEnv[envVar];
      if (originalValue === undefined) {
        delete process.env[envVar];
      } else {
        process.env[envVar] = originalValue;
      }
    }
  });

  it('creates protocol-specific agents with the provided options', async function () {
    const factory = httpAgentFactoryFromOptions({ keepAlive: true });

    const httpAgent = await factory('http:');
    const httpsAgent = await factory('https:');

    assert.ok(httpAgent instanceof http.Agent);
    assert.ok(httpsAgent instanceof https.Agent);
    assert.strictEqual(getAgentOptions(httpAgent).keepAlive, true);
    assert.strictEqual(getAgentOptions(httpsAgent).keepAlive, true);
    assert.strictEqual(getAgentOptions(httpAgent).proxyEnv, undefined);
    assert.strictEqual(getAgentOptions(httpsAgent).proxyEnv, undefined);
  });

  for (const proxyEnvVar of [
    'HTTP_PROXY',
    'http_proxy',
    'HTTPS_PROXY',
    'https_proxy',
  ] as const) {
    it(`passes ${proxyEnvVar} and only recognized variables to HTTP and HTTPS agents`, async function () {
      process.env[proxyEnvVar] = 'http://proxy.example:3128';
      process.env.NO_PROXY = 'localhost';
      process.env.ALL_PROXY = 'http://unrelated.example:3128';
      const factory = httpAgentFactoryFromOptions({ keepAlive: true });

      const expectedProxyEnv = {
        HTTP_PROXY: process.env.HTTP_PROXY,
        HTTPS_PROXY: process.env.HTTPS_PROXY,
        NO_PROXY: process.env.NO_PROXY,
        http_proxy: process.env.http_proxy,
        https_proxy: process.env.https_proxy,
        no_proxy: process.env.no_proxy,
      };
      const httpAgent = await factory('http:');
      const httpsAgent = await factory('https:');

      assert.deepStrictEqual(
        getAgentOptions(httpAgent).proxyEnv,
        expectedProxyEnv
      );
      assert.deepStrictEqual(
        getAgentOptions(httpsAgent).proxyEnv,
        expectedProxyEnv
      );
    });
  }

  it('preserves an explicitly provided proxy environment', async function () {
    process.env.HTTPS_PROXY = 'http://environment.example:3128';
    const proxyEnv = {
      HTTPS_PROXY: 'http://explicit.example:3128',
    };
    const factory = httpAgentFactoryFromOptions({
      keepAlive: true,
      proxyEnv,
    });

    const httpAgent = await factory('http:');
    const httpsAgent = await factory('https:');

    assert.strictEqual(getAgentOptions(httpAgent).proxyEnv, proxyEnv);
    assert.strictEqual(getAgentOptions(httpsAgent).proxyEnv, proxyEnv);
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
});

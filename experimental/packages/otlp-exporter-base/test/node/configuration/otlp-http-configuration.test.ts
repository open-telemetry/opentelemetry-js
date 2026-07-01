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

const ENV_PROXY_VARIABLES = [
  'NODE_USE_ENV_PROXY',
  'HTTP_PROXY',
  'http_proxy',
  'HTTPS_PROXY',
  'https_proxy',
];

function agentOptions(agent: http.Agent | https.Agent): any {
  return (agent as any).options;
}

describe('httpAgentFactoryFromOptions', function () {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(function () {
    originalEnv = {};
    for (const envVar of ENV_PROXY_VARIABLES) {
      originalEnv[envVar] = process.env[envVar];
      delete process.env[envVar];
    }
  });

  afterEach(function () {
    for (const envVar of ENV_PROXY_VARIABLES) {
      if (originalEnv[envVar] == null) {
        delete process.env[envVar];
      } else {
        process.env[envVar] = originalEnv[envVar];
      }
    }
  });

  it('creates protocol-specific agents with the provided options', async function () {
    const factory = httpAgentFactoryFromOptions({ keepAlive: true });

    const httpAgent = (await factory('http:')) as http.Agent;
    const httpsAgent = (await factory('https:')) as https.Agent;

    assert.ok(httpAgent instanceof http.Agent);
    assert.ok(httpsAgent instanceof https.Agent);
    assert.strictEqual(agentOptions(httpAgent).keepAlive, true);
    assert.strictEqual(agentOptions(httpsAgent).keepAlive, true);
    assert.strictEqual(agentOptions(httpAgent).proxyEnv, undefined);
    assert.strictEqual(agentOptions(httpsAgent).proxyEnv, undefined);
  });

  it('passes proxyEnv to http agents when HTTP_PROXY is configured', async function () {
    process.env.HTTP_PROXY = 'http://proxy.example:3128';
    const factory = httpAgentFactoryFromOptions({ keepAlive: true });

    const agent = (await factory('http:')) as http.Agent;

    assert.strictEqual(agentOptions(agent).keepAlive, true);
    assert.strictEqual(agentOptions(agent).proxyEnv, process.env);
  });

  it('passes proxyEnv to https agents when HTTPS_PROXY is configured', async function () {
    process.env.HTTPS_PROXY = 'http://proxy.example:3128';
    const factory = httpAgentFactoryFromOptions({ keepAlive: true });

    const agent = (await factory('https:')) as https.Agent;

    assert.strictEqual(agentOptions(agent).keepAlive, true);
    assert.strictEqual(agentOptions(agent).proxyEnv, process.env);
  });

  it('passes proxyEnv to agents when NODE_USE_ENV_PROXY is enabled', async function () {
    process.env.NODE_USE_ENV_PROXY = '1';
    const factory = httpAgentFactoryFromOptions({ keepAlive: true });

    const agent = (await factory('https:')) as https.Agent;

    assert.strictEqual(agentOptions(agent).keepAlive, true);
    assert.strictEqual(agentOptions(agent).proxyEnv, process.env);
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

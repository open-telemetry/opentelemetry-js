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

function getAgentOptions(agent: http.Agent | https.Agent): http.AgentOptions {
  return (agent as unknown as { options: http.AgentOptions }).options;
}

function getAgentProxyEnv(
  agent: http.Agent | https.Agent
): NodeJS.ProcessEnv | undefined {
  return (agent as unknown as { options: { proxyEnv?: NodeJS.ProcessEnv } })
    .options.proxyEnv;
}

function supportsNativeProxyEnv(): boolean {
  const [major, minor] = process.versions.node.split('.').map(Number);
  return (
    major > 24 || (major === 24 && minor >= 5) || (major === 22 && minor >= 21)
  );
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
    assert.strictEqual(getAgentProxyEnv(httpAgent), undefined);
    assert.strictEqual(getAgentProxyEnv(httpsAgent), undefined);
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

      assert.deepStrictEqual(getAgentProxyEnv(httpAgent), expectedProxyEnv);
      assert.deepStrictEqual(getAgentProxyEnv(httpsAgent), expectedProxyEnv);
    });
  }

  it('preserves an explicitly provided proxy environment', async function () {
    process.env.HTTPS_PROXY = 'http://environment.example:3128';
    const proxyEnv = {
      HTTPS_PROXY: 'http://explicit.example:3128',
    };
    const options = {
      keepAlive: true,
      proxyEnv,
    };
    const factory = httpAgentFactoryFromOptions(options);

    const httpAgent = await factory('http:');
    const httpsAgent = await factory('https:');

    assert.strictEqual(getAgentProxyEnv(httpAgent), proxyEnv);
    assert.strictEqual(getAgentProxyEnv(httpsAgent), proxyEnv);
  });

  it('uses environment proxy variables for requests on supporting Node.js versions', async function () {
    if (!supportsNativeProxyEnv()) {
      this.skip();
    }

    let proxyRequestReceived = false;
    const proxyServer = http.createServer((request, response) => {
      proxyRequestReceived = true;
      response.statusCode = 204;
      response.end();
    });

    await new Promise<void>((resolve, reject) => {
      proxyServer.once('error', reject);
      proxyServer.listen(0, '127.0.0.1', resolve);
    });

    try {
      const address = proxyServer.address();
      assert.ok(address && typeof address !== 'string');
      process.env.HTTP_PROXY = `http://127.0.0.1:${address.port}`;
      const agent = await httpAgentFactoryFromOptions({ keepAlive: false })(
        'http:'
      );

      try {
        const statusCode = await new Promise<number>((resolve, reject) => {
          const request = http.get(
            'http://proxy-test.invalid/probe',
            { agent },
            response => {
              response.resume();
              response.once('end', () => resolve(response.statusCode ?? 0));
            }
          );
          request.once('error', reject);
        });

        assert.strictEqual(statusCode, 204);
        assert.strictEqual(proxyRequestReceived, true);
      } finally {
        agent.destroy();
      }
    } finally {
      await new Promise<void>(resolve => proxyServer.close(() => resolve()));
    }
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

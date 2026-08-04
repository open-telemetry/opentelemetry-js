/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as net from 'net';
import { httpAgentFactoryFromOptions } from '../../src/configuration/otlp-node-http-configuration';
import { createHttpExporterTransport } from '../../src/transport/http-exporter-transport';

const TEST_ENV_VARIABLES = [
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'NO_PROXY',
  'http_proxy',
  'https_proxy',
  'no_proxy',
  'ALL_PROXY',
] as const;

const sampleRequestData = new Uint8Array([1, 2, 3]);

function listen(server: net.Server): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      const address = server.address();
      assert.ok(address !== null && typeof address !== 'string');
      resolve(address.port);
    });
  });
}

function close(server: net.Server): Promise<void> {
  if (!server.listening) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    server.close(error => (error === undefined ? resolve() : reject(error)));
  });
}

function createTransport(
  url: string,
  agentOptions: http.AgentOptions | https.AgentOptions = {}
) {
  return createHttpExporterTransport({
    url,
    headers: async () => ({}),
    compression: 'none',
    agentFactory: httpAgentFactoryFromOptions(agentOptions),
  });
}

describe('HttpExporterTransport proxy environment support', function () {
  let originalEnv: Record<string, string | undefined>;
  const servers: net.Server[] = [];
  const sockets = new Set<net.Socket>();

  function track(server: net.Server): void {
    servers.push(server);
    server.on('connection', socket => {
      sockets.add(socket);
      socket.on('close', () => sockets.delete(socket));
    });
  }

  beforeEach(function () {
    originalEnv = {};
    for (const envVar of TEST_ENV_VARIABLES) {
      originalEnv[envVar] = process.env[envVar];
      delete process.env[envVar];
    }
  });

  afterEach(async function () {
    for (const envVar of TEST_ENV_VARIABLES) {
      const originalValue = originalEnv[envVar];
      if (originalValue === undefined) {
        delete process.env[envVar];
      } else {
        process.env[envVar] = originalValue;
      }
    }

    for (const socket of sockets) {
      socket.destroy();
    }
    sockets.clear();
    await Promise.all(servers.splice(0).map(close));
  });

  it('sends HTTP exports through HTTP_PROXY', async function () {
    let proxiedUrl: string | undefined;
    const proxy = http.createServer((request, response) => {
      proxiedUrl = request.url;
      response.statusCode = 200;
      response.end();
    });
    track(proxy);
    const proxyPort = await listen(proxy);
    process.env.HTTP_PROXY = `http://127.0.0.1:${proxyPort}`;

    const targetUrl = 'http://collector.invalid/v1/traces';
    const result = await createTransport(targetUrl).send(
      sampleRequestData,
      1000
    );

    assert.strictEqual(result.status, 'success');
    assert.strictEqual(proxiedUrl, targetUrl);
  });

  it('prefers lowercase http_proxy', async function () {
    let proxiedUrl: string | undefined;
    const proxy = http.createServer((request, response) => {
      proxiedUrl = request.url;
      response.statusCode = 200;
      response.end();
    });
    track(proxy);
    const proxyPort = await listen(proxy);

    process.env.HTTP_PROXY = 'http://127.0.0.1:1';
    process.env.http_proxy = `http://127.0.0.1:${proxyPort}`;

    const targetUrl = 'http://collector.invalid/v1/traces';
    const result = await createTransport(targetUrl).send(
      sampleRequestData,
      1000
    );

    assert.strictEqual(result.status, 'success');
    assert.strictEqual(proxiedUrl, targetUrl);
  });

  it('respects NO_PROXY', async function () {
    let proxyRequests = 0;
    const proxy = http.createServer((_, response) => {
      proxyRequests += 1;
      response.statusCode = 500;
      response.end();
    });
    track(proxy);
    const proxyPort = await listen(proxy);

    let targetRequests = 0;
    const target = http.createServer((_, response) => {
      targetRequests += 1;
      response.statusCode = 200;
      response.end();
    });
    track(target);
    const targetPort = await listen(target);

    process.env.HTTP_PROXY = `http://127.0.0.1:${proxyPort}`;
    process.env.NO_PROXY = '127.0.0.1';

    const result = await createTransport(
      `http://127.0.0.1:${targetPort}/v1/traces`
    ).send(sampleRequestData, 1000);

    assert.strictEqual(result.status, 'success');
    assert.strictEqual(targetRequests, 1);
    assert.strictEqual(proxyRequests, 0);
  });

  it('does not use unsupported ALL_PROXY', async function () {
    let proxyRequests = 0;
    const proxy = http.createServer((_, response) => {
      proxyRequests += 1;
      response.statusCode = 500;
      response.end();
    });
    track(proxy);
    const proxyPort = await listen(proxy);

    let targetRequests = 0;
    const target = http.createServer((_, response) => {
      targetRequests += 1;
      response.statusCode = 200;
      response.end();
    });
    track(target);
    const targetPort = await listen(target);

    process.env.ALL_PROXY = `http://127.0.0.1:${proxyPort}`;
    const result = await createTransport(
      `http://127.0.0.1:${targetPort}/v1/traces`
    ).send(sampleRequestData, 1000);

    assert.strictEqual(result.status, 'success');
    assert.strictEqual(targetRequests, 1);
    assert.strictEqual(proxyRequests, 0);
  });

  it('tunnels HTTPS exports through HTTPS_PROXY', async function () {
    const certsDir = `${process.cwd()}/test/certs`;
    const target = https.createServer(
      {
        cert: fs.readFileSync(`${certsDir}/server.crt`),
        key: fs.readFileSync(`${certsDir}/server.key`),
      },
      (_, response) => {
        response.statusCode = 200;
        response.end();
      }
    );
    track(target);
    const targetPort = await listen(target);

    let connectTarget: string | undefined;
    const proxy = http.createServer();
    proxy.on('connect', (request, clientSocket, head) => {
      connectTarget = request.url;
      const upstream = net.connect(targetPort, '127.0.0.1', () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        if (head.length > 0) {
          upstream.write(head);
        }
        upstream.pipe(clientSocket);
        clientSocket.pipe(upstream);
      });
    });
    track(proxy);
    const proxyPort = await listen(proxy);
    process.env.HTTPS_PROXY = `http://127.0.0.1:${proxyPort}`;

    const result = await createTransport(
      `https://127.0.0.1:${targetPort}/v1/traces`,
      { rejectUnauthorized: false }
    ).send(sampleRequestData, 1000);

    if (result.status !== 'success') {
      throw result.error;
    }
    assert.strictEqual(result.status, 'success');
    assert.strictEqual(connectTarget, `127.0.0.1:${targetPort}`);
  });
});

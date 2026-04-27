/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as http from 'http';
import * as assert from 'assert';
import {
  compressAndSend,
  sendWithHttp,
} from '../../src/transport/http-transport-utils';
import { VERSION } from '../../src/version';

describe('compressAndSend', function () {
  it('compressAndSend on destroyed request should handle error', function (done) {
    const request = http.request({});
    request.destroy();
    compressAndSend(request, 'gzip', Buffer.from([1, 2, 3]), error => {
      try {
        assert.match(error.message, /socket hang up/);
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});

describe('sendWithHttp', function () {
  let sentUserAgent: string;
  let sentUrl: URL;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestFn: any = (
    url: URL,
    opts: http.RequestOptions,
    cb?: (res: http.IncomingMessage) => void
  ): http.ClientRequest => {
    sentUrl = url;
    sentUserAgent = (opts.headers as Record<string, string>)['User-Agent'];
    return http.request(url, opts, cb).destroy();
  };

  beforeEach(function () {
    sentUserAgent = '';
  });

  it('sends a request setting the default user-agent header', async function () {
    await sendWithHttp(
      requestFn,
      'http://localhost:8080',
      {},
      'gzip',
      undefined,
      new http.Agent(),
      Buffer.from([1, 2, 3]),
      100
    );
    assert.strictEqual(
      sentUserAgent,
      `OTel-OTLP-Exporter-JavaScript/${VERSION}`
    );
  });

  it('sends a request prepending the provided user-agent to the default one', async function () {
    await sendWithHttp(
      requestFn,
      'http://localhost:8080',
      {},
      'gzip',
      'Transport-User-Agent/1.2.3',
      new http.Agent(),
      Buffer.from([1, 2, 3]),
      100
    );
    assert.strictEqual(
      sentUserAgent,
      `Transport-User-Agent/1.2.3 OTel-OTLP-Exporter-JavaScript/${VERSION}`
    );
  });

  it('passes URL object directly for IPv6 addresses', async function () {
    await sendWithHttp(
      requestFn,
      'http://[::1]:4318/v1/traces',
      {},
      'none',
      undefined,
      new http.Agent(),
      Buffer.from([1, 2, 3]),
      100
    );
    assert.ok(sentUrl instanceof URL);
    assert.strictEqual(sentUrl.hostname, '[::1]');
    assert.strictEqual(sentUrl.port, '4318');
    assert.strictEqual(sentUrl.pathname, '/v1/traces');
  });

  it('passes URL object directly for IPv6 link-local addresses', async function () {
    await sendWithHttp(
      requestFn,
      'http://[fe80::1]:4318/v1/traces',
      {},
      'none',
      undefined,
      new http.Agent(),
      Buffer.from([1, 2, 3]),
      100
    );
    assert.ok(sentUrl instanceof URL);
    assert.strictEqual(sentUrl.hostname, '[fe80::1]');
  });

  it('passes URL object directly for IPv4 addresses', async function () {
    await sendWithHttp(
      requestFn,
      'http://192.168.1.1:4318/v1/traces',
      {},
      'none',
      undefined,
      new http.Agent(),
      Buffer.from([1, 2, 3]),
      100
    );
    assert.ok(sentUrl instanceof URL);
    assert.strictEqual(sentUrl.hostname, '192.168.1.1');
  });

  it('passes URL object directly for regular hostnames', async function () {
    await sendWithHttp(
      requestFn,
      'http://example.com:4318/v1/traces',
      {},
      'none',
      undefined,
      new http.Agent(),
      Buffer.from([1, 2, 3]),
      100
    );
    assert.ok(sentUrl instanceof URL);
    assert.strictEqual(sentUrl.hostname, 'example.com');
  });
});

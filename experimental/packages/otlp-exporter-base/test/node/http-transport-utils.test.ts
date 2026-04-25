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
  let sentHostname: string;

  const requestFn: typeof http.request = (
    opts: any,
    cb: any
  ): http.ClientRequest => {
    sentUserAgent = opts.headers['User-Agent'];
    sentHostname = opts.hostname;
    return http.request(opts, cb).destroy();
  };

  beforeEach(function () {
    sentUserAgent = '';
    sentHostname = '';
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

  it('removes brackets from IPv6 hostname', async function () {
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
    assert.strictEqual(sentHostname, '::1');
  });

  it('handles IPv6 loopback address', async function () {
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
    assert.strictEqual(sentHostname, 'fe80::1');
  });

  it('preserves IPv4 hostname unchanged', async function () {
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
    assert.strictEqual(sentHostname, '192.168.1.1');
  });

  it('preserves regular hostname unchanged', async function () {
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
    assert.strictEqual(sentHostname, 'example.com');
  });
});

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
  const requestFn: typeof http.request = (
    opts: any,
    cb: any
  ): http.ClientRequest => {
    sentUserAgent = opts.headers['User-Agent'];
    return http.request(opts, cb).destroy();
  };
  let sentUserAgent: string;

  beforeEach(function () {
    sentUserAgent = '';
  });

  it('sends a request setting the default user-agent header', function (done) {
    let firstCallback = true;
    sendWithHttp(
      requestFn,
      'http://localhost:8080',
      {},
      'gzip',
      undefined,
      new http.Agent(),
      Buffer.from([1, 2, 3]),
      // TODO: the `onDone` callback is called twice because there are two error handlers
      // - first is attached on the request created in `sendWithHttp`
      // - second is attached on the pipe within `compressAndSend`
      () => {
        if (firstCallback) {
          firstCallback = false;
          assert.strictEqual(
            sentUserAgent,
            `OTel-OTLP-Exporter-JavaScript/${VERSION}`
          );
          done();
        }
      },
      100
    );
  });

  it('sends a request prepending the provided user-agent to the default one', function (done) {
    let firstCallback = true;
    sendWithHttp(
      requestFn,
      'http://localhost:8080',
      {},
      'gzip',
      'Transport-User-Agent/1.2.3',
      new http.Agent(),
      Buffer.from([1, 2, 3]),
      // TODO: the `onDone` callback is called twice because there are two error handlers
      // - first is attached on the request created in `sendWithHttp`
      // - second is attached on the pipe within `compressAndSend`
      () => {
        if (firstCallback) {
          firstCallback = false;
          assert.strictEqual(
            sentUserAgent,
            `Transport-User-Agent/1.2.3 OTel-OTLP-Exporter-JavaScript/${VERSION}`
          );
          done();
        }
      },
      100
    );
  });
});

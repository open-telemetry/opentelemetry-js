/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
});

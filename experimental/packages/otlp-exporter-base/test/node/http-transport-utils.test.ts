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
    sendUserAgent = opts.headers['User-Agent'];
    // const request = http.request(opts, cb);
    // return request.destroy();
    return http.request(opts, cb);
  };
  let sendUserAgent: string;

  beforeEach(() => {
    sendUserAgent = '';
  });

  it('sends a request setting the provided user agent', function (done) {
    let firstCallback = true;
    sendWithHttp(
      requestFn,
      {
        url: 'http://localhost:8080',
        compression: 'gzip',
        headers: () => ({}),
        userAgent: 'Transport-User-Agent/1.2.3',
      },
      new http.Agent(),
      Buffer.from([1, 2, 3]),
      // TODO: the `onDone` callback is called twice because there are two error handlers
      // - first is attached on the request created in `sendWithHttp`
      // - second is attached on the pipe within `compressAndSend`
      () => {
        if (firstCallback) {
          firstCallback = false;
          assert.strictEqual(sendUserAgent, 'Transport-User-Agent/1.2.3');
          done();
        }
      },
      100
    );
  });
});

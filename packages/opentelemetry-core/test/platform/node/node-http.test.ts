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

import * as assert from 'assert';
import * as http from 'http';
import { AddressInfo } from 'net';
import * as sinon from 'sinon';
import {
  HttpClientError,
  RetriableError,
} from '../../../src/internal/http-client';
import { httpRequest } from '../../../src/platform/node/internal';

describe('httpRequest', () => {
  let server: http.Server;
  let port: number;
  let requestListener: http.RequestListener;
  before(async () => {
    server = http.createServer((req, res) => {
      requestListener(req, res);
    });

    await new Promise<void>(resolve => {
      server.once('listening', resolve);
      server.listen();
    });
    port = (server.address() as AddressInfo).port;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      })
    );
  });

  beforeEach(() => {
    requestListener = () => {
      throw new Error('not implemented');
    };
  });

  it('should request with json payload', async () => {
    const spy = (requestListener = sinon.spy(
      (req: http.IncomingMessage, res: http.ServerResponse) => {
        assert.strictEqual(req.url, '/my-path');
        assert.strictEqual(req.headers['content-type'], 'application/json');
        assert.strictEqual(req.headers['my-header'], 'my-value');
        req.setEncoding('utf8');

        let data = '';
        req.on('data', buf => {
          data += buf;
        });
        req.on('end', () => {
          assert.strictEqual(data, '{"key":"value"}');
          res.statusCode = 200;
          res.end();
        });
      }
    ));

    await httpRequest(`http://localhost:${port}/my-path`, '{"key":"value"}', {
      contentType: 'application/json',
      headers: {
        'my-header': 'my-value',
      },
    });

    assert.strictEqual(spy.callCount, 1);
  });

  it('should reject with RetriableError if status is 429', async () => {
    const spy = (requestListener = sinon.spy(
      (req: http.IncomingMessage, res: http.ServerResponse) => {
        req.on('data', () => {});
        req.on('end', () => {
          res.statusCode = 429;
          res.end();
        });
      }
    ));

    try {
      await httpRequest(`http://localhost:${port}/my-path`, '{"key":"value"}');
      assert.fail('unreachable');
    } catch (e) {
      assert.ok(e instanceof RetriableError);
      assert.strictEqual(e.retryAfterMillis, -1);
    }

    assert.strictEqual(spy.callCount, 1);
  });

  it('should reject with RetriableError if status is 429 and has a retry-after header', async () => {
    const spy = (requestListener = sinon.spy(
      (req: http.IncomingMessage, res: http.ServerResponse) => {
        req.on('data', () => {});
        req.on('end', () => {
          res.statusCode = 429;
          res.setHeader('retry-after', '1000');
          res.end();
        });
      }
    ));

    try {
      await httpRequest(`http://localhost:${port}/my-path`, '{"key":"value"}');
      assert.fail('unreachable');
    } catch (e) {
      assert.ok(e instanceof RetriableError);
      assert.strictEqual(e.retryAfterMillis, 1000_000);
    }

    assert.strictEqual(spy.callCount, 1);
  });

  it('should reject request failed', async () => {
    const spy = (requestListener = sinon.spy(
      (req: http.IncomingMessage, res: http.ServerResponse) => {
        req.on('data', () => {});
        req.on('end', () => {
          res.statusCode = 400;
          res.end();
        });
      }
    ));

    try {
      await httpRequest(`http://localhost:${port}/my-path`, '{"key":"value"}');
      assert.fail('unreachable');
    } catch (e) {
      assert.ok(e instanceof HttpClientError);
      assert.strictEqual(e.statusCode, 400);
    }

    assert.strictEqual(spy.callCount, 1);
  });

  it('should reject when request timeouts', async () => {
    const spy = (requestListener = sinon.spy(
      (req: http.IncomingMessage, res: http.ServerResponse) => {
        req.on('data', () => {});
        req.on('end', () => {
          setTimeout(() => {
            res.statusCode = 200;
            res.end();
          }, 1000);
        });
      }
    ));

    try {
      await httpRequest(`http://localhost:${port}/my-path`, '{"key":"value"}', {
        timeoutMs: 10,
      });
      assert.fail('unreachable');
    } catch (e) {
      assert.ok(e instanceof HttpClientError);
      assert.strictEqual(e.message, 'Request Timeout');
    }

    assert.strictEqual(spy.callCount, 1);
  });
});

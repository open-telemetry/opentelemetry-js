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
import { ExportResultCode } from '../../../src/ExportResult';
import {
  createHttpExportClient,
  determineClient,
} from '../../../src/internal/http-export';
import { httpRequest } from '../../../src/platform/node/internal';

describe('http-export', () => {
  describe('determineClient', () => {
    it('should find the available client', () => {
      const reqFunction = determineClient([
        'XMLHttpReuqest',
        'sendBeacon',
        'node:http',
      ]);
      assert.strictEqual(reqFunction, httpRequest);
    });

    it('should throw when no clients available', () => {
      assert.throws(() => {
        determineClient(['XMLHttpReuqest']);
      }, /Error: No http client available: XMLHttpReuqest/);
    });

    it('should ignore unrecognizable clients', () => {
      const reqFunction = determineClient(['foobar' as any, 'node:http']);
      assert.strictEqual(reqFunction, httpRequest);
    });
  });

  describe('createHttpExportClient', () => {
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

    it('should resolve with ExportResult', async () => {
      requestListener = (req, res) => {
        res.statusCode = 200;
        res.end();
      };
      const request = createHttpExportClient(['node:http']);
      const result = await request(
        `http://localhost:${port}`,
        '{"payload":"value"}'
      );
      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
    });

    it('should reject when request fails', async () => {
      requestListener = (req, res) => {
        res.statusCode = 400;
        res.end();
      };
      const request = createHttpExportClient(['node:http']);
      const result = await request(
        `http://localhost:${port}`,
        '{"payload":"value"}'
      );
      assert.strictEqual(result.code, ExportResultCode.FAILED);
    });

    it('should retry when the request is retriable', async () => {
      let callCount = 0;
      const callTimestamps: number[] = [];
      const spy = (requestListener = sinon.spy((req, res) => {
        callCount++;
        callTimestamps.push(Date.now());
        res.setHeader('retry-after', 1);
        if (callCount <= 1) {
          res.statusCode = 429;
        } else {
          res.statusCode = 200;
        }
        res.end();
      }));
      const request = createHttpExportClient(['node:http']);
      const result = await request(
        `http://localhost:${port}`,
        '{"payload":"value"}'
      );
      assert.strictEqual(result.code, ExportResultCode.SUCCESS);
      assert.strictEqual(spy.callCount, 2);
      assert.ok(callTimestamps[1] - callTimestamps[0] >= 1000);
    });

    it('should reject when excedding the retry limit', async () => {
      const spy = (requestListener = sinon.spy((req, res) => {
        res.setHeader('retry-after', 1);
        res.statusCode = 429;
        res.end();
      }));
      const request = createHttpExportClient(['node:http']);
      const result = await request(
        `http://localhost:${port}`,
        '{"payload":"value"}',
        {
          maxAttempts: 1,
        }
      );
      assert.strictEqual(result.code, ExportResultCode.FAILED);
      assert.strictEqual(spy.callCount, 2);
    });
  });
});

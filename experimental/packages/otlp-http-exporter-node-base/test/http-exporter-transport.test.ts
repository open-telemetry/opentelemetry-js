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
import * as sinon from 'sinon';
import * as http from 'http';
import { Stream } from 'stream';
import * as https from 'https';
import { createHttpExporterTransport } from '../src';

class MockedResponse extends Stream {
  constructor(
    private _code: number,
    private _msg?: string
  ) {
    super();
  }

  send(_data: Buffer) {
    this.emit('data', _data);
    this.emit('end');
  }

  get statusCode() {
    return this._code;
  }

  get statusMessage() {
    return this._msg;
  }
}

describe('HttpExporterTransport', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('send', async function () {
    it('uses http module for http url', function (done) {
      const expectedData = [1, 2, 3, 4];
      const expectedResponse = [4, 3, 2, 1];

      sinon.stub(http, 'request').callsFake((options: any, cb: any) => {
        const fakeRequest = new Stream.PassThrough();
        let actualSentData = Buffer.from([]);
        fakeRequest.on('data', chunk => {
          actualSentData = Buffer.concat([actualSentData, chunk]);
        });

        fakeRequest.on('end', () => {
          try {
            assert.strictEqual(options.hostname, 'foo.bar.com');
            assert.strictEqual(options.method, 'POST');
            assert.strictEqual(options.path, '/');
            assert.deepEqual(options.headers, { foo: 'bar' });
            assert.deepEqual([...actualSentData], expectedData);
          } catch (e) {
            done(e);
          }
        });

        const mockRes = new MockedResponse(200);
        cb(mockRes);
        mockRes.send(Buffer.from(expectedResponse));
        return fakeRequest as any;
      });

      const exporterTransport = createHttpExporterTransport({
        url: 'http://foo.bar.com/',
        timeoutMillis: 2000,
        headers: { foo: 'bar' },
        agentOptions: { keepAlive: true },
        compression: 'none',
      });

      exporterTransport.send(Uint8Array.from(expectedData)).then(
        result => {
          try {
            assert.deepEqual(result.status, 'success');
            assert.ok(result.data);
            assert.deepEqual([...result.data], expectedResponse);
            done();
          } catch (err) {
            done(err);
          }
        },
        err => {
          done(err);
        }
      );
    });

    it('uses https module for https url', function (done) {
      const expectedData = [1, 2, 3, 4];
      const expectedResponse = [4, 3, 2, 1];

      sinon.stub(https, 'request').callsFake((options: any, cb: any) => {
        const fakeRequest = new Stream.PassThrough();
        let actualSentData = Buffer.from([]);
        fakeRequest.on('data', chunk => {
          actualSentData = Buffer.concat([actualSentData, chunk]);
        });

        fakeRequest.on('end', () => {
          try {
            assert.strictEqual(options.hostname, 'foo.bar.com');
            assert.strictEqual(options.method, 'POST');
            assert.strictEqual(options.path, '/');
            assert.deepEqual(options.headers, { foo: 'bar' });
            assert.deepEqual([...actualSentData], expectedData);
          } catch (e) {
            done(e);
          }
        });

        const mockRes = new MockedResponse(200);
        cb(mockRes);
        mockRes.send(Buffer.from(expectedResponse));
        return fakeRequest as any;
      });

      const exporterTransport = createHttpExporterTransport({
        url: 'https://foo.bar.com/',
        timeoutMillis: 2000,
        headers: { foo: 'bar' },
        agentOptions: { keepAlive: true },
        compression: 'none',
      });

      exporterTransport.send(Buffer.from(expectedData)).then(
        result => {
          try {
            assert.deepEqual(result.status, 'success');
            assert.ok(result.data);
            assert.deepEqual([...result.data], expectedResponse);
            done();
          } catch (err) {
            done(err);
          }
        },
        err => {
          done(err);
        }
      );
    });
  });
});

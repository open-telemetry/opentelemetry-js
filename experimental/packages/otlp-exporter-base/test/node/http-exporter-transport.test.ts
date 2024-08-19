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

import { createHttpExporterTransport } from '../../src/platform/node/http-exporter-transport';
import * as http from 'http';
import * as assert from 'assert';
import sinon = require('sinon');
import {
  ExportResponseRetryable,
  ExportResponseFailure,
  ExportResponseSuccess,
} from '../../src';
import * as zlib from 'zlib';

const sampleRequestData = new Uint8Array([1, 2, 3]);

describe('HttpExporterTransport', function () {
  describe('send', function () {
    let server: http.Server | undefined;

    afterEach(function (done) {
      sinon.restore();
      if (server != null) {
        server.close(done);
        server = undefined;
      } else {
        server = undefined;
        done();
      }
    });

    it('returns success on success status', async function () {
      // arrange
      const expectedResponseData = Buffer.from([4, 5, 6]);
      server = http.createServer((_, res) => {
        res.statusCode = 200;
        res.write(expectedResponseData);
        res.end();
      });
      server.listen(8080);

      const transport = createHttpExporterTransport({
        url: 'http://localhost:8080',
        headers: {},
        compression: 'none',
        agentOptions: {},
      });

      // act
      const result = await transport.send(sampleRequestData, 1000);

      // assert
      assert.strictEqual(result.status, 'success');
      assert.deepEqual(
        (result as ExportResponseSuccess).data,
        expectedResponseData
      );
    });

    it('returns retryable on retryable status', async function () {
      //arrange
      server = http.createServer((_, res) => {
        res.statusCode = 503;
        res.end();
      });
      server.listen(8080);

      const transport = createHttpExporterTransport({
        url: 'http://localhost:8080',
        headers: {},
        compression: 'none',
        agentOptions: {},
      });

      // act
      const result = await transport.send(sampleRequestData, 1000);

      // assert
      assert.strictEqual(result.status, 'retryable');
    });

    it('returns retryable on retryable status with retry-after header', async function () {
      // arrange
      server = http.createServer((_, res) => {
        res.statusCode = 429;
        res.setHeader('retry-after', 1);
        res.end();
      });
      server.listen(8080);

      // act
      const transport = createHttpExporterTransport({
        url: 'http://localhost:8080',
        headers: {},
        compression: 'none',
        agentOptions: {},
      });

      const result = await transport.send(sampleRequestData, 1000);

      // assert
      assert.strictEqual(result.status, 'retryable');
      assert.strictEqual(
        (result as ExportResponseRetryable).retryInMillis,
        1000
      );
    });

    it('returns failure on non-retryable status', async function () {
      // arrange
      server = http.createServer((_, res) => {
        res.statusCode = 404;
        res.end();
      });
      server.listen(8080);

      const transport = createHttpExporterTransport({
        url: 'http://localhost:8080',
        headers: {},
        compression: 'none',
        agentOptions: {},
      });

      // act
      const result = await transport.send(sampleRequestData, 1000);

      // assert
      assert.strictEqual(result.status, 'failure');
      assert.strictEqual(
        (result as ExportResponseFailure).error.message,
        'Not Found'
      );
    });

    it('returns failure when request times out', function (done) {
      // arrange
      const timer = sinon.useFakeTimers();
      server = http.createServer((_, res) => {
        setTimeout(() => {
          res.statusCode = 200;
          res.end();
        }, 1000);
      });
      server.listen(8080);

      const transport = createHttpExporterTransport({
        url: 'http://localhost:8080',
        headers: {},
        compression: 'none',
        agentOptions: {},
      });

      // act
      transport
        .send(sampleRequestData, 100)
        .then(result => {
          // assert
          assert.strictEqual(result.status, 'failure');
          assert.strictEqual(
            (result as ExportResponseFailure).error.message,
            'Request Timeout'
          );
          done();
        })
        .catch(error => {
          done(error);
        });
      // pass more time than passed as timeout value
      timer.tick(200);
    });

    it('returns failure when socket hangs up', async function () {
      // arrange
      server = http.createServer((_, res) => {
        res.destroy();
      });
      server.listen(8080);

      const transport = createHttpExporterTransport({
        url: 'http://localhost:8080',
        headers: {},
        compression: 'none',
        agentOptions: {},
      });

      // act
      const result = await transport.send(sampleRequestData, 100);

      // assert
      assert.strictEqual(result.status, 'failure');
      assert.strictEqual(
        (result as ExportResponseFailure).error.message,
        'socket hang up'
      );
    });

    it('returns failure when server does not exist', async function () {
      // arrange
      const transport = createHttpExporterTransport({
        // use wrong port
        url: 'http://example.test',
        headers: {},
        compression: 'none',
        agentOptions: {},
      });

      // act
      const result = await transport.send(sampleRequestData, 100);

      // assert
      assert.strictEqual(result.status, 'failure');
      assert.strictEqual(
        (result as ExportResponseFailure).error.message,
        'getaddrinfo ENOTFOUND example.test'
      );
    });

    it('passes uncompressed input to server', function (done) {
      // arrange
      const expectedHeaders = { foo: 'foo-value', bar: 'bar-value' };
      server = http.createServer((req, res) => {
        const requestData: Buffer[] = [];
        req.on('data', chunk => {
          requestData.push(chunk);
        });

        req.on('end', () => {
          try {
            // assert
            assert.strictEqual(req.headers.foo, expectedHeaders.foo);
            assert.strictEqual(req.headers.bar, expectedHeaders.bar);
            assert.strictEqual(req.headers['content-encoding'], undefined);
            assert.deepEqual(
              Buffer.concat(requestData),
              Buffer.from(sampleRequestData)
            );
            done();
          } catch (e) {
            // ensure done is called and errors are reported
            done(e);
          }

          res.statusCode = 200;
          res.end();
        });
      });
      server.listen(8080);

      // act
      const transport = createHttpExporterTransport({
        url: 'http://localhost:8080',
        headers: { foo: 'foo-value', bar: 'bar-value' },
        compression: 'none',
        agentOptions: {},
      });

      // assert
      transport.send(sampleRequestData, 100);
    });

    it('passes gzip compressed input to server', function (done) {
      // arrange
      const expectedHeaders = { foo: 'foo-value', bar: 'bar-value' };
      server = http.createServer((req, res) => {
        const requestData: Buffer[] = [];
        req.on('data', chunk => {
          requestData.push(chunk);
        });

        req.on('end', () => {
          try {
            // assert
            assert.strictEqual(req.headers.foo, expectedHeaders.foo);
            assert.strictEqual(req.headers.bar, expectedHeaders.bar);
            assert.strictEqual(req.headers['content-encoding'], 'gzip');
            zlib.unzip(Buffer.concat(requestData), (error, result) => {
              if (error != null) {
                done(error);
              }
              try {
                assert.deepEqual(result, Buffer.from(sampleRequestData));
                done();
              } catch (e) {
                // ensure done is called and errors are reported
                done(e);
              }
            });
          } catch (e) {
            // ensure done is called and errors are reported
            done(e);
          }

          res.statusCode = 200;
          res.end();
        });
      });
      server.listen(8080);

      const transport = createHttpExporterTransport({
        url: 'http://localhost:8080',
        headers: { foo: 'foo-value', bar: 'bar-value' },
        compression: 'gzip',
        agentOptions: {},
      });

      // act
      transport.send(sampleRequestData, 100);
    });
  });
});

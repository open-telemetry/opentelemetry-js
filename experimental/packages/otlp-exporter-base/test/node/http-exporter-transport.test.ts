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

import { createHttpExporterTransport } from '../../src/transport/http-exporter-transport';
import * as http from 'http';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  ExportResponseRetryable,
  ExportResponseFailure,
  ExportResponseSuccess,
  OTLPExporterError,
} from '../../src';
import * as zlib from 'zlib';
import { createConnection, TcpNetConnectOpts } from 'net';

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
        headers: async () => ({}),
        compression: 'none',
        agentFactory: () => new http.Agent(),
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

    it('returns success on success status with custom agent', async function () {
      // arrange
      const expectedResponseData = Buffer.from([4, 5, 6]);
      server = http.createServer((_, res) => {
        res.statusCode = 200;
        res.write(expectedResponseData);
        res.end();
      });
      server.listen(8080);

      class SedAgent extends http.Agent {
        createConnection(options: TcpNetConnectOpts, listener: () => void) {
          return createConnection(
            { ...options, host: options.host?.replaceAll('j', 'l') },
            listener
          );
        }
      }

      const transport = createHttpExporterTransport({
        url: 'http://jocajhost:8080',
        headers: async () => ({}),
        compression: 'none',
        agentFactory: protocol => {
          assert.strictEqual(protocol, 'http:');
          return new SedAgent();
        },
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
        headers: async () => ({}),
        compression: 'none',
        agentFactory: () => new http.Agent(),
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
        headers: async () => ({}),
        compression: 'none',
        agentFactory: () => new http.Agent(),
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
        res.end('response-body');
      });
      server.listen(8080);

      const transport = createHttpExporterTransport({
        url: 'http://localhost:8080',
        headers: async () => ({}),
        compression: 'none',
        agentFactory: () => new http.Agent(),
      });

      // act
      const result = await transport.send(sampleRequestData, 1000);

      // assert
      assert.strictEqual(result.status, 'failure');
      assert.strictEqual(
        (result as ExportResponseFailure).error.message,
        'Not Found'
      );
      assert.strictEqual(
        ((result as ExportResponseFailure).error as OTLPExporterError).data,
        'response-body'
      );
      assert.strictEqual(
        ((result as ExportResponseFailure).error as OTLPExporterError).code,
        404
      );
    });

    it('returns retryable when request times out', function (done) {
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
        headers: async () => ({}),
        compression: 'none',
        agentFactory: () => new http.Agent(),
      });

      // act
      transport
        .send(sampleRequestData, 100)
        .then(result => {
          // assert
          assert.strictEqual(result.status, 'retryable');
          assert.ok(result.error, 'Expected error object to be present');
          assert.strictEqual(result.error.message, 'Request timed out');
          done();
        })
        .catch(error => {
          done(error);
        });
      // pass more time than passed as timeout value
      timer.tick(200);
    });

    it('returns retryable when socket hangs up (ECONNRESET)', async function () {
      // arrange
      server = http.createServer((_, res) => {
        res.destroy();
      });
      server.listen(8080);

      const transport = createHttpExporterTransport({
        url: 'http://localhost:8080',
        headers: async () => ({}),
        compression: 'none',
        agentFactory: () => new http.Agent(),
      });

      // act
      const result = await transport.send(sampleRequestData, 100);

      // assert
      assert.strictEqual(result.status, 'retryable');
      assert.ok(result.error, 'Expected error object to be present');
      assert.strictEqual(
        (result.error as NodeJS.ErrnoException).code,
        'ECONNRESET'
      );
      assert.strictEqual(result.error?.message, 'socket hang up');
    });

    it('returns retryable on connection refused (ECONNREFUSED)', async function () {
      // arrange
      server = http.createServer();
      await new Promise<void>(resolve => server!.listen(0, resolve));
      const port = (server!.address() as any).port;
      await new Promise<void>(resolve => server!.close(resolve as any));
      server = undefined;

      const transport = createHttpExporterTransport({
        url: `http://localhost:${port}`,
        headers: async () => ({}),
        compression: 'none',
        agentFactory: () => new http.Agent(),
      });

      // act
      const result = await transport.send(sampleRequestData, 50);

      // assert
      assert.strictEqual(result.status, 'retryable');
      assert.ok(result.error, 'Expected error object to be present');
      assert.strictEqual(
        (result.error as NodeJS.ErrnoException).code,
        'ECONNREFUSED'
      );
      assert.strictEqual(
        result.error?.message.includes('connect ECONNREFUSED'),
        true
      );
    });

    it('returns retryable when server does not exist (ENOTFOUND)', async function () {
      // arrange
      const transport = createHttpExporterTransport({
        // use wrong port
        url: 'http://example.test',
        headers: async () => ({}),
        compression: 'none',
        agentFactory: () => new http.Agent(),
      });

      // act
      const result = await transport.send(sampleRequestData, 100);

      // assert
      assert.strictEqual(result.status, 'retryable');
      assert.ok(result.error, 'Expected error object to be present');
      assert.strictEqual(
        (result.error as NodeJS.ErrnoException).code,
        'ENOTFOUND'
      );
      assert.strictEqual(
        result.error?.message.includes('getaddrinfo ENOTFOUND'),
        true
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
        headers: async () => ({ foo: 'foo-value', bar: 'bar-value' }),
        compression: 'none',
        agentFactory: () => new http.Agent(),
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
        headers: async () => ({ foo: 'foo-value', bar: 'bar-value' }),
        compression: 'gzip',
        agentFactory: () => new http.Agent(),
      });

      // act
      transport.send(sampleRequestData, 100);
    });
  });
});

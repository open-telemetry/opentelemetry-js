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

// Test that http/https are not *double*-instrumented if http is loaded by
// both `require` and `import`.
//
// This is a separate .cjs file to (a) more clearly use `require` and `import`
// without .ts transpilation muddying the issue and (b) to separate this
// file from being run with other `*.test.ts` test files in this package,
// because this needs to be run in a separate process to avoid crosstalk.

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const { SpanKind } = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');

const { HttpInstrumentation } = require('../../build/src/index.js');

const memoryExporter = new InMemorySpanExporter();
const provider = new NodeTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(memoryExporter)],
});
const instrumentation = new HttpInstrumentation();
instrumentation.setTracerProvider(provider);

/**
 * Each of the test cases expects two spans: the http(s) SERVER span and the
 * single http(s) CLIENT span.
 */
function assertTwoSpans(spans, opts) {
  assert.strictEqual(spans.length, 2);
  for (const span of spans) {
    assert.strictEqual(
      span.instrumentationScope.name,
      '@opentelemetry/instrumentation-http'
    );
    if (opts.pathname) {
      assert.strictEqual(span.attributes['http.target'], opts.pathname);
    }
  }
  assert.strictEqual(spans[0].kind, SpanKind.SERVER);
  assert.strictEqual(spans[1].kind, SpanKind.CLIENT);
}

describe('HttpInstrumentation double-instr tests', function () {
  let rhttp;
  let ihttp;
  let rhttps;
  let ihttps;

  before(async () => {
    // arrange
    // This is the main thing being tested: does instr-http work when 'http'
    // has been loaded by both `require` and `import`.
    rhttp = require('http');
    ihttp = await import('http');
    rhttps = require('https');
    ihttps = await import('https');
  });

  beforeEach(() => {
    memoryExporter.reset();
  });

  describe('http', function () {
    let port;
    let server;

    before(done => {
      server = rhttp.createServer((req, res) => {
        req.resume();
        req.on('end', () => {
          res.writeHead(200);
          res.end('pong');
        });
      });

      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        assert.ok(Number.isInteger(port));
        done();
      });
    });

    after(done => {
      server.close(done);
    });

    it('one span for one http.request (require)', async function () {
      // act
      await new Promise(resolve => {
        const clientReq = rhttp.request(
          `http://127.0.0.1:${port}/rhttp.request`,
          clientRes => {
            clientRes.resume();
            clientRes.on('end', resolve);
          }
        );
        clientReq.end();
      });

      // assert
      const spans = memoryExporter.getFinishedSpans();
      assertTwoSpans(spans, { pathname: '/rhttp.request' });
    });

    it('one span for one http.request (import)', async function () {
      await new Promise(resolve => {
        const clientReq = ihttp.request(
          `http://127.0.0.1:${port}/ihttp.request`,
          clientRes => {
            clientRes.resume();
            clientRes.on('end', resolve);
          }
        );
        clientReq.end();
      });

      const spans = memoryExporter.getFinishedSpans();
      assertTwoSpans(spans, { pathname: '/ihttp.request' });
    });
  });

  describe('https', function () {
    let port;
    let server;

    before(done => {
      server = rhttps.createServer(
        {
          key: fs.readFileSync(
            path.resolve(__dirname, '../fixtures/server-key.pem')
          ),
          cert: fs.readFileSync(
            path.resolve(__dirname, '../fixtures/server-cert.pem')
          ),
        },
        (req, res) => {
          req.resume();
          req.on('end', () => {
            res.writeHead(200);
            res.end('pong');
          });
        }
      );

      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        assert.ok(Number.isInteger(port));
        done();
      });
    });

    after(done => {
      server.close(done);
    });

    it('one span for one https.request (require)', async function () {
      await new Promise(resolve => {
        const clientReq = rhttps.request(
          `https://127.0.0.1:${port}/rhttps.request`,
          {
            rejectUnauthorized: false,
          },
          clientRes => {
            clientRes.resume();
            clientRes.on('end', resolve);
          }
        );
        clientReq.end();
      });

      const spans = memoryExporter.getFinishedSpans();
      assertTwoSpans(spans, { pathname: '/rhttps.request' });
    });

    it('one span for one https.request (import)', async function () {
      await new Promise(resolve => {
        const clientReq = ihttps.request(
          `https://127.0.0.1:${port}/ihttps.request`,
          {
            rejectUnauthorized: false,
          },
          clientRes => {
            clientRes.resume();
            clientRes.on('end', resolve);
          }
        );
        clientReq.end();
      });

      const spans = memoryExporter.getFinishedSpans();
      assertTwoSpans(spans, { pathname: '/ihttps.request' });
    });
  });
});

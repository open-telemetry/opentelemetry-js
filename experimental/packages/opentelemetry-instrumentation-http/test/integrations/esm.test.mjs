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

// Test that instrumentation-http works when used from ESM code.

import * as assert from 'assert';
import * as fs from 'fs';

import httpA from 'http'; // ESM import style A
import * as httpB from 'http'; // ESM import style B
import {
  createServer as httpCreateServerC,
  request as httpRequestC,
  get as httpGetC,
} from 'http'; // ESM import style C

import httpsA from 'https'; // ESM import style A
import * as httpsB from 'https'; // ESM import style B
import {
  createServer as httpsCreateServerC,
  request as httpsRequestC,
  get as httpsGetC,
} from 'https'; // ESM import style C

import { SpanKind } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

import { HttpInstrumentation } from '../../build/index.mjs';

/**
 * Simplified span assertion for ESM tests.
 * Detailed attribute validation is covered by CJS tests.
 */
const assertClientSpan = (
  span,
  { httpStatusCode, httpMethod, hostname, pathname }
) => {
  assert.strictEqual(span.kind, SpanKind.CLIENT);
  assert.strictEqual(span.name, httpMethod);
  assert.strictEqual(span.attributes['http.method'], httpMethod);
  assert.strictEqual(span.attributes['http.status_code'], httpStatusCode);
  assert.strictEqual(span.attributes['http.target'], pathname);
  assert.strictEqual(span.attributes['net.peer.name'], hostname);
  assert.ok(span.attributes['net.peer.ip'], 'should have net.peer.ip');
};

const memoryExporter = new InMemorySpanExporter();
const provider = new NodeTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(memoryExporter)],
});
const instrumentation = new HttpInstrumentation();
instrumentation.setTracerProvider(provider);

const httpImports = [
  {
    style: 'import http from "http"',
    createServer: httpA.createServer,
    request: httpA.request,
    get: httpA.get,
  },
  {
    style: 'import * as http from "http"',
    createServer: httpB.createServer,
    request: httpB.request,
    get: httpB.get,
  },
  {
    style: 'import {...} from "http"',
    createServer: httpCreateServerC,
    request: httpRequestC,
    get: httpGetC,
  },
];

for (let httpImport of httpImports) {
  describe(`HttpInstrumentation ESM Integration tests (${httpImport.style})`, () => {
    let port;
    let server;

    before(done => {
      server = httpImport.createServer((req, res) => {
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

    beforeEach(() => {
      memoryExporter.reset();
    });

    it('should instrument http requests using http.request', async () => {
      await new Promise(resolve => {
        const clientReq = httpImport.request(
          `http://127.0.0.1:${port}/http.request`,
          clientRes => {
            clientRes.resume();
            clientRes.on('end', resolve);
          }
        );
        clientReq.end();
      });

      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 2);
      const span = spans.find(s => s.kind === SpanKind.CLIENT);
      assertClientSpan(span, {
        httpStatusCode: 200,
        httpMethod: 'GET',
        hostname: '127.0.0.1',
        pathname: '/http.request',
      });
    });

    it('should instrument http requests using http.get', async () => {
      await new Promise(resolve => {
        httpImport.get(`http://127.0.0.1:${port}/http.get`, clientRes => {
          clientRes.resume();
          clientRes.on('end', resolve);
        });
      });

      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 2);
      const span = spans.find(s => s.kind === SpanKind.CLIENT);
      assertClientSpan(span, {
        httpStatusCode: 200,
        httpMethod: 'GET',
        hostname: '127.0.0.1',
        pathname: '/http.get',
      });
    });
  });
}

const httpsImports = [
  {
    style: 'import https from "https"',
    createServer: httpsA.createServer,
    request: httpsA.request,
    get: httpsA.get,
  },
  {
    style: 'import * as https from "https"',
    createServer: httpsB.createServer,
    request: httpsB.request,
    get: httpsB.get,
  },
  {
    style: 'import {...} from "https"',
    createServer: httpsCreateServerC,
    request: httpsRequestC,
    get: httpsGetC,
  },
];

for (let httpsImport of httpsImports) {
  describe(`HttpsInstrumentation ESM Integration tests (${httpsImport.style})`, () => {
    let port;
    let server;

    before(done => {
      server = httpsImport.createServer(
        {
          key: fs.readFileSync(
            new URL('../fixtures/server-key.pem', import.meta.url)
          ),
          cert: fs.readFileSync(
            new URL('../fixtures/server-cert.pem', import.meta.url)
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

    beforeEach(() => {
      memoryExporter.reset();
    });

    it('should instrument https requests using https.request', async () => {
      await new Promise(resolve => {
        const clientReq = httpsImport.request(
          `https://127.0.0.1:${port}/https.request`,
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
      assert.strictEqual(spans.length, 2);
      const span = spans.find(s => s.kind === SpanKind.CLIENT);
      assertClientSpan(span, {
        httpStatusCode: 200,
        httpMethod: 'GET',
        hostname: '127.0.0.1',
        pathname: '/https.request',
      });
    });

    it('should instrument https requests using https.get', async () => {
      await new Promise(resolve => {
        httpsImport.get(
          `https://127.0.0.1:${port}/https.get`,
          {
            rejectUnauthorized: false,
          },
          clientRes => {
            clientRes.resume();
            clientRes.on('end', resolve);
          }
        );
      });

      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 2);
      const span = spans.find(s => s.kind === SpanKind.CLIENT);
      assertClientSpan(span, {
        httpStatusCode: 200,
        httpMethod: 'GET',
        hostname: '127.0.0.1',
        pathname: '/https.get',
      });
    });
  });
}

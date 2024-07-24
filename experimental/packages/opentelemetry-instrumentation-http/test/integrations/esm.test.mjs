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
import * as http from 'http';
import * as https from 'https';

import { SpanKind } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

import { assertSpan } from '../../build/test/utils/assertSpan.js';
import { HttpInstrumentation } from '../../build/src/index.js';

const provider = new NodeTracerProvider();
const memoryExporter = new InMemorySpanExporter();
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
const instrumentation = new HttpInstrumentation();
instrumentation.setTracerProvider(provider);

describe('HttpInstrumentation ESM Integration tests', () => {
  let port;
  let server;

  before(done => {
    server = http.createServer((req, res) => {
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
    const spanValidations = {
      httpStatusCode: 200,
      httpMethod: 'GET',
      hostname: '127.0.0.1',
      pathname: '/http.request',
      component: 'http',
    };

    await new Promise(resolve => {
      const clientReq = http.request(
        `http://127.0.0.1:${port}/http.request`,
        clientRes => {
          spanValidations.resHeaders = clientRes.headers;
          clientRes.resume();
          clientRes.on('end', resolve);
        }
      );
      clientReq.end();
    });

    let spans = memoryExporter.getFinishedSpans();
    assert.strictEqual(spans.length, 2);
    const span = spans.find(s => s.kind === SpanKind.CLIENT);
    assert.strictEqual(span.name, 'GET');
    assertSpan(span, SpanKind.CLIENT, spanValidations);
  });

  it('should instrument http requests using http.get', async () => {
    const spanValidations = {
      httpStatusCode: 200,
      httpMethod: 'GET',
      hostname: '127.0.0.1',
      pathname: '/http.get',
      component: 'http',
    };

    await new Promise(resolve => {
      http.get(`http://127.0.0.1:${port}/http.get`, clientRes => {
        spanValidations.resHeaders = clientRes.headers;
        clientRes.resume();
        clientRes.on('end', resolve);
      });
    });

    let spans = memoryExporter.getFinishedSpans();
    assert.strictEqual(spans.length, 2);
    const span = spans.find(s => s.kind === SpanKind.CLIENT);
    assert.strictEqual(span.name, 'GET');
    assertSpan(span, SpanKind.CLIENT, spanValidations);
  });
});

describe('HttpsInstrumentation ESM Integration tests', () => {
  let port;
  let server;

  before(done => {
    server = https.createServer(
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
    const spanValidations = {
      httpStatusCode: 200,
      httpMethod: 'GET',
      hostname: '127.0.0.1',
      pathname: '/https.request',
      component: 'https',
    };

    await new Promise(resolve => {
      const clientReq = https.request(
        `https://127.0.0.1:${port}/https.request`,
        {
          rejectUnauthorized: false,
        },
        clientRes => {
          spanValidations.resHeaders = clientRes.headers;
          clientRes.resume();
          clientRes.on('end', resolve);
        }
      );
      clientReq.end();
    });

    let spans = memoryExporter.getFinishedSpans();
    assert.strictEqual(spans.length, 2);
    const span = spans.find(s => s.kind === SpanKind.CLIENT);
    assert.strictEqual(span.name, 'GET');
    assertSpan(span, SpanKind.CLIENT, spanValidations);
  });

  it('should instrument http requests using https.get', async () => {
    const spanValidations = {
      httpStatusCode: 200,
      httpMethod: 'GET',
      hostname: '127.0.0.1',
      pathname: '/https.get',
      component: 'https',
    };

    await new Promise(resolve => {
      https.get(
        `https://127.0.0.1:${port}/https.get`,
        {
          rejectUnauthorized: false,
        },
        clientRes => {
          spanValidations.resHeaders = clientRes.headers;
          clientRes.resume();
          clientRes.on('end', resolve);
        }
      );
    });

    let spans = memoryExporter.getFinishedSpans();
    assert.strictEqual(spans.length, 2);
    const span = spans.find(s => s.kind === SpanKind.CLIENT);
    assert.strictEqual(span.name, 'GET');
    assertSpan(span, SpanKind.CLIENT, spanValidations);
  });
});

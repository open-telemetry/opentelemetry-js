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

import { context, Span, SpanKind } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { NodeTracerProvider } from '@opentelemetry/node';
import { Http } from '@opentelemetry/plugin-http';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import axios, { AxiosResponse } from 'axios';
import * as got from 'got';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as nock from 'nock';
import * as path from 'path';
import * as request from 'request-promise-native';
import * as superagent from 'superagent';
import * as url from 'url';
import { plugin } from '../../src/https';
import { assertSpan } from '../utils/assertSpan';
import { DummyPropagation } from '../utils/DummyPropagation';
import { Socket } from 'net';

const memoryExporter = new InMemorySpanExporter();

export const customAttributeFunction = (span: Span): void => {
  span.setAttribute('span kind', SpanKind.CLIENT);
};

describe('Packages', () => {
  let mockServerPort = 0;
  let mockServer: https.Server;
  const sockets: Array<Socket> = [];
  before(done => {
    mockServer = https.createServer(
      {
        key: fs.readFileSync(
          path.join(__dirname, '..', 'fixtures', 'server-key.pem')
        ),
        cert: fs.readFileSync(
          path.join(__dirname, '..', 'fixtures', 'server-cert.pem')
        ),
      },
      (req, res) => {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.write(
          JSON.stringify({
            success: true,
          })
        );
        res.end();
      }
    );

    mockServer.listen(0, () => {
      const addr = mockServer.address();
      if (addr == null) {
        done(new Error('unexpected addr null'));
        return;
      }

      if (typeof addr === 'string') {
        done(new Error(`unexpected addr ${addr}`));
        return;
      }

      if (addr.port <= 0) {
        done(new Error('Could not get port'));
        return;
      }
      mockServerPort = addr.port;
      done();
    });
  });

  after(done => {
    sockets.forEach(s => s.destroy());
    mockServer.close(done);
  });

  beforeEach(() => {
    memoryExporter.reset();
    context.setGlobalContextManager(new AsyncHooksContextManager().enable());
  });

  afterEach(() => {
    context.disable();
  });
  describe('get', () => {
    const provider = new NodeTracerProvider();
    provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
    beforeEach(() => {
      memoryExporter.reset();
    });

    before(() => {
      plugin.enable((https as unknown) as Http, provider);
    });

    after(() => {
      // back to normal
      nock.cleanAll();
      nock.enableNetConnect();
    });

    let resHeaders: http.IncomingHttpHeaders;
    [
      { name: 'axios', httpPackage: axios }, //keep first
      { name: 'superagent', httpPackage: superagent },
      { name: 'got', httpPackage: { get: (url: string) => got(url) } },
      {
        name: 'request',
        httpPackage: { get: (url: string) => request(url) },
      },
    ].forEach(({ name, httpPackage }) => {
      it(`should create a span for GET requests and add propagation headers by using ${name} package`, async () => {
        if (process.versions.node.startsWith('12') && name === 'got') {
          // got complains with nock and node version 12+
          // > RequestError: The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type function
          // so let's make a real call
          nock.cleanAll();
          nock.enableNetConnect();
        } else {
          nock.load(path.join(__dirname, '../', '/fixtures/google.json'));
        }

        const urlparsed = url.parse(
          `https://localhost:${mockServerPort}/?query=test`
        );
        const result = await httpPackage.get(urlparsed.href!);
        if (!resHeaders) {
          const res = result as AxiosResponse<{}>;
          resHeaders = res.headers;
        }
        const spans = memoryExporter.getFinishedSpans();
        const span = spans.find(s => s.kind === SpanKind.CLIENT);
        assert.ok(span);
        const validations = {
          hostname: urlparsed.hostname!,
          httpStatusCode: 200,
          httpMethod: 'GET',
          pathname: urlparsed.pathname!,
          path: urlparsed.path,
          resHeaders,
          component: plugin.component,
        };

        assert.strictEqual(spans.length, 2);
        assert.strictEqual(span.name, 'HTTP GET');

        switch (name) {
          case 'axios':
            assert.ok(
              result.request._headers[DummyPropagation.TRACE_CONTEXT_KEY]
            );
            assert.ok(
              result.request._headers[DummyPropagation.SPAN_CONTEXT_KEY]
            );
            break;
          case 'got':
          case 'superagent':
            break;
          default:
            break;
        }
        assert.strictEqual(span.attributes['span kind'], SpanKind.CLIENT);
        assertSpan(span, SpanKind.CLIENT, validations);
      });
    });
  });
});

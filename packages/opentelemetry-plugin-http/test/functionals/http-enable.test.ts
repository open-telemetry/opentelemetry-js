/*!
 * Copyright 2019, OpenTelemetry Authors
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

import { NoopLogger } from '@opentelemetry/core';
import { AsyncHooksScopeManager } from '@opentelemetry/scope-async-hooks';
import { SpanKind, Span as ISpan } from '@opentelemetry/types';
import * as assert from 'assert';
import * as http from 'http';
import * as nock from 'nock';
import { HttpPlugin, plugin } from '../../src/http';
import { assertSpan } from '../utils/assertSpan';
import { DummyPropagation } from '../utils/DummyPropagation';
import { httpRequest } from '../utils/httpRequest';
import { NodeTracer } from '@opentelemetry/node-tracer';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/basic-tracer';

let server: http.Server;
const serverPort = 12345;
const protocol = 'http';
const hostname = 'localhost';
const pathname = '/test';
const memoryExporter = new InMemorySpanExporter();

function doNock(
  hostname: string,
  path: string,
  httpCode: number,
  respBody: string,
  times?: number
) {
  const i = times || 1;
  nock(`${protocol}://${hostname}`)
    .get(path)
    .times(i)
    .reply(httpCode, respBody);
}

export const customAttributeFunction = (span: ISpan): void => {
  span.setAttribute('span kind', SpanKind.CLIENT);
};

describe('HttpPlugin', () => {
  it('should return a plugin', () => {
    assert.ok(plugin instanceof HttpPlugin);
  });

  it('should match version', () => {
    assert.strictEqual(process.versions.node, plugin.version);
  });

  it('moduleName should be http', () => {
    assert.strictEqual('http', plugin.moduleName);
  });

  describe('enable()', () => {
    const scopeManager = new AsyncHooksScopeManager();
    const httpTextFormat = new DummyPropagation();
    const logger = new NoopLogger();
    const tracer = new NodeTracer({
      scopeManager,
      logger,
      httpTextFormat,
    });
    tracer.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
    beforeEach(() => {
      memoryExporter.reset();
    });

    before(() => {
      plugin.enable(http, tracer, tracer.logger);
      const ignoreConfig = [
        `http://${hostname}/ignored/string`,
        /\/ignored\/regexp$/i,
        (url: string) => url.endsWith(`/ignored/function`),
      ];
      plugin.options = {
        ignoreIncomingPaths: ignoreConfig,
        ignoreOutgoingUrls: ignoreConfig,
        applyCustomAttributesOnSpan: customAttributeFunction,
      };

      server = http.createServer((request, response) => {
        response.end('Test Server Response');
      });

      server.listen(serverPort);
    });

    after(() => {
      server.close();
      plugin.disable();
    });

    it('should generate valid spans (client side and server side)', async () => {
      const result = await httpRequest.get(
        `http://${hostname}:${serverPort}${pathname}`
      );
      const spans = audit.processSpans();
      const [incomingSpan, outgoingSpan] = spans;
      const validations = {
        hostname,
        httpStatusCode: result.statusCode!,
        httpMethod: result.method!,
        pathname,
        resHeaders: result.resHeaders,
        reqHeaders: result.reqHeaders,
      };

      assert.strictEqual(spans.length, 2);
      assertSpan(incomingSpan, SpanKind.SERVER, validations);
      assertSpan(outgoingSpan, SpanKind.CLIENT, validations);
    });

    const httpErrorCodes = [400, 401, 403, 404, 429, 501, 503, 504, 500];

    for (let i = 0; i < httpErrorCodes.length; i++) {
      it(`should test span for GET requests with http error ${httpErrorCodes[i]}`, async () => {
        const testPath = '/outgoing/rootSpan/1';

        doNock(
          hostname,
          testPath,
          httpErrorCodes[i],
          httpErrorCodes[i].toString()
        );

        const isReset = memoryExporter.getFinishedSpans().length === 0;
        assert.ok(isReset);
        await httpRequest
          .get(`${protocol}://${hostname}${testPath}`)
          .then(result => {
            const spans = memoryExporter.getFinishedSpans();
            const reqSpan = spans[0];

            assert.strictEqual(result.data, httpErrorCodes[i].toString());
            assert.strictEqual(spans.length, 1);

            const validations = {
              hostname,
              httpStatusCode: result.statusCode!,
              httpMethod: 'GET',
              pathname: testPath,
              resHeaders: result.resHeaders,
              reqHeaders: result.reqHeaders,
            };

            assertSpan(reqSpan, SpanKind.CLIENT, validations);
          });
      });
    }

    it('should create a child span for GET requests', done => {
      const testPath = '/outgoing/rootSpan/childs/1';
      doNock(hostname, testPath, 200, 'Ok');
      const name = 'TestRootSpan';
      const span = tracer.startSpan(name);
      return tracer.withSpan(span, () => {
        httpRequest
          .get(`${protocol}://${hostname}${testPath}`)
          .then(result => {
            span.end();
            const spans = memoryExporter.getFinishedSpans();
            const [reqSpan, localSpan] = spans;
            const validations = {
              hostname,
              httpStatusCode: result.statusCode!,
              httpMethod: 'GET',
              pathname: testPath,
              resHeaders: result.resHeaders,
              reqHeaders: result.reqHeaders,
            };

            assert.ok(localSpan.name.indexOf('TestRootSpan') >= 0);
            assert.strictEqual(spans.length, 2);
            assert.ok(reqSpan.name.indexOf(testPath) >= 0);
            assert.strictEqual(
              localSpan.spanContext.traceId,
              reqSpan.spanContext.traceId
            );
            assertSpan(reqSpan, SpanKind.CLIENT, validations);
            assert.notStrictEqual(
              localSpan.spanContext.spanId,
              reqSpan.spanContext.spanId
            );
            done();
          })
          .catch(done);
      });
    });

    for (let i = 0; i < httpErrorCodes.length; i++) {
      it(`should test a child spans for GET requests with http error ${httpErrorCodes[i]}`, done => {
        const testPath = '/outgoing/rootSpan/childs/1';
        doNock(
          hostname,
          testPath,
          httpErrorCodes[i],
          httpErrorCodes[i].toString()
        );
        const name = 'TestRootSpan';
        const span = tracer.startSpan(name);
        tracer.withSpan(span, () => {
          httpRequest
            .get(`${protocol}://${hostname}${testPath}`)
            .then(result => {
              span.end();
              const spans = memoryExporter.getFinishedSpans();
              const [reqSpan, localSpan] = spans;
              const validations = {
                hostname,
                httpStatusCode: result.statusCode!,
                httpMethod: 'GET',
                pathname: testPath,
                resHeaders: result.resHeaders,
                reqHeaders: result.reqHeaders,
              };

              assert.ok(localSpan.name.indexOf('TestRootSpan') >= 0);
              assert.strictEqual(spans.length, 2);
              assert.ok(reqSpan.name.indexOf(testPath) >= 0);
              assert.strictEqual(
                localSpan.spanContext.traceId,
                reqSpan.spanContext.traceId
              );
              assertSpan(reqSpan, SpanKind.CLIENT, validations);
              assert.notStrictEqual(
                localSpan.spanContext.spanId,
                reqSpan.spanContext.spanId
              );
              done();
            })
            .catch(done);
        });
      });
    }
    // TODO: uncomment once https://github.com/open-telemetry/opentelemetry-js/pull/146 is merged
    // it.only('should create multiple child spans for GET requests', async () => {
    //   const testPath = '/outgoing/rootSpan/childs';
    //   const num = 5;
    //   doNock(hostname, testPath, 200, 'Ok', num);
    //   const name = 'TestRootSpan';
    //   const span = tracer.startSpan(name);
    //   await tracer.withSpan(span, async () => {
    //     for (let i = 0; i < num; i++) {
    //       await httpRequest.get(`${ protocol }://${ hostname }${ testPath }`);
    //       const spans = memoryExporter.getFinishedSpans();
    //       assert.ok(spans[i].name.indexOf(testPath) >= 0);
    //       assert.strictEqual((span as Span).toReadableSpan().spanContext.traceId, spans[i].spanContext.traceId);
    //     }
    //     span.end();
    //     const spans = memoryExporter.getFinishedSpans();
    //     // 5 child spans ended + 1 span (root)
    //     assert.strictEqual(spans.length, 6);
    //   });
    //   console.log('end');
    // });

    for (const ignored of ['string', 'function', 'regexp']) {
      it(`should not trace ignored requests with type ${ignored}`, async () => {
        const testPath = `/ignored/${ignored}`;
        doNock(hostname, testPath, 200, 'Ok');

        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 0);
        await httpRequest.get(`${protocol}://${hostname}${testPath}`);
        assert.strictEqual(spans.length, 0);
      });
    }
  });
});

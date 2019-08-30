/**
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
import { SpanKind, Span } from '@opentelemetry/types';
import * as assert from 'assert';
import * as http from 'http';
import * as nock from 'nock';
import { HttpPlugin, plugin } from '../../src/http';
import { assertSpan } from '../utils/assertSpan';
import { DummyPropagation } from '../utils/DummyPropagation';
import { httpRequest } from '../utils/httpRequest';
import { TracerTest } from '../utils/TracerTest';
import { SpanAuditProcessor } from '../utils/SpanAuditProcessor';

let server: http.Server;
const serverPort = 12345;
const protocol = 'http';
const hostname = 'localhost';
const pathname = '/test';
const audit = new SpanAuditProcessor();

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

export const customAttributeFunction = (span: Span): void => {
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
    const tracer = new TracerTest(
      {
        scopeManager,
        logger,
        httpTextFormat,
      },
      audit
    );
    beforeEach(() => {
      audit.reset();
    });

    before(() => {
      plugin.enable(http, tracer, tracer.logger);
      const ignoreConfig = [
        `http://${hostname}:${serverPort}/ignored/string`,
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

    it('should generate valid spans (client side and server side)', done => {
      httpRequest
        .get(`http://${hostname}:${serverPort}${pathname}`)
        .then(result => {
          const spans = audit.processSpans();
          const outgoingSpan = spans[0];
          const incomingSpan = spans[1];

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
          done();
        });
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

        const isReset = audit.processSpans().length === 0;
        assert.ok(isReset);
        await httpRequest
          .get(`${protocol}://${hostname}${testPath}`)
          .then(result => {
            const spans = audit.processSpans();
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

            assertSpan(spans[0], SpanKind.CLIENT, validations);
          });
      });
    }

    it('should create a child span for GET requests', done => {
      const testPath = '/outgoing/rootSpan/childs/1';
      doNock(hostname, testPath, 200, 'Ok');
      const name = 'TestRootSpan';
      const span = tracer.startSpan(name);
      tracer.withSpan(span, () => {
        httpRequest.get(`${protocol}://${hostname}${testPath}`).then(result => {
          const spans = audit.processSpans();
          assert.ok(spans[0].name.indexOf('TestRootSpan') >= 0);
          assert.strictEqual(spans.length, 2);
          assert.ok(spans[1].name.indexOf(testPath) >= 0);
          assert.strictEqual(
            spans[1].spanContext.traceId,
            spans[0].spanContext.traceId
          );
          const validations = {
            hostname,
            httpStatusCode: result.statusCode!,
            httpMethod: 'GET',
            pathname: testPath,
            resHeaders: result.resHeaders,
            reqHeaders: result.reqHeaders,
          };
          assertSpan(spans[1], SpanKind.CLIENT, validations);
          assert.notStrictEqual(
            spans[1].spanContext.spanId,
            spans[0].spanContext.spanId
          );
          done();
        });
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
              const spans = audit.processSpans();
              assert.ok(spans[0].name.indexOf('TestRootSpan') >= 0);
              assert.strictEqual(spans.length, 2);
              assert.ok(spans[1].name.indexOf(testPath) >= 0);
              assert.strictEqual(
                spans[1].spanContext.traceId,
                spans[0].spanContext.traceId
              );
              const validations = {
                hostname,
                httpStatusCode: result.statusCode!,
                httpMethod: 'GET',
                pathname: testPath,
                resHeaders: result.resHeaders,
                reqHeaders: result.reqHeaders,
              };
              assertSpan(spans[1], SpanKind.CLIENT, validations);
              assert.notStrictEqual(
                spans[1].spanContext.spanId,
                spans[0].spanContext.spanId
              );
              done();
            });
        });
      });
    }
    // TODO: uncomment once https://github.com/open-telemetry/opentelemetry-js/pull/146 is merged
    // it('should create multiple child spans for GET requests', (done) => {
    //   const testPath = '/outgoing/rootSpan/childs';
    //   const num = 5;
    //   doNock(hostname, testPath, 200, 'Ok', num);
    //   const name = 'TestRootSpan';
    //   const span = tracer.startSpan(name);
    //   const auditedSpan = audit.processSpans()[0];
    //   assert.ok(auditedSpan.name.indexOf('TestRootSpan') >= 0);
    //   tracer.withSpan(span, async () => {
    //     for (let i = 0; i < num; i++) {
    //       await httpRequest.get(`${ protocol }://${ hostname }${ testPath }`).then(result => {
    //         const spans = audit.processSpans();
    //         const startChildIndex = i + 1;
    //         assert.strictEqual(spans.length, startChildIndex + 1);
    //         assert.ok(spans[startChildIndex].name.indexOf(testPath) >= 0);
    //         assert.strictEqual(auditedSpan.spanContext.traceId, spans[startChildIndex].spanContext.traceId);
    //       });
    //     }
    //     const spans = audit.processSpans();
    //     // 5 child spans ended + 1 span (root)
    //     assert.strictEqual(spans.length, 6);
    //     span.end();
    //     done();
    //   });
    // });

    for (const ignored of ['string', 'function', 'regexp']) {
      it(`should not trace ignored requests with type ${ignored}`, async () => {
        const testPath = `/ignored/${ignored}`;
        doNock(hostname, testPath, 200, 'Ok');

        const spans = audit.processSpans();
        assert.strictEqual(spans.length, 0);
        await httpRequest.get(`${protocol}://${hostname}${testPath}`);
        assert.strictEqual(spans.length, 0);
      });
    }
  });
});

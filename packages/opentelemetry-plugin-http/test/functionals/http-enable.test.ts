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

import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import { NoopLogger } from '@opentelemetry/core';
import { NodeTracerRegistry } from '@opentelemetry/node';
import { CanonicalCode, Span as ISpan, SpanKind } from '@opentelemetry/api';
import * as assert from 'assert';
import * as http from 'http';
import * as path from 'path';
import * as nock from 'nock';
import { HttpPlugin, plugin } from '../../src/http';
import { assertSpan } from '../utils/assertSpan';
import { DummyPropagation } from '../utils/DummyPropagation';
import { httpRequest } from '../utils/httpRequest';
import { OT_REQUEST_HEADER } from '../../src/utils';
import { HttpPluginConfig, Http } from '../../src/types';
import { AttributeNames } from '../../src/enums/AttributeNames';

const applyCustomAttributesOnSpanErrorMessage =
  'bad applyCustomAttributesOnSpan function';

let server: http.Server;
const serverPort = 22345;
const protocol = 'http';
const hostname = 'localhost';
const pathname = '/test';
const serverName = 'my.server.name';
const memoryExporter = new InMemorySpanExporter();
const httpTextFormat = new DummyPropagation();
const logger = new NoopLogger();
const registry = new NodeTracerRegistry({
  logger,
  httpTextFormat,
});
registry.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));

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

  it(`moduleName should be ${protocol}`, () => {
    assert.strictEqual(protocol, plugin.moduleName);
  });

  describe('enable()', () => {
    describe('with bad plugin options', () => {
      let pluginWithBadOptions: HttpPlugin;
      beforeEach(() => {
        memoryExporter.reset();
      });

      before(() => {
        const config: HttpPluginConfig = {
          ignoreIncomingPaths: [
            (url: string) => {
              throw new Error('bad ignoreIncomingPaths function');
            },
          ],
          ignoreOutgoingUrls: [
            (url: string) => {
              throw new Error('bad ignoreOutgoingUrls function');
            },
          ],
          applyCustomAttributesOnSpan: () => {
            throw new Error(applyCustomAttributesOnSpanErrorMessage);
          },
        };
        pluginWithBadOptions = new HttpPlugin(
          plugin.component,
          process.versions.node
        );
        pluginWithBadOptions.enable(http, registry, registry.logger, config);
        server = http.createServer((request, response) => {
          response.end('Test Server Response');
        });

        server.listen(serverPort);
      });

      after(() => {
        server.close();
        pluginWithBadOptions.disable();
      });

      it('should generate valid spans (client side and server side)', async () => {
        const result = await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`
        );
        const spans = memoryExporter.getFinishedSpans();
        const [incomingSpan, outgoingSpan] = spans;
        const validations = {
          hostname,
          httpStatusCode: result.statusCode!,
          httpMethod: result.method!,
          pathname,
          resHeaders: result.resHeaders,
          reqHeaders: result.reqHeaders,
          component: plugin.component,
        };

        assert.strictEqual(spans.length, 2);
        assertSpan(incomingSpan, SpanKind.SERVER, validations);
        assertSpan(outgoingSpan, SpanKind.CLIENT, validations);
        assert.strictEqual(
          incomingSpan.attributes[AttributeNames.NET_HOST_PORT],
          serverPort
        );
        assert.strictEqual(
          outgoingSpan.attributes[AttributeNames.NET_PEER_PORT],
          serverPort
        );
      });

      it(`should not trace requests with '${OT_REQUEST_HEADER}' header`, async () => {
        const testPath = '/outgoing/do-not-trace';
        doNock(hostname, testPath, 200, 'Ok');

        const options = {
          host: hostname,
          path: testPath,
          headers: { [OT_REQUEST_HEADER]: 1 },
        };

        const result = await httpRequest.get(options);
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(result.data, 'Ok');
        assert.strictEqual(spans.length, 0);
      });
    });
    describe('with good plugin options', () => {
      beforeEach(() => {
        memoryExporter.reset();
      });

      before(() => {
        const config: HttpPluginConfig = {
          ignoreIncomingPaths: [
            `/ignored/string`,
            /\/ignored\/regexp$/i,
            (url: string) => url.endsWith(`/ignored/function`),
          ],
          ignoreOutgoingUrls: [
            `${protocol}://${hostname}:${serverPort}/ignored/string`,
            /\/ignored\/regexp$/i,
            (url: string) => url.endsWith(`/ignored/function`),
          ],
          applyCustomAttributesOnSpan: customAttributeFunction,
          serverName,
        };
        plugin.enable(http, registry, registry.logger, config);
        server = http.createServer((request, response) => {
          response.end('Test Server Response');
        });

        server.listen(serverPort);
      });

      after(() => {
        server.close();
        plugin.disable();
      });

      it(`${protocol} module should be patched`, () => {
        assert.strictEqual(http.Server.prototype.emit.__wrapped, true);
      });

      it(`should not patch if it's not a ${protocol} module`, () => {
        const httpNotPatched = new HttpPlugin(
          plugin.component,
          process.versions.node
        ).enable({} as Http, registry, registry.logger, {});
        assert.strictEqual(Object.keys(httpNotPatched).length, 0);
      });

      it('should generate valid spans (client side and server side)', async () => {
        const result = await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`,
          {
            headers: {
              'x-forwarded-for': '<client>, <proxy1>, <proxy2>',
              'user-agent': 'chrome',
            },
          }
        );
        const spans = memoryExporter.getFinishedSpans();
        const [incomingSpan, outgoingSpan] = spans;
        const validations = {
          hostname,
          httpStatusCode: result.statusCode!,
          httpMethod: result.method!,
          pathname,
          resHeaders: result.resHeaders,
          reqHeaders: result.reqHeaders,
          component: plugin.component,
          serverName,
        };

        assert.strictEqual(spans.length, 2);
        assert.strictEqual(
          incomingSpan.attributes[AttributeNames.HTTP_CLIENT_IP],
          '<client>'
        );
        assert.strictEqual(
          incomingSpan.attributes[AttributeNames.NET_HOST_PORT],
          serverPort
        );
        assert.strictEqual(
          outgoingSpan.attributes[AttributeNames.NET_PEER_PORT],
          serverPort
        );
        [
          { span: incomingSpan, kind: SpanKind.SERVER },
          { span: outgoingSpan, kind: SpanKind.CLIENT },
        ].forEach(({ span, kind }) => {
          assert.strictEqual(
            span.attributes[AttributeNames.HTTP_FLAVOR],
            '1.1'
          );
          assert.strictEqual(
            span.attributes[AttributeNames.NET_TRANSPORT],
            AttributeNames.IP_TCP
          );
          assertSpan(span, kind, validations);
        });
      });

      it(`should not trace requests with '${OT_REQUEST_HEADER}' header`, async () => {
        const testPath = '/outgoing/do-not-trace';
        doNock(hostname, testPath, 200, 'Ok');

        const options = {
          host: hostname,
          path: testPath,
          headers: { [OT_REQUEST_HEADER]: 1 },
        };

        const result = await httpRequest.get(options);
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(result.data, 'Ok');
        assert.strictEqual(spans.length, 0);
      });

      const httpErrorCodes = [
        400,
        401,
        403,
        404,
        429,
        501,
        503,
        504,
        500,
        505,
        597,
      ];

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

          const result = await httpRequest.get(
            `${protocol}://${hostname}${testPath}`
          );
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
            component: plugin.component,
          };

          assertSpan(reqSpan, SpanKind.CLIENT, validations);
        });
      }

      it('should create a child span for GET requests', async () => {
        const testPath = '/outgoing/rootSpan/childs/1';
        doNock(hostname, testPath, 200, 'Ok');
        const name = 'TestRootSpan';
        const span = registry.getTracer('default').startSpan(name);
        return registry.getTracer('default').withSpan(span, async () => {
          const result = await httpRequest.get(
            `${protocol}://${hostname}${testPath}`
          );
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
            component: plugin.component,
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
        });
      });

      for (let i = 0; i < httpErrorCodes.length; i++) {
        it(`should test child spans for GET requests with http error ${httpErrorCodes[i]}`, async () => {
          const testPath = '/outgoing/rootSpan/childs/1';
          doNock(
            hostname,
            testPath,
            httpErrorCodes[i],
            httpErrorCodes[i].toString()
          );
          const name = 'TestRootSpan';
          const span = registry.getTracer('default').startSpan(name);
          return registry.getTracer('default').withSpan(span, async () => {
            const result = await httpRequest.get(
              `${protocol}://${hostname}${testPath}`
            );
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
              component: plugin.component,
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
          });
        });
      }

      it('should create multiple child spans for GET requests', async () => {
        const testPath = '/outgoing/rootSpan/childs';
        const num = 5;
        doNock(hostname, testPath, 200, 'Ok', num);
        const name = 'TestRootSpan';
        const span = registry.getTracer('default').startSpan(name);
        await registry.getTracer('default').withSpan(span, async () => {
          for (let i = 0; i < num; i++) {
            await httpRequest.get(`${protocol}://${hostname}${testPath}`);
            const spans = memoryExporter.getFinishedSpans();
            assert.ok(spans[i].name.indexOf(testPath) >= 0);
            assert.strictEqual(
              span.context().traceId,
              spans[i].spanContext.traceId
            );
          }
          span.end();
          const spans = memoryExporter.getFinishedSpans();
          // 5 child spans ended + 1 span (root)
          assert.strictEqual(spans.length, 6);
        });
      });

      for (const ignored of ['string', 'function', 'regexp']) {
        it(`should not trace ignored requests (client and server side) with type ${ignored}`, async () => {
          const testPath = `/ignored/${ignored}`;

          await httpRequest.get(
            `${protocol}://${hostname}:${serverPort}${testPath}`
          );
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 0);
        });
      }

      for (const arg of ['string', {}, new Date()]) {
        it(`should be tracable and not throw exception in ${protocol} plugin when passing the following argument ${JSON.stringify(
          arg
        )}`, async () => {
          try {
            await httpRequest.get(arg);
          } catch (error) {
            // request has been made
            // nock throw
            assert.ok(error.message.startsWith('Nock: No match for request'));
          }
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
        });
      }

      for (const arg of [true, 1, false, 0, '']) {
        it(`should not throw exception in ${protocol} plugin when passing the following argument ${JSON.stringify(
          arg
        )}`, async () => {
          try {
            // @ts-ignore
            await httpRequest.get(arg);
          } catch (error) {
            // request has been made
            // nock throw
            assert.ok(
              error.stack.indexOf(
                path.normalize('/node_modules/nock/lib/intercept.js')
              ) > 0
            );
          }
          const spans = memoryExporter.getFinishedSpans();
          // for this arg with don't provide trace. We pass arg to original method (http.get)
          assert.strictEqual(spans.length, 0);
        });
      }

      it('should have 1 ended span when request throw on bad "options" object', () => {
        try {
          http.request({ protocol: 'telnet' });
        } catch (error) {
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
        }
      });

      it('should have 1 ended span when response.end throw an exception', async () => {
        const testPath = '/outgoing/rootSpan/childs/1';
        doNock(hostname, testPath, 400, 'Not Ok');

        const promiseRequest = new Promise((resolve, reject) => {
          const req = http.request(
            `${protocol}://${hostname}${testPath}`,
            (resp: http.IncomingMessage) => {
              let data = '';
              resp.on('data', chunk => {
                data += chunk;
              });
              resp.on('end', () => {
                reject(new Error(data));
              });
            }
          );
          return req.end();
        });

        try {
          await promiseRequest;
          assert.fail();
        } catch (error) {
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
        }
      });

      it('should have 1 ended span when request throw on bad "options" object', () => {
        nock.cleanAll();
        nock.enableNetConnect();
        try {
          http.request({ protocol: 'telnet' });
          assert.fail();
        } catch (error) {
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
        }
      });

      it('should have 1 ended span when response.end throw an exception', async () => {
        const testPath = '/outgoing/rootSpan/childs/1';
        doNock(hostname, testPath, 400, 'Not Ok');

        const promiseRequest = new Promise((resolve, reject) => {
          const req = http.request(
            `${protocol}://${hostname}${testPath}`,
            (resp: http.IncomingMessage) => {
              let data = '';
              resp.on('data', chunk => {
                data += chunk;
              });
              resp.on('end', () => {
                reject(new Error(data));
              });
            }
          );
          return req.end();
        });

        try {
          await promiseRequest;
          assert.fail();
        } catch (error) {
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
        }
      });

      it('should have 1 ended span when request is aborted', async () => {
        nock(`${protocol}://my.server.com`)
          .get('/')
          .socketDelay(50)
          .reply(200, '<html></html>');

        const promiseRequest = new Promise((resolve, reject) => {
          const req = http.request(
            `${protocol}://my.server.com`,
            (resp: http.IncomingMessage) => {
              let data = '';
              resp.on('data', chunk => {
                data += chunk;
              });
              resp.on('end', () => {
                resolve(data);
              });
            }
          );
          req.setTimeout(10, () => {
            req.abort();
            reject('timeout');
          });
          return req.end();
        });

        try {
          await promiseRequest;
          assert.fail();
        } catch (error) {
          const spans = memoryExporter.getFinishedSpans();
          const [span] = spans;
          assert.strictEqual(spans.length, 1);
          assert.strictEqual(span.status.code, CanonicalCode.ABORTED);
          assert.ok(Object.keys(span.attributes).length >= 6);
        }
      });

      it('should have 1 ended span when request is aborted after receiving response', async () => {
        nock(`${protocol}://my.server.com`)
          .get('/')
          .delay({
            body: 50,
          })
          .replyWithFile(200, `${process.cwd()}/package.json`);

        const promiseRequest = new Promise((resolve, reject) => {
          const req = http.request(
            `${protocol}://my.server.com`,
            (resp: http.IncomingMessage) => {
              let data = '';
              resp.on('data', chunk => {
                req.abort();
                data += chunk;
              });
              resp.on('end', () => {
                resolve(data);
              });
            }
          );

          return req.end();
        });

        try {
          await promiseRequest;
          assert.fail();
        } catch (error) {
          const spans = memoryExporter.getFinishedSpans();
          const [span] = spans;
          assert.strictEqual(spans.length, 1);
          assert.strictEqual(span.status.code, CanonicalCode.ABORTED);
          assert.ok(Object.keys(span.attributes).length > 7);
        }
      });

      it("should have 1 ended span when request doesn't listening response", done => {
        nock.cleanAll();
        nock.enableNetConnect();
        const req = http.request(`${protocol}://${hostname}/`);
        req.on('close', () => {
          const spans = memoryExporter.getFinishedSpans();
          const [span] = spans;
          assert.strictEqual(spans.length, 1);
          assert.ok(Object.keys(span.attributes).length > 6);
          done();
        });
        req.end();
      });

      it("should have 1 ended span when response is listened by using req.on('response')", done => {
        const host = `${protocol}://${hostname}`;
        nock(host)
          .get('/')
          .reply(404);
        const req = http.request(`${host}/`);
        req.on('response', response => {
          response.on('data', () => {});
          response.on('end', () => {
            const spans = memoryExporter.getFinishedSpans();
            const [span] = spans;
            assert.strictEqual(spans.length, 1);
            assert.ok(Object.keys(span.attributes).length > 6);
            assert.strictEqual(
              span.attributes[AttributeNames.HTTP_STATUS_CODE],
              404
            );
            assert.strictEqual(span.status.code, CanonicalCode.NOT_FOUND);
            done();
          });
        });
        req.end();
      });
    });
  });
});

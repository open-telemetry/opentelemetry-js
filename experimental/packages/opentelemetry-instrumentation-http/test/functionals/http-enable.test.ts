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
import {
  SpanStatusCode,
  context,
  diag,
  propagation,
  Span as ISpan,
  SpanKind,
  trace,
  Attributes,
  DiagConsoleLogger,
  INVALID_SPAN_CONTEXT,
} from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {
  ATTR_CLIENT_ADDRESS,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_NETWORK_PEER_ADDRESS,
  ATTR_NETWORK_PEER_PORT,
  ATTR_NETWORK_PROTOCOL_VERSION,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_FULL,
  ATTR_URL_PATH,
  ATTR_URL_SCHEME,
  HTTP_REQUEST_METHOD_VALUE_GET,
} from '@opentelemetry/semantic-conventions';
import {
  ATTR_HTTP_CLIENT_IP,
  ATTR_HTTP_FLAVOR,
  ATTR_HTTP_HOST,
  ATTR_HTTP_METHOD,
  ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
  ATTR_HTTP_SCHEME,
  ATTR_HTTP_STATUS_CODE,
  ATTR_HTTP_TARGET,
  ATTR_HTTP_URL,
  ATTR_NET_HOST_IP,
  ATTR_NET_HOST_NAME,
  ATTR_NET_HOST_PORT,
  ATTR_NET_PEER_IP,
  ATTR_NET_PEER_NAME,
  ATTR_NET_PEER_PORT,
  ATTR_NET_TRANSPORT,
  NET_TRANSPORT_VALUE_IP_TCP,
} from '../../src/semconv';
import * as assert from 'assert';
import * as nock from 'nock';
import * as path from 'path';
import { HttpInstrumentation } from '../../src/http';
import { HttpInstrumentationConfig } from '../../src/types';
import { assertSpan } from '../utils/assertSpan';
import { DummyPropagation } from '../utils/DummyPropagation';
import { httpRequest } from '../utils/httpRequest';
import { ContextManager } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import type {
  ClientRequest,
  IncomingMessage,
  ServerResponse,
  RequestOptions,
  OutgoingHttpHeaders,
} from 'http';
import { isWrapped, SemconvStability } from '@opentelemetry/instrumentation';
import { getRPCMetadata, RPCType } from '@opentelemetry/core';

const instrumentation = new HttpInstrumentation();
instrumentation.enable();
instrumentation.disable();

import * as http from 'http';
import { AttributeNames } from '../../src/enums/AttributeNames';
import { getRemoteClientAddress } from '../../src/utils';

const applyCustomAttributesOnSpanErrorMessage =
  'bad applyCustomAttributesOnSpan function';

let server: http.Server;
const serverPort = 22346;
const protocol = 'http';
const hostname = 'localhost';
const pathname = '/test';
const serverName = 'my.server.name';
const memoryExporter = new InMemorySpanExporter();
const provider = new NodeTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(memoryExporter)],
});
instrumentation.setTracerProvider(provider);

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

export const requestHookFunction = (
  span: ISpan,
  request: ClientRequest | IncomingMessage
): void => {
  span.setAttribute('custom request hook attribute', 'request');
};

export const responseHookFunction = (
  span: ISpan,
  response: IncomingMessage | ServerResponse
): void => {
  span.setAttribute('custom response hook attribute', 'response');
  // IncomingMessage (Readable) 'end'.
  response.on('end', () => {
    span.setAttribute('custom incoming message attribute', 'end');
  });
  // ServerResponse (writable) 'finish'.
  response.on('finish', () => {
    span.setAttribute('custom server response attribute', 'finish');
  });
};

export const startIncomingSpanHookFunction = (
  request: IncomingMessage
): Attributes => {
  return { guid: request.headers?.guid };
};

export const startOutgoingSpanHookFunction = (
  request: RequestOptions
): Attributes => {
  const headers = request.headers as OutgoingHttpHeaders | undefined;
  return { guid: headers?.guid };
};

describe('HttpInstrumentation', () => {
  let contextManager: ContextManager;

  before(() => {
    propagation.setGlobalPropagator(new DummyPropagation());
  });

  after(() => {
    propagation.disable();
  });

  beforeEach(() => {
    contextManager = new AsyncHooksContextManager().enable();
    context.setGlobalContextManager(contextManager);
  });

  afterEach(() => {
    context.disable();
  });

  describe('enable()', () => {
    describe('with bad instrumentation options', () => {
      beforeEach(() => {
        memoryExporter.reset();
      });

      before(async () => {
        const config: HttpInstrumentationConfig = {
          ignoreIncomingRequestHook: _request => {
            throw new Error('bad ignoreIncomingRequestHook function');
          },
          ignoreOutgoingRequestHook: _request => {
            throw new Error('bad ignoreOutgoingRequestHook function');
          },
          applyCustomAttributesOnSpan: () => {
            throw new Error(applyCustomAttributesOnSpanErrorMessage);
          },
        };
        instrumentation.setConfig(config);
        instrumentation.enable();
        server = http.createServer((request, response) => {
          response.end('Test Server Response');
        });

        await new Promise<void>(resolve => server.listen(serverPort, resolve));
      });

      after(() => {
        server.close();
        instrumentation.disable();
      });

      it('should generate valid spans (client side and server side)', async () => {
        const result = await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`,
          {
            headers: {
              'user-agent': 'tester',
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
          component: 'http',
        };

        assert.strictEqual(spans.length, 2);
        assertSpan(incomingSpan, SpanKind.SERVER, validations);
        assertSpan(outgoingSpan, SpanKind.CLIENT, validations);
        assert.strictEqual(
          incomingSpan.attributes[ATTR_NET_HOST_PORT],
          serverPort
        );
        assert.strictEqual(
          outgoingSpan.attributes[ATTR_NET_PEER_PORT],
          serverPort
        );
      });

      it('should redact auth from the `http.url` attribute (client side and server side)', async () => {
        await httpRequest.get(
          `${protocol}://user:pass@${hostname}:${serverPort}${pathname}`
        );
        const spans = memoryExporter.getFinishedSpans();
        const [incomingSpan, outgoingSpan] = spans;
        assert.strictEqual(spans.length, 2);
        assert.strictEqual(incomingSpan.kind, SpanKind.SERVER);
        assert.strictEqual(outgoingSpan.kind, SpanKind.CLIENT);
        assert.strictEqual(
          incomingSpan.attributes[ATTR_HTTP_URL],
          `${protocol}://${hostname}:${serverPort}${pathname}`
        );
        assert.strictEqual(
          outgoingSpan.attributes[ATTR_HTTP_URL],
          `${protocol}://REDACTED:REDACTED@${hostname}:${serverPort}${pathname}`
        );
      });
    });

    describe('partially disable instrumentation', () => {
      beforeEach(() => {
        memoryExporter.reset();
      });

      afterEach(() => {
        server.close();
        instrumentation.disable();
      });

      it('allows to disable outgoing request instrumentation', async () => {
        server.close();
        instrumentation.disable();

        instrumentation.setConfig({
          disableOutgoingRequestInstrumentation: true,
        });
        instrumentation.enable();
        server = http.createServer((_request, response) => {
          response.end('Test Server Response');
        });

        await new Promise<void>(resolve => server.listen(serverPort, resolve));

        assert.strictEqual(isWrapped(http.Server.prototype.emit), true);
        assert.strictEqual(isWrapped(http.get), false);
        assert.strictEqual(isWrapped(http.request), false);
      });

      it('allows to disable incoming request instrumentation', async () => {
        server.close();
        instrumentation.disable();

        instrumentation.setConfig({
          disableIncomingRequestInstrumentation: true,
        });
        instrumentation.enable();
        server = http.createServer((_request, response) => {
          response.end('Test Server Response');
        });

        await new Promise<void>(resolve => server.listen(serverPort, resolve));

        assert.strictEqual(isWrapped(http.Server.prototype.emit), false);
        assert.strictEqual(isWrapped(http.get), true);
        assert.strictEqual(isWrapped(http.request), true);
      });
    });

    describe('with good instrumentation options', () => {
      beforeEach(() => {
        memoryExporter.reset();
      });

      before(async () => {
        instrumentation.setConfig({
          ignoreIncomingRequestHook: request => {
            return (
              request.headers['user-agent']?.match('ignored-string') != null
            );
          },
          ignoreOutgoingRequestHook: request => {
            const headers = request.headers as OutgoingHttpHeaders | undefined;
            if (headers?.['user-agent'] != null) {
              return `${headers['user-agent']}`.match('ignored-string') != null;
            }
            return false;
          },
          applyCustomAttributesOnSpan: customAttributeFunction,
          requestHook: requestHookFunction,
          responseHook: responseHookFunction,
          startIncomingSpanHook: startIncomingSpanHookFunction,
          startOutgoingSpanHook: startOutgoingSpanHookFunction,
          serverName,
        });
        instrumentation.enable();
        server = http.createServer((request, response) => {
          if (request.url?.includes('/premature-close')) {
            response.destroy();
            return;
          }
          if (request.url?.includes('/hang')) {
            // write response headers.
            response.write('');
            // hang the request.
            return;
          }
          if (request.url?.includes('/destroy-request')) {
            // force flush http response header to trigger client response callback
            response.write('');
            setTimeout(() => {
              request.socket.destroy();
            }, 100);
            return;
          }
          if (request.url?.includes('/ignored')) {
            provider.getTracer('test').startSpan('some-span').end();
          }
          if (request.url?.includes('/setroute')) {
            const rpcData = getRPCMetadata(context.active());
            assert.ok(rpcData != null);
            assert.strictEqual(rpcData.type, RPCType.HTTP);
            assert.strictEqual(rpcData.route, undefined);
            rpcData.route = 'TheRoute';
          }
          if (request.url?.includes('/login')) {
            assert.strictEqual(
              request.headers.authorization,
              'Basic ' + Buffer.from('username:password').toString('base64')
            );
          }
          if (request.url?.includes('/withQuery')) {
            assert.match(request.url, /withQuery\?foo=bar$/);
          }
          response.end('Test Server Response');
        });

        await new Promise<void>(resolve => server.listen(serverPort, resolve));
      });

      after(() => {
        server.close();
        instrumentation.disable();
      });

      it(`${protocol} module should be patched`, () => {
        assert.strictEqual(isWrapped(http.Server.prototype.emit), true);
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
          component: 'http',
          serverName,
        };

        assert.strictEqual(spans.length, 2);
        assert.strictEqual(
          incomingSpan.attributes[ATTR_HTTP_CLIENT_IP],
          '<client>'
        );
        assert.strictEqual(
          incomingSpan.attributes[ATTR_NET_HOST_PORT],
          serverPort
        );
        assert.strictEqual(
          outgoingSpan.attributes[ATTR_NET_PEER_PORT],
          serverPort
        );
        [
          { span: incomingSpan, kind: SpanKind.SERVER },
          { span: outgoingSpan, kind: SpanKind.CLIENT },
        ].forEach(({ span, kind }) => {
          assert.strictEqual(span.attributes[ATTR_HTTP_FLAVOR], '1.1');
          assert.strictEqual(
            span.attributes[ATTR_NET_TRANSPORT],
            NET_TRANSPORT_VALUE_IP_TCP
          );
          assertSpan(span, kind, validations);
        });
      });

      it('should respect HTTP_ROUTE', async () => {
        await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}/setroute`
        );
        const span = memoryExporter.getFinishedSpans()[0];

        assert.strictEqual(span.kind, SpanKind.SERVER);
        assert.strictEqual(span.attributes[ATTR_HTTP_ROUTE], 'TheRoute');
        assert.strictEqual(span.name, 'GET TheRoute');
      });

      const httpErrorCodes = [
        400, 401, 403, 404, 429, 501, 503, 504, 500, 505, 597,
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
            component: 'http',
          };

          assertSpan(reqSpan, SpanKind.CLIENT, validations);
        });
      }

      it('should create a child span for GET requests', async () => {
        const testPath = '/outgoing/rootSpan/childs/1';
        doNock(hostname, testPath, 200, 'Ok');
        const name = 'TestRootSpan';
        const span = provider.getTracer('default').startSpan(name);
        return context.with(trace.setSpan(context.active(), span), async () => {
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
            component: 'http',
          };

          assert.ok(localSpan.name.indexOf('TestRootSpan') >= 0);
          assert.strictEqual(spans.length, 2);
          assert.strictEqual(reqSpan.name, 'GET');
          assert.strictEqual(
            localSpan.spanContext().traceId,
            reqSpan.spanContext().traceId
          );
          assertSpan(reqSpan, SpanKind.CLIENT, validations);
          assert.notStrictEqual(
            localSpan.spanContext().spanId,
            reqSpan.spanContext().spanId
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
          const span = provider.getTracer('default').startSpan(name);
          return context.with(
            trace.setSpan(context.active(), span),
            async () => {
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
                component: 'http',
              };

              assert.ok(localSpan.name.indexOf('TestRootSpan') >= 0);
              assert.strictEqual(spans.length, 2);
              assert.strictEqual(reqSpan.name, 'GET');
              assert.strictEqual(
                localSpan.spanContext().traceId,
                reqSpan.spanContext().traceId
              );
              assertSpan(reqSpan, SpanKind.CLIENT, validations);
              assert.notStrictEqual(
                localSpan.spanContext().spanId,
                reqSpan.spanContext().spanId
              );
            }
          );
        });
      }

      it('should create multiple child spans for GET requests', async () => {
        const testPath = '/outgoing/rootSpan/childs';
        const num = 5;
        doNock(hostname, testPath, 200, 'Ok', num);
        const name = 'TestRootSpan';
        const span = provider.getTracer('default').startSpan(name);
        await context.with(trace.setSpan(context.active(), span), async () => {
          for (let i = 0; i < num; i++) {
            await httpRequest.get(`${protocol}://${hostname}${testPath}`);
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans[i].name, 'GET');
            assert.strictEqual(
              span.spanContext().traceId,
              spans[i].spanContext().traceId
            );
          }
          span.end();
          const spans = memoryExporter.getFinishedSpans();
          // 5 child spans ended + 1 span (root)
          assert.strictEqual(spans.length, 6);
        });
      });

      it('should not trace ignored requests when ignore hook returns true', async () => {
        const testValue = 'ignored-string';

        await Promise.all([
          httpRequest.get(`${protocol}://${hostname}:${serverPort}`, {
            headers: {
              'user-agent': testValue,
            },
          }),
        ]);
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 0);
      });

      it('should trace requests when ignore hook returns false', async () => {
        await httpRequest.get(`${protocol}://${hostname}:${serverPort}`, {
          headers: {
            'user-agent': 'test-bot',
          },
        });
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 2);
      });

      for (const arg of [{}, new Date()]) {
        it(`should be traceable and not throw exception in ${protocol} instrumentation when passing the following argument ${JSON.stringify(
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
        it(`should not throw exception in ${protocol} instrumentation when passing the following argument ${JSON.stringify(
          arg
        )}`, async () => {
          try {
            await httpRequest.get(arg as any);
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
        assert.throws(
          () => http.request({ headers: { cookie: undefined } }),
          (err: unknown) => {
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans.length, 1);

            assert.ok(err instanceof Error);

            const validations = {
              httpStatusCode: undefined,
              httpMethod: 'GET',
              resHeaders: {},
              hostname: 'localhost',
              pathname: '/',
              forceStatus: {
                code: SpanStatusCode.ERROR,
                message: err.message,
              },
              component: 'http',
              noNetPeer: true,
              error: err,
            };
            assertSpan(spans[0], SpanKind.CLIENT, validations);
            return true;
          }
        );
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
          .delayConnection(50)
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
            req.destroy();
          });
          // Instrumentation should not swallow error event.
          assert.strictEqual(req.listeners('error').length, 0);
          req.on('error', err => {
            reject(err);
          });
          return req.end();
        });

        await assert.rejects(promiseRequest, /Error: socket hang up/);
        const spans = memoryExporter.getFinishedSpans();
        const [span] = spans;
        assert.strictEqual(spans.length, 1);
        assert.strictEqual(span.status.code, SpanStatusCode.ERROR);
        assert.ok(Object.keys(span.attributes).length >= 6);
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
                req.destroy(Error('request destroyed'));
                data += chunk;
              });
              resp.on('end', () => {
                resolve(data);
              });
            }
          );
          // Instrumentation should not swallow error event.
          assert.strictEqual(req.listeners('error').length, 0);
          req.on('error', err => {
            reject(err);
          });

          return req.end();
        });

        await assert.rejects(promiseRequest, /Error: request destroyed/);
        const spans = memoryExporter.getFinishedSpans();
        const [span] = spans;
        assert.strictEqual(spans.length, 1);
        assert.strictEqual(span.status.code, SpanStatusCode.ERROR);
        assert.ok(Object.keys(span.attributes).length > 7);
      });

      it("should have 1 ended client span when request doesn't listening response", done => {
        // nock doesn't emit close event.
        nock.cleanAll();
        nock.enableNetConnect();

        const req = http.request(`${protocol}://${hostname}:${serverPort}/`);
        req.on('close', () => {
          const spans = memoryExporter
            .getFinishedSpans()
            .filter(it => it.kind === SpanKind.CLIENT);
          assert.strictEqual(spans.length, 1);
          const [span] = spans;
          assert.ok(Object.keys(span.attributes).length > 6);
          done();
        });
        req.end();
      });

      it("should have 1 ended span when response is listened by using req.on('response')", done => {
        const host = `${protocol}://${hostname}`;
        nock(host).get('/').reply(404);
        const req = http.request(`${host}/`);
        req.on('response', response => {
          response.on('data', () => {});
          response.on('end', () => {
            const spans = memoryExporter.getFinishedSpans();
            const [span] = spans;
            assert.strictEqual(spans.length, 1);
            assert.ok(Object.keys(span.attributes).length > 6);
            assert.strictEqual(span.attributes[ATTR_HTTP_STATUS_CODE], 404);
            assert.strictEqual(span.status.code, SpanStatusCode.ERROR);
            done();
          });
        });
        req.end();
      });

      it('custom attributes should show up on client and server spans', async () => {
        await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`,
          { headers: { guid: 'user_guid' } }
        );
        const spans = memoryExporter.getFinishedSpans();
        const [incomingSpan, outgoingSpan] = spans;

        // server request
        assert.strictEqual(
          incomingSpan.attributes['custom request hook attribute'],
          'request'
        );
        assert.strictEqual(
          incomingSpan.attributes['custom response hook attribute'],
          'response'
        );
        assert.strictEqual(
          incomingSpan.attributes['custom server response attribute'],
          'finish'
        );
        assert.strictEqual(incomingSpan.attributes['guid'], 'user_guid');
        assert.strictEqual(
          incomingSpan.attributes['span kind'],
          SpanKind.CLIENT
        );

        // client request
        assert.strictEqual(
          outgoingSpan.attributes['custom request hook attribute'],
          'request'
        );
        assert.strictEqual(
          outgoingSpan.attributes['custom response hook attribute'],
          'response'
        );
        assert.strictEqual(
          outgoingSpan.attributes['custom incoming message attribute'],
          'end'
        );
        assert.strictEqual(outgoingSpan.attributes['guid'], 'user_guid');
        assert.strictEqual(
          outgoingSpan.attributes['span kind'],
          SpanKind.CLIENT
        );
      });

      it('should not set span as active in context for outgoing request', done => {
        assert.deepStrictEqual(trace.getSpan(context.active()), undefined);
        http.get(`${protocol}://${hostname}:${serverPort}/test`, res => {
          assert.deepStrictEqual(trace.getSpan(context.active()), undefined);

          res.on('data', () => {
            assert.deepStrictEqual(trace.getSpan(context.active()), undefined);
          });

          res.on('end', () => {
            assert.deepStrictEqual(trace.getSpan(context.active()), undefined);
            done();
          });
        });
      });

      it('should have 2 ended span when client prematurely close', async () => {
        const promise = new Promise<void>(resolve => {
          function waitForSpans() {
            const numSpans = memoryExporter.getFinishedSpans().length;

            if (numSpans < 2) {
              setTimeout(waitForSpans, 1);
            } else if (numSpans > 2) {
              throw new Error(`too many spans: ${numSpans}`);
            } else {
              resolve();
            }
          }

          const req = http.get(
            `${protocol}://${hostname}:${serverPort}/hang`,
            res => {
              res.on('close', waitForSpans);
              res.on('error', () => {});
              // Close the socket.
              req.destroy();
            }
          );

          req.on('error', () => {});
        });

        await promise;

        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 2);
        const [serverSpan, clientSpan] = spans.sort(
          (lhs, rhs) => lhs.kind - rhs.kind
        );
        assert.strictEqual(serverSpan.kind, SpanKind.SERVER);
        assert.ok(Object.keys(serverSpan.attributes).length >= 6);

        assert.strictEqual(clientSpan.kind, SpanKind.CLIENT);
        assert.ok(Object.keys(clientSpan.attributes).length >= 6);
      });

      it('should have 2 ended span when server prematurely close', async () => {
        const promise = new Promise<void>(resolve => {
          const req = http.get(
            `${protocol}://${hostname}:${serverPort}/premature-close`
          );
          req.on('error', err => {
            resolve();
          });
        });

        await promise;

        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 2);
        const [serverSpan, clientSpan] = spans.sort(
          (lhs, rhs) => lhs.kind - rhs.kind
        );
        assert.strictEqual(serverSpan.kind, SpanKind.SERVER);
        assert.ok(Object.keys(serverSpan.attributes).length >= 6);

        assert.strictEqual(clientSpan.kind, SpanKind.CLIENT);
        assert.strictEqual(clientSpan.status.code, SpanStatusCode.ERROR);
        assert.ok(Object.keys(clientSpan.attributes).length >= 6);
      });

      it('should not end span multiple times if request socket destroyed before response completes', async () => {
        const warnMessages: string[] = [];
        diag.setLogger({
          ...new DiagConsoleLogger(),
          warn: message => {
            warnMessages.push(message);
          },
        });
        const promise = new Promise<void>(resolve => {
          const req = http.request(
            `${protocol}://${hostname}:${serverPort}/destroy-request`,
            {
              // Allow `req.write()`.
              method: 'POST',
            },
            res => {
              res.on('end', () => {});
              res.on('close', () => {
                resolve();
              });
              res.on('error', () => {});
            }
          );
          // force flush http request header to trigger client response callback
          req.write('');
          req.on('error', () => {});
        });

        await promise;

        diag.disable();

        assert.deepStrictEqual(warnMessages, []);
      });

      it('should not throw with cyrillic characters in the request path', async () => {
        // see https://github.com/open-telemetry/opentelemetry-js/issues/5060
        await httpRequest.get(`${protocol}://${hostname}:${serverPort}/привет`);
      });

      it('should keep username and password in the request', async () => {
        await httpRequest.get(
          `${protocol}://username:password@${hostname}:${serverPort}/login`
        );
      });

      it('should keep query in the request', async () => {
        await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}/withQuery?foo=bar`
        );
      });

      it('using an invalid url does throw from client but still creates a span', async () => {
        try {
          await httpRequest.get(`http://instrumentation.test:string-as-port/`);
        } catch (e) {
          assert.match(e.message, /Invalid URL/);
        }

        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 1);
      });
    });

    describe('with semconv stability set to http', () => {
      beforeEach(() => {
        memoryExporter.reset();
      });

      before(async () => {
        instrumentation.setConfig({});
        instrumentation['_semconvStability'] = SemconvStability.STABLE;
        instrumentation.enable();
        server = http.createServer((request, response) => {
          if (request.url?.includes('/premature-close')) {
            response.destroy();
            return;
          }
          if (request.url?.includes('/hang')) {
            // write response headers.
            response.write('');
            // hang the request.
            return;
          }
          if (request.url?.includes('/destroy-request')) {
            // force flush http response header to trigger client response callback
            response.write('');
            setTimeout(() => {
              request.socket.destroy();
            }, 100);
            return;
          }
          if (request.url?.includes('/ignored')) {
            provider.getTracer('test').startSpan('some-span').end();
          }
          if (request.url?.includes('/setroute')) {
            const rpcData = getRPCMetadata(context.active());
            assert.ok(rpcData != null);
            assert.strictEqual(rpcData.type, RPCType.HTTP);
            assert.strictEqual(rpcData.route, undefined);
            rpcData.route = 'TheRoute';
          }
          response.setHeader('Content-Type', 'application/json');
          response.end(
            JSON.stringify({ address: getRemoteClientAddress(request) })
          );
        });

        await new Promise<void>(resolve => server.listen(serverPort, resolve));
      });

      after(() => {
        server.close();
        instrumentation.disable();
      });

      it('should generate semconv 1.27 client spans', async () => {
        const response = await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`
        );
        const spans = memoryExporter.getFinishedSpans();
        const [_, outgoingSpan] = spans;
        assert.strictEqual(spans.length, 2);

        // should have only required and recommended attributes for semconv 1.27
        assert.deepStrictEqual(outgoingSpan.attributes, {
          [ATTR_HTTP_REQUEST_METHOD]: HTTP_REQUEST_METHOD_VALUE_GET,
          [ATTR_SERVER_ADDRESS]: hostname,
          [ATTR_SERVER_PORT]: serverPort,
          [ATTR_URL_FULL]: `${protocol}://${hostname}:${serverPort}${pathname}`,
          [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
          [ATTR_NETWORK_PEER_ADDRESS]: response.address,
          [ATTR_NETWORK_PEER_PORT]: serverPort,
          [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
        });
      });

      it('should generate semconv 1.27 server spans', async () => {
        const response = await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`
        );
        const spans = memoryExporter.getFinishedSpans();
        const [incomingSpan, _] = spans;
        assert.strictEqual(spans.length, 2);

        const body = JSON.parse(response.data);

        // should have only required and recommended attributes for semconv 1.27
        assert.deepStrictEqual(incomingSpan.attributes, {
          [ATTR_CLIENT_ADDRESS]: body.address,
          [ATTR_HTTP_REQUEST_METHOD]: HTTP_REQUEST_METHOD_VALUE_GET,
          [ATTR_SERVER_ADDRESS]: hostname,
          [ATTR_SERVER_PORT]: serverPort,
          [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
          [ATTR_NETWORK_PEER_ADDRESS]: body.address,
          [ATTR_NETWORK_PEER_PORT]: response.clientRemotePort,
          [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
          [ATTR_URL_PATH]: pathname,
          [ATTR_URL_SCHEME]: protocol,
        });
      });

      it('should redact auth from the `url.full` attribute (client side and server side)', async () => {
        await httpRequest.get(
          `${protocol}://user:pass@${hostname}:${serverPort}${pathname}`
        );
        const spans = memoryExporter.getFinishedSpans();
        const [_, outgoingSpan] = spans;
        assert.strictEqual(spans.length, 2);
        assert.strictEqual(outgoingSpan.kind, SpanKind.CLIENT);
        assert.strictEqual(
          outgoingSpan.attributes[ATTR_URL_FULL],
          `${protocol}://REDACTED:REDACTED@${hostname}:${serverPort}${pathname}`
        );
      });

      it('should generate semconv 1.27 server spans with route when RPC metadata is available', async () => {
        const response = await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}/setroute`
        );
        const spans = memoryExporter.getFinishedSpans();
        const [incomingSpan, _] = spans;
        assert.strictEqual(spans.length, 2);

        const body = JSON.parse(response.data);

        // should have only required and recommended attributes for semconv 1.27
        assert.deepStrictEqual(incomingSpan.attributes, {
          [ATTR_CLIENT_ADDRESS]: body.address,
          [ATTR_HTTP_REQUEST_METHOD]: HTTP_REQUEST_METHOD_VALUE_GET,
          [ATTR_SERVER_ADDRESS]: hostname,
          [ATTR_HTTP_ROUTE]: 'TheRoute',
          [ATTR_SERVER_PORT]: serverPort,
          [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
          [ATTR_NETWORK_PEER_ADDRESS]: body.address,
          [ATTR_NETWORK_PEER_PORT]: response.clientRemotePort,
          [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
          [ATTR_URL_PATH]: `${pathname}/setroute`,
          [ATTR_URL_SCHEME]: protocol,
        });
      });

      it('should accept QUERY as a known HTTP req method', async () => {
        await new Promise<void>((resolve, reject) => {
          const req = http.request(
            `${protocol}://${hostname}:${serverPort}/hi`,
            {
              method: 'QUERY',
            },
            res => {
              res.resume();
              res.on('end', resolve);
              res.on('error', reject);
            }
          );
          req.on('error', reject);
          req.write('{}');
          req.end();
        });

        const spans = memoryExporter.getFinishedSpans();
        const clientSpan = spans.slice(-1)[0];
        assert.strictEqual(clientSpan.kind, SpanKind.CLIENT);
        assert.strictEqual(
          clientSpan.attributes[ATTR_HTTP_REQUEST_METHOD],
          'QUERY'
        );
      });
    });

    describe('with semconv stability set to http/dup', () => {
      beforeEach(() => {
        memoryExporter.reset();
        instrumentation.setConfig({});
      });

      before(async () => {
        instrumentation['_semconvStability'] = SemconvStability.DUPLICATE;
        instrumentation.enable();
        server = http.createServer((request, response) => {
          if (request.url?.includes('/setroute')) {
            const rpcData = getRPCMetadata(context.active());
            assert.ok(rpcData != null);
            assert.strictEqual(rpcData.type, RPCType.HTTP);
            assert.strictEqual(rpcData.route, undefined);
            rpcData.route = 'TheRoute';
          }
          response.setHeader('Content-Type', 'application/json');
          response.end(
            JSON.stringify({ address: getRemoteClientAddress(request) })
          );
        });

        await new Promise<void>(resolve => server.listen(serverPort, resolve));
      });

      after(() => {
        server.close();
        instrumentation.disable();
      });

      it('should create client spans with semconv 1.27 and old 1.7', async () => {
        const response = await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`
        );
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 2);
        const outgoingSpan = spans[1];

        // should have only required and recommended attributes for semconv 1.27
        assert.deepStrictEqual(outgoingSpan.attributes, {
          // 1.27 attributes
          [ATTR_HTTP_REQUEST_METHOD]: HTTP_REQUEST_METHOD_VALUE_GET,
          [ATTR_SERVER_ADDRESS]: hostname,
          [ATTR_SERVER_PORT]: serverPort,
          [ATTR_URL_FULL]: `http://${hostname}:${serverPort}${pathname}`,
          [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
          [ATTR_NETWORK_PEER_ADDRESS]: response.address,
          [ATTR_NETWORK_PEER_PORT]: serverPort,
          [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',

          // 1.7 attributes
          [ATTR_HTTP_FLAVOR]: '1.1',
          [ATTR_HTTP_HOST]: `${hostname}:${serverPort}`,
          [ATTR_HTTP_METHOD]: 'GET',
          [ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED]:
            response.data.length,
          [ATTR_HTTP_STATUS_CODE]: 200,
          [ATTR_HTTP_TARGET]: '/test',
          [ATTR_HTTP_URL]: `http://${hostname}:${serverPort}${pathname}`,
          [ATTR_NET_PEER_IP]: response.address,
          [ATTR_NET_PEER_NAME]: hostname,
          [ATTR_NET_PEER_PORT]: serverPort,
          [ATTR_NET_TRANSPORT]: 'ip_tcp',

          // unspecified old names
          [AttributeNames.HTTP_STATUS_TEXT]: 'OK',
        });
      });

      it('should create server spans with semconv 1.27 and old 1.7', async () => {
        const response = await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`
        );
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 2);
        const incomingSpan = spans[0];
        const body = JSON.parse(response.data);

        // should have only required and recommended attributes for semconv 1.27
        assert.deepStrictEqual(incomingSpan.attributes, {
          // 1.27 attributes
          [ATTR_CLIENT_ADDRESS]: body.address,
          [ATTR_HTTP_REQUEST_METHOD]: HTTP_REQUEST_METHOD_VALUE_GET,
          [ATTR_SERVER_ADDRESS]: hostname,
          [ATTR_SERVER_PORT]: serverPort,
          [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
          [ATTR_NETWORK_PEER_ADDRESS]: body.address,
          [ATTR_NETWORK_PEER_PORT]: response.clientRemotePort,
          [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
          [ATTR_URL_PATH]: pathname,
          [ATTR_URL_SCHEME]: protocol,

          // 1.7 attributes
          [ATTR_HTTP_FLAVOR]: '1.1',
          [ATTR_HTTP_HOST]: `${hostname}:${serverPort}`,
          [ATTR_HTTP_METHOD]: 'GET',
          [ATTR_HTTP_SCHEME]: protocol,
          [ATTR_HTTP_STATUS_CODE]: 200,
          [ATTR_HTTP_TARGET]: '/test',
          [ATTR_HTTP_URL]: `http://${hostname}:${serverPort}${pathname}`,
          [ATTR_NET_TRANSPORT]: 'ip_tcp',
          [ATTR_NET_HOST_IP]: body.address,
          [ATTR_NET_HOST_NAME]: hostname,
          [ATTR_NET_HOST_PORT]: serverPort,
          [ATTR_NET_PEER_IP]: body.address,
          [ATTR_NET_PEER_PORT]: response.clientRemotePort,

          // unspecified old names
          [AttributeNames.HTTP_STATUS_TEXT]: 'OK',
        });
      });

      it('should create server spans with semconv 1.27 and old 1.7 including http.route if RPC metadata is available', async () => {
        const response = await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}/setroute`
        );
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 2);
        const incomingSpan = spans[0];
        const body = JSON.parse(response.data);

        // should have only required and recommended attributes for semconv 1.27
        assert.deepStrictEqual(incomingSpan.attributes, {
          // 1.27 attributes
          [ATTR_CLIENT_ADDRESS]: body.address,
          [ATTR_HTTP_REQUEST_METHOD]: HTTP_REQUEST_METHOD_VALUE_GET,
          [ATTR_SERVER_ADDRESS]: hostname,
          [ATTR_SERVER_PORT]: serverPort,
          [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
          [ATTR_NETWORK_PEER_ADDRESS]: body.address,
          [ATTR_NETWORK_PEER_PORT]: response.clientRemotePort,
          [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
          [ATTR_URL_PATH]: `${pathname}/setroute`,
          [ATTR_URL_SCHEME]: protocol,
          [ATTR_HTTP_ROUTE]: 'TheRoute',

          // 1.7 attributes
          [ATTR_HTTP_FLAVOR]: '1.1',
          [ATTR_HTTP_HOST]: `${hostname}:${serverPort}`,
          [ATTR_HTTP_METHOD]: 'GET',
          [ATTR_HTTP_SCHEME]: protocol,
          [ATTR_HTTP_STATUS_CODE]: 200,
          [ATTR_HTTP_TARGET]: `${pathname}/setroute`,
          [ATTR_HTTP_URL]: `http://${hostname}:${serverPort}${pathname}/setroute`,
          [ATTR_NET_TRANSPORT]: 'ip_tcp',
          [ATTR_NET_HOST_IP]: body.address,
          [ATTR_NET_HOST_NAME]: hostname,
          [ATTR_NET_HOST_PORT]: serverPort,
          [ATTR_NET_PEER_IP]: body.address,
          [ATTR_NET_PEER_PORT]: response.clientRemotePort,

          // unspecified old names
          [AttributeNames.HTTP_STATUS_TEXT]: 'OK',
        });
      });
    });

    describe('with require parent span', () => {
      beforeEach(done => {
        memoryExporter.reset();
        instrumentation.setConfig({});
        instrumentation.enable();
        server = http.createServer((request, response) => {
          response.end('Test Server Response');
        });
        server.listen(serverPort, done);
      });

      afterEach(() => {
        server.close();
        instrumentation.disable();
      });

      it('should not trace without parent with options enabled (both client & server)', async () => {
        instrumentation.disable();
        instrumentation.setConfig({
          requireParentforIncomingSpans: true,
          requireParentforOutgoingSpans: true,
        });
        instrumentation.enable();
        const testPath = '/test/test';
        await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${testPath}`
        );
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 0);
      });

      it('should not trace without parent with options enabled (client only)', async () => {
        instrumentation.disable();
        instrumentation.setConfig({
          requireParentforOutgoingSpans: true,
        });
        instrumentation.enable();
        const testPath = '/test/test';
        const result = await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${testPath}`
        );
        assert.ok(
          result.reqHeaders[DummyPropagation.TRACE_CONTEXT_KEY] !== undefined
        );
        assert.ok(
          result.reqHeaders[DummyPropagation.SPAN_CONTEXT_KEY] !== undefined
        );
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 1);
        assert.strictEqual(
          spans.every(span => span.kind === SpanKind.SERVER),
          true
        );
      });

      it('should not trace without parent with options enabled (server only)', async () => {
        instrumentation.disable();
        instrumentation.setConfig({
          requireParentforIncomingSpans: true,
        });
        instrumentation.enable();
        const testPath = '/test/test';
        const result = await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${testPath}`
        );
        assert.ok(
          result.reqHeaders[DummyPropagation.TRACE_CONTEXT_KEY] !== undefined
        );
        assert.ok(
          result.reqHeaders[DummyPropagation.SPAN_CONTEXT_KEY] !== undefined
        );
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 1);
        assert.strictEqual(
          spans.every(span => span.kind === SpanKind.CLIENT),
          true
        );
      });

      it('should not trace with INVALID_SPAN_CONTEXT parent with requireParent options enabled', async () => {
        instrumentation.disable();
        instrumentation.setConfig({
          requireParentforIncomingSpans: true,
          requireParentforOutgoingSpans: true,
        });
        instrumentation.enable();
        const root = trace.wrapSpanContext(INVALID_SPAN_CONTEXT);
        await context.with(trace.setSpan(context.active(), root), async () => {
          const testPath = '/test/test';
          await httpRequest.get(
            `${protocol}://${hostname}:${serverPort}${testPath}`
          );
        });
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 0);
      });

      it('should trace with parent with both requireParent options enabled', done => {
        instrumentation.disable();
        instrumentation.setConfig({
          requireParentforIncomingSpans: true,
          requireParentforOutgoingSpans: true,
        });
        instrumentation.enable();
        const testPath = '/test/test';
        const tracer = provider.getTracer('default');
        const span = tracer.startSpan('parentSpan', {
          kind: SpanKind.INTERNAL,
        });
        context.with(trace.setSpan(context.active(), span), () => {
          httpRequest
            .get(`${protocol}://${hostname}:${serverPort}${testPath}`)
            .then(result => {
              span.end();
              assert.ok(
                result.reqHeaders[DummyPropagation.TRACE_CONTEXT_KEY] !==
                  undefined
              );
              assert.ok(
                result.reqHeaders[DummyPropagation.SPAN_CONTEXT_KEY] !==
                  undefined
              );
              const spans = memoryExporter.getFinishedSpans();
              assert.strictEqual(spans.length, 2);
              assert.strictEqual(
                spans.filter(span => span.kind === SpanKind.CLIENT).length,
                1
              );
              assert.strictEqual(
                spans.filter(span => span.kind === SpanKind.INTERNAL).length,
                1
              );
              return done();
            })
            .catch(done);
        });
      });
    });
    describe('rpc metadata', () => {
      beforeEach(() => {
        memoryExporter.reset();
        instrumentation.setConfig({ requireParentforOutgoingSpans: true });
        instrumentation.enable();
      });

      afterEach(() => {
        server.close();
        instrumentation.disable();
      });

      it('should set rpc metadata for incoming http request', async () => {
        server = http.createServer((request, response) => {
          const rpcMetadata = getRPCMetadata(context.active());
          assert.ok(typeof rpcMetadata !== 'undefined');
          assert.ok(rpcMetadata.type === RPCType.HTTP);
          assert.ok(rpcMetadata.span.setAttribute('key', 'value'));
          response.end('Test Server Response');
        });
        await new Promise<void>(resolve => server.listen(serverPort, resolve));
        await httpRequest.get(`${protocol}://${hostname}:${serverPort}`);
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 1);
        assert.strictEqual(spans[0].attributes.key, 'value');
      });
    });
  });

  describe('capturing headers as span attributes', () => {
    beforeEach(() => {
      memoryExporter.reset();
    });

    before(async () => {
      instrumentation.setConfig({
        headersToSpanAttributes: {
          client: {
            requestHeaders: ['X-Client-Header1'],
            responseHeaders: ['X-Server-Header1'],
          },
          server: {
            requestHeaders: ['X-Client-Header2'],
            responseHeaders: ['X-Server-Header2'],
          },
        },
      });
      instrumentation.enable();
      server = http.createServer((request, response) => {
        response.setHeader('X-ServeR-header1', 'server123');
        response.setHeader('X-Server-header2', '123server');
        response.end('Test Server Response');
      });

      await new Promise<void>(resolve => server.listen(serverPort, resolve));
    });

    after(() => {
      server.close();
      instrumentation.disable();
    });

    it('should convert headers to span attributes', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}`,
        {
          headers: {
            'X-client-header1': 'client123',
            'X-CLIENT-HEADER2': '123client',
          },
        }
      );
      const spans = memoryExporter.getFinishedSpans();
      const [incomingSpan, outgoingSpan] = spans;

      assert.strictEqual(spans.length, 2);

      assert.deepStrictEqual(
        incomingSpan.attributes['http.request.header.x_client_header2'],
        ['123client']
      );

      assert.deepStrictEqual(
        incomingSpan.attributes['http.response.header.x_server_header2'],
        ['123server']
      );

      assert.strictEqual(
        incomingSpan.attributes['http.request.header.x_client_header1'],
        undefined
      );

      assert.strictEqual(
        incomingSpan.attributes['http.response.header.x_server_header1'],
        undefined
      );

      assert.deepStrictEqual(
        outgoingSpan.attributes['http.request.header.x_client_header1'],
        ['client123']
      );
      assert.deepStrictEqual(
        outgoingSpan.attributes['http.response.header.x_server_header1'],
        ['server123']
      );

      assert.strictEqual(
        outgoingSpan.attributes['http.request.header.x_client_header2'],
        undefined
      );

      assert.strictEqual(
        outgoingSpan.attributes['http.response.header.x_server_header2'],
        undefined
      );
    });
  });
  describe('URL Redaction', () => {
    beforeEach(() => {
      memoryExporter.reset();
    });

    before(async () => {
      instrumentation.setConfig({});
      instrumentation.enable();
      server = http.createServer((request, response) => {
        response.end('Test Server Response');
      });
      await new Promise<void>(resolve => server.listen(serverPort, resolve));
    });

    after(() => {
      server.close();
      instrumentation.disable();
    });

    it('should redact authentication credentials from URLs', async () => {
      await httpRequest.get(
        `${protocol}://user:password@${hostname}:${serverPort}${pathname}`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [incomingSpan, outgoingSpan] = spans;

      assert.strictEqual(spans.length, 2);
      assert.strictEqual(incomingSpan.kind, SpanKind.SERVER);
      assert.strictEqual(outgoingSpan.kind, SpanKind.CLIENT);

      // Server shouldn't see auth in URL
      assert.strictEqual(
        incomingSpan.attributes[ATTR_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}`
      );

      // Client should have redacted auth
      assert.strictEqual(
        outgoingSpan.attributes[ATTR_HTTP_URL],
        `${protocol}://REDACTED:REDACTED@${hostname}:${serverPort}${pathname}`
      );
    });
    it('should redact default query strings', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?X-Goog-Signature=xyz789&normal=value`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[ATTR_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?X-Goog-Signature=REDACTED&normal=value`
      );
    });

    it('should handle both auth credentials and sensitive default query parameters', async () => {
      await httpRequest.get(
        `${protocol}://username:password@${hostname}:${serverPort}${pathname}?AWSAccessKeyId=secret`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[ATTR_HTTP_URL],
        `${protocol}://REDACTED:REDACTED@${hostname}:${serverPort}${pathname}?AWSAccessKeyId=REDACTED`
      );
    });
    it('should handle URLs with special characters in auth and query', async () => {
      await httpRequest.get(
        `${protocol}://user%40domain:p%40ssword@${hostname}:${serverPort}${pathname}?sig=abc%3Ddef`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[ATTR_HTTP_URL],
        `${protocol}://REDACTED:REDACTED@${hostname}:${serverPort}${pathname}?sig=REDACTED`
      );
    });

    it('should handle malformed query strings', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?X-Goog-Signature=value&=nokey&malformed=`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[ATTR_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?X-Goog-Signature=REDACTED&=nokey&malformed=`
      );
    });
    it('should not modify URLs without auth or sensitive query parameters', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?param=value&another=123`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[ATTR_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?param=value&another=123`
      );
    });

    it('should not modify URLs with no query string', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[ATTR_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}`
      );
    });

    it('should not modify URLs with empty query parameters', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?sig=&empty=`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[ATTR_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?sig=&empty=`
      );
    });

    it('should preserve non-sensitive query parameters when sensitive ones are redacted', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?normal=value&Signature=secret&other=data`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[ATTR_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?normal=value&Signature=REDACTED&other=data`
      );
    });
    it('should redact only custom query parameters when user provides a populated config', async () => {
      // Set additional parameters while keeping the default ones
      instrumentation.setConfig({
        redactedQueryParams: ['authorize', 'session_id'],
      });

      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?sig=abc123&authorize=xyz789&normal=value`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[ATTR_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?sig=abc123&authorize=REDACTED&normal=value`
      );
    });
    it('should not redact query strings when redactedQueryParams is empty', async () => {
      instrumentation.setConfig({
        redactedQueryParams: [],
      });

      // URL with both default sensitive params and custom ones
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?X-Goog-Signature=secret&api_key=12345&normal=value`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[ATTR_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?X-Goog-Signature=secret&api_key=12345&normal=value`
      );
    });
    it('should handle case-sensitive query parameter names correctly', async () => {
      instrumentation.setConfig({
        redactedQueryParams: ['TOKEN'],
      });

      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?token=lowercase&TOKEN=uppercase&sig=secret`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      // This tests whether parameter name matching is case-sensitive or case-insensitive
      assert.strictEqual(
        outgoingSpan.attributes[ATTR_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?token=lowercase&TOKEN=REDACTED&sig=secret`
      );
    });
    it('should handle very complex URLs with multiple redaction points and if custom query strings are provided only redact those', async () => {
      instrumentation.setConfig({
        redactedQueryParams: ['api_key', 'token'],
      });

      const complexUrl =
        `${protocol}://user:pass@${hostname}:${serverPort}${pathname}?` +
        'sig=abc123&api_key=secret&normal=value&Signature=xyz&' +
        'token=sensitive&X-Goog-Signature=gcp&AWSAccessKeyId=aws';

      await httpRequest.get(complexUrl);
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      const expectedUrl =
        `${protocol}://REDACTED:REDACTED@${hostname}:${serverPort}${pathname}?` +
        'sig=abc123&api_key=REDACTED&normal=value&Signature=xyz&' +
        'token=REDACTED&X-Goog-Signature=gcp&AWSAccessKeyId=aws';

      assert.strictEqual(outgoingSpan.attributes[ATTR_HTTP_URL], expectedUrl);
    });
  });
});

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
  SpanAttributes,
  SpanStatusCode,
  ROOT_CONTEXT,
  SpanKind,
  TraceFlags,
  context,
} from '@opentelemetry/api';
import { BasicTracerProvider, Span } from '@opentelemetry/sdk-trace-base';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import * as assert from 'assert';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import * as sinon from 'sinon';
import * as url from 'url';
import { IgnoreMatcher } from '../../src/types';
import * as utils from '../../src/utils';
import { AttributeNames } from '../../src/enums/AttributeNames';
import { RPCType, setRPCMetadata } from '@opentelemetry/core';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

describe('Utility', () => {
  describe('parseResponseStatus()', () => {
    it('should return ERROR code by default', () => {
      const status = utils.parseResponseStatus(SpanKind.CLIENT, undefined);
      assert.deepStrictEqual(status, SpanStatusCode.ERROR);
    });

    it('should return UNSET for Success HTTP status code', () => {
      for (let index = 100; index < 400; index++) {
        const status = utils.parseResponseStatus(SpanKind.CLIENT, index);
        assert.deepStrictEqual(status, SpanStatusCode.UNSET);
      }
      for (let index = 100; index < 500; index++) {
        const status = utils.parseResponseStatus(SpanKind.SERVER, index);
        assert.deepStrictEqual(status, SpanStatusCode.UNSET);
      }
    });

    it('should return ERROR for bad status codes', () => {
      for (let index = 400; index <= 600; index++) {
        const status = utils.parseResponseStatus(SpanKind.CLIENT, index);
        assert.notStrictEqual(status, SpanStatusCode.UNSET);
      }
      for (let index = 500; index <= 600; index++) {
        const status = utils.parseResponseStatus(SpanKind.SERVER, index);
        assert.notStrictEqual(status, SpanStatusCode.UNSET);
      }
    });
  });

  describe('getRequestInfo()', () => {
    it('should get options object', () => {
      const webUrl = 'http://u:p@google.fr/aPath?qu=ry';
      const urlParsed = url.parse(webUrl);
      const urlParsedWithoutPathname = {
        ...urlParsed,
        pathname: undefined,
      };
      const urlParsedWithUndefinedHostAndPort = {
        ...urlParsed,
        host: undefined,
        port: undefined,
      };
      const urlParsedWithUndefinedHostAndNullPort = {
        ...urlParsed,
        host: undefined,
        port: null,
      };
      const whatWgUrl = new url.URL(webUrl);
      for (const param of [
        webUrl,
        urlParsed,
        urlParsedWithoutPathname,
        urlParsedWithUndefinedHostAndPort,
        urlParsedWithUndefinedHostAndNullPort,
        whatWgUrl,
      ]) {
        const result = utils.getRequestInfo(param);
        assert.strictEqual(result.optionsParsed.hostname, 'google.fr');
        assert.strictEqual(result.optionsParsed.protocol, 'http:');
        assert.strictEqual(result.optionsParsed.path, '/aPath?qu=ry');
        assert.strictEqual(result.pathname, '/aPath');
        assert.strictEqual(result.origin, 'http://google.fr');
      }
    });
  });

  describe('satisfiesPattern()', () => {
    it('string pattern', () => {
      const answer1 = utils.satisfiesPattern('/test/1', '/test/1');
      assert.strictEqual(answer1, true);
      const answer2 = utils.satisfiesPattern('/test/1', '/test/11');
      assert.strictEqual(answer2, false);
    });

    it('regex pattern', () => {
      const answer1 = utils.satisfiesPattern('/TeSt/1', /\/test/i);
      assert.strictEqual(answer1, true);
      const answer2 = utils.satisfiesPattern('/2/tEst/1', /\/test/);
      assert.strictEqual(answer2, false);
    });

    it('should throw if type is unknown', () => {
      try {
        utils.satisfiesPattern('/TeSt/1', (true as unknown) as IgnoreMatcher);
        assert.fail();
      } catch (error) {
        assert.strictEqual(error instanceof TypeError, true);
      }
    });

    it('function pattern', () => {
      const answer1 = utils.satisfiesPattern(
        '/test/home',
        (url: string) => url === '/test/home'
      );
      assert.strictEqual(answer1, true);
      const answer2 = utils.satisfiesPattern(
        '/test/home',
        (url: string) => url !== '/test/home'
      );
      assert.strictEqual(answer2, false);
    });
  });

  describe('isIgnored()', () => {
    beforeEach(() => {
      sinon.spy(utils, 'satisfiesPattern');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should call isSatisfyPattern, n match', () => {
      const answer1 = utils.isIgnored('/test/1', ['/test/11']);
      assert.strictEqual(answer1, false);
      assert.strictEqual(
        (utils.satisfiesPattern as sinon.SinonSpy).callCount,
        1
      );
    });

    it('should call isSatisfyPattern, match for function', () => {
      const answer1 = utils.isIgnored('/test/1', [
        url => url.endsWith('/test/1'),
      ]);
      assert.strictEqual(answer1, true);
    });

    it('should not re-throw when function throws an exception', () => {
      const onException = (e: unknown) => {
        // Do nothing
      };
      for (const callback of [undefined, onException]) {
        assert.doesNotThrow(() =>
          utils.isIgnored(
            '/test/1',
            [
              () => {
                throw new Error('test');
              },
            ],
            callback
          )
        );
      }
    });

    it('should call onException when function throws an exception', () => {
      const onException = sinon.spy();
      assert.doesNotThrow(() =>
        utils.isIgnored(
          '/test/1',
          [
            () => {
              throw new Error('test');
            },
          ],
          onException
        )
      );
      assert.strictEqual((onException as sinon.SinonSpy).callCount, 1);
    });

    it('should not call isSatisfyPattern', () => {
      utils.isIgnored('/test/1', []);
      assert.strictEqual(
        (utils.satisfiesPattern as sinon.SinonSpy).callCount,
        0
      );
    });

    it('should return false on empty list', () => {
      const answer1 = utils.isIgnored('/test/1', []);
      assert.strictEqual(answer1, false);
    });

    it('should not throw and return false when list is undefined', () => {
      const answer2 = utils.isIgnored('/test/1', undefined);
      assert.strictEqual(answer2, false);
    });
  });

  describe('getAbsoluteUrl()', () => {
    it('should return absolute url with localhost', () => {
      const path = '/test/1';
      const result = utils.getAbsoluteUrl(url.parse(path), {});
      assert.strictEqual(result, `http://localhost${path}`);
    });
    it('should return absolute url', () => {
      const absUrl = 'http://www.google/test/1?query=1';
      const result = utils.getAbsoluteUrl(url.parse(absUrl), {});
      assert.strictEqual(result, absUrl);
    });
    it('should return default url', () => {
      const result = utils.getAbsoluteUrl(null, {});
      assert.strictEqual(result, 'http://localhost/');
    });
    it("{ path: '/helloworld', port: 8080 } should return http://localhost:8080/helloworld", () => {
      const result = utils.getAbsoluteUrl(
        { path: '/helloworld', port: 8080 },
        {}
      );
      assert.strictEqual(result, 'http://localhost:8080/helloworld');
    });
  });

  describe('setSpanWithError()', () => {
    it('should have error attributes', () => {
      const errorMessage = 'test error';
      const span = new Span(
        new BasicTracerProvider().getTracer('default'),
        ROOT_CONTEXT,
        'test',
        { spanId: '', traceId: '', traceFlags: TraceFlags.SAMPLED },
        SpanKind.INTERNAL
      );
      /* tslint:disable-next-line:no-any */
      utils.setSpanWithError(span, new Error(errorMessage));
      const attributes = span.attributes;
      assert.strictEqual(
        attributes[AttributeNames.HTTP_ERROR_MESSAGE],
        errorMessage
      );
      assert.strictEqual(span.events.length, 1);
      assert.strictEqual(span.events[0].name, 'exception');
      assert.ok(attributes[AttributeNames.HTTP_ERROR_NAME]);
    });
  });

  describe('isValidOptionsType()', () => {
    ['', false, true, 1, 0, []].forEach(options => {
      it(`should return false with the following value: ${JSON.stringify(
        options
      )}`, () => {
        assert.strictEqual(utils.isValidOptionsType(options), false);
      });
    });
    for (const options of ['url', url.parse('http://url.com'), {}]) {
      it(`should return true with the following value: ${JSON.stringify(
        options
      )}`, () => {
        assert.strictEqual(utils.isValidOptionsType(options), true);
      });
    }
  });

  describe('getIncomingRequestAttributesOnResponse()', () => {
    it('should correctly parse the middleware stack if present', done => {
      context.setGlobalContextManager(new AsyncHooksContextManager().enable());
      const request = {
        socket: {},
      } as IncomingMessage;
      context.with(
        setRPCMetadata(context.active(), {
          type: RPCType.HTTP,
          route: '/user/:id',
          span: (null as unknown) as Span,
        }),
        () => {
          const attributes = utils.getIncomingRequestAttributesOnResponse(
            request,
            {} as ServerResponse
          );
          assert.deepStrictEqual(
            attributes[SemanticAttributes.HTTP_ROUTE],
            '/user/:id'
          );
          context.disable();
          return done();
        }
      );
    });

    it('should succesfully process without middleware stack', () => {
      const request = {
        socket: {},
      } as IncomingMessage;
      const attributes = utils.getIncomingRequestAttributesOnResponse(request, {
        socket: {},
      } as ServerResponse & { socket: Socket });
      assert.deepEqual(attributes[SemanticAttributes.HTTP_ROUTE], undefined);
    });
  });
  // Verify the key in the given attributes is set to the given value,
  // and that no other HTTP Content Length attributes are set.
  function verifyValueInAttributes(
    attributes: SpanAttributes,
    key: string | undefined,
    value: number
  ) {
    const SemanticAttributess = [
      SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
      SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH,
      SemanticAttributes.HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
      SemanticAttributes.HTTP_REQUEST_CONTENT_LENGTH,
    ];

    for (const attr of SemanticAttributess) {
      if (attr === key) {
        assert.strictEqual(attributes[attr], value);
      } else {
        assert.strictEqual(attributes[attr], undefined);
      }
    }
  }

  describe('setRequestContentLengthAttributes()', () => {
    it('should set request content-length uncompressed attribute with no content-encoding header', () => {
      const attributes: SpanAttributes = {};
      const request = {} as IncomingMessage;

      request.headers = {
        'content-length': '1200',
      };
      utils.setRequestContentLengthAttribute(request, attributes);

      verifyValueInAttributes(
        attributes,
        SemanticAttributes.HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
        1200
      );
    });

    it('should set request content-length uncompressed attribute with "identity" content-encoding header', () => {
      const attributes: SpanAttributes = {};
      const request = {} as IncomingMessage;
      request.headers = {
        'content-length': '1200',
        'content-encoding': 'identity',
      };
      utils.setRequestContentLengthAttribute(request, attributes);

      verifyValueInAttributes(
        attributes,
        SemanticAttributes.HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
        1200
      );
    });

    it('should set request content-length compressed attribute with "gzip" content-encoding header', () => {
      const attributes: SpanAttributes = {};
      const request = {} as IncomingMessage;
      request.headers = {
        'content-length': '1200',
        'content-encoding': 'gzip',
      };
      utils.setRequestContentLengthAttribute(request, attributes);

      verifyValueInAttributes(
        attributes,
        SemanticAttributes.HTTP_REQUEST_CONTENT_LENGTH,
        1200
      );
    });
  });

  describe('setResponseContentLengthAttributes()', () => {
    it('should set response content-length uncompressed attribute with no content-encoding header', () => {
      const attributes: SpanAttributes = {};

      const response = {} as IncomingMessage;

      response.headers = {
        'content-length': '1200',
      };
      utils.setResponseContentLengthAttribute(response, attributes);

      verifyValueInAttributes(
        attributes,
        SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
        1200
      );
    });

    it('should set response content-length uncompressed attribute with "identity" content-encoding header', () => {
      const attributes: SpanAttributes = {};

      const response = {} as IncomingMessage;

      response.headers = {
        'content-length': '1200',
        'content-encoding': 'identity',
      };

      utils.setResponseContentLengthAttribute(response, attributes);

      verifyValueInAttributes(
        attributes,
        SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
        1200
      );
    });

    it('should set response content-length compressed attribute with "gzip" content-encoding header', () => {
      const attributes: SpanAttributes = {};

      const response = {} as IncomingMessage;

      response.headers = {
        'content-length': '1200',
        'content-encoding': 'gzip',
      };

      utils.setResponseContentLengthAttribute(response, attributes);

      verifyValueInAttributes(
        attributes,
        SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH,
        1200
      );
    });

    it('should set no attributes with no content-length header', () => {
      const attributes: SpanAttributes = {};
      const message = {} as IncomingMessage;

      message.headers = {
        'content-encoding': 'gzip',
      };
      utils.setResponseContentLengthAttribute(message, attributes);

      verifyValueInAttributes(attributes, undefined, 1200);
    });
  });

  describe('getIncomingRequestAttributes()', () => {
    it('should not set http.route in http span attributes', () => {
      const request = {
        url: 'http://hostname/user/:id',
        method: 'GET'
      } as IncomingMessage;
      request.headers = {
        'user-agent': 'chrome',
        'x-forwarded-for': '<client>, <proxy1>, <proxy2>'
      };
      const attributes = utils.getIncomingRequestAttributes(request, { component: 'http'});
      assert.strictEqual(attributes[SemanticAttributes.HTTP_ROUTE], undefined);
    });
  });

  describe('headers to span attributes capture', () => {
    let span: Span;

    beforeEach(() => {
      span = new Span(
        new BasicTracerProvider().getTracer('default'),
        ROOT_CONTEXT,
        'test',
        { spanId: '', traceId: '', traceFlags: TraceFlags.SAMPLED },
        SpanKind.INTERNAL
      );
    });

    it('should set attributes for request and response keys', () => {
      utils.headerCapture('request', ['Origin'])(span, () => 'localhost');
      utils.headerCapture('response', ['Cookie'])(span, () => 'token=123');
      assert.deepStrictEqual(span.attributes['http.request.header.origin'], ['localhost']);
      assert.deepStrictEqual(span.attributes['http.response.header.cookie'], ['token=123']);
    });

    it('should set attributes for multiple values', () => {
      utils.headerCapture('request', ['Origin'])(span, () => ['localhost', 'www.example.com']);
      assert.deepStrictEqual(span.attributes['http.request.header.origin'], ['localhost', 'www.example.com']);
    });

    it('sets attributes for multiple headers', () => {
      utils.headerCapture('request', ['Origin', 'Foo'])(span, header => {
        if (header === 'origin') {
          return 'localhost';
        }

        if (header === 'foo') {
          return 42;
        }

        return undefined;
      });

      assert.deepStrictEqual(span.attributes['http.request.header.origin'], ['localhost']);
      assert.deepStrictEqual(span.attributes['http.request.header.foo'], [42]);
    });

    it('should normalize header names', () => {
      utils.headerCapture('request', ['X-Forwarded-For'])(span, () => 'foo');
      assert.deepStrictEqual(span.attributes['http.request.header.x_forwarded_for'], ['foo']);
    });

    it('ignores non-existent headers', () => {
      utils.headerCapture('request', ['Origin', 'Accept'])(span, header => {
        if (header === 'origin') {
          return 'localhost';
        }

        return undefined;
      });

      assert.deepStrictEqual(span.attributes['http.request.header.origin'], ['localhost']);
      assert.deepStrictEqual(span.attributes['http.request.header.accept'], undefined);
    });
  });
});

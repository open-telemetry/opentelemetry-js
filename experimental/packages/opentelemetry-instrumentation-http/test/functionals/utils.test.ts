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
  Attributes,
  SpanStatusCode,
  SpanKind,
  context,
  Span,
  diag,
} from '@opentelemetry/api';
import {
  ATTR_HTTP_ROUTE,
  ATTR_USER_AGENT_ORIGINAL,
} from '@opentelemetry/semantic-conventions';
import * as assert from 'assert';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import * as sinon from 'sinon';
import * as url from 'url';
import {
  ATTR_HTTP_REQUEST_CONTENT_LENGTH,
  ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
  ATTR_HTTP_RESPONSE_CONTENT_LENGTH,
  ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
  ATTR_HTTP_TARGET,
  ATTR_USER_AGENT_SYNTHETIC_TYPE,
  USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT,
} from '../../src/semconv';
import { IgnoreMatcher, ParsedRequestOptions } from '../../src/internal-types';
import * as utils from '../../src/utils';
import { RPCType, setRPCMetadata } from '@opentelemetry/core';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { SemconvStability } from '@opentelemetry/instrumentation';
import { extractHostnameAndPort } from '../../src/utils';
import { AttributeNames } from '../../src/enums/AttributeNames';

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
        const result = utils.getRequestInfo(diag, param);
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
        utils.satisfiesPattern('/TeSt/1', true as unknown as IgnoreMatcher);
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
    it('should return auth credentials as REDACTED to avoid leaking sensitive information', () => {
      const result = utils.getAbsoluteUrl(
        { path: '/helloworld', port: 8080, auth: 'user:password' },
        {}
      );
      assert.strictEqual(
        result,
        'http://REDACTED:REDACTED@localhost:8080/helloworld'
      );
    });
    it('should return auth credentials and particular query strings as REDACTED', () => {
      const result = utils.getAbsoluteUrl(
        {
          path: '/registers?X-Goog-Signature=secret123',
          port: 8080,
          auth: 'user:pass',
        },
        {}
      );
      assert.strictEqual(
        result,
        'http://REDACTED:REDACTED@localhost:8080/registers?X-Goog-Signature=REDACTED'
      );
    });
    it('should return particular query strings as REDACTED', () => {
      const result = utils.getAbsoluteUrl(
        {
          path: '/registers?AWSAccessKeyId=secret123',
          port: 8080,
        },
        {}
      );
      assert.strictEqual(
        result,
        'http://localhost:8080/registers?AWSAccessKeyId=REDACTED'
      );
    });
  });

  describe('setSpanWithError()', () => {
    it('should have error attributes', () => {
      const errorMessage = 'test error';
      const error = new Error(errorMessage);
      const span = {
        setAttribute: () => undefined,
        setStatus: () => undefined,
        recordException: () => undefined,
      } as unknown as Span;
      const mock = sinon.mock(span);
      mock
        .expects('setAttribute')
        .calledWithExactly(AttributeNames.HTTP_ERROR_NAME, 'error');
      mock
        .expects('setAttribute')
        .calledWithExactly(AttributeNames.HTTP_ERROR_MESSAGE, errorMessage);
      mock.expects('setStatus').calledWithExactly({
        code: SpanStatusCode.ERROR,
        message: errorMessage,
      });
      mock.expects('recordException').calledWithExactly(error);

      utils.setSpanWithError(span, error, SemconvStability.OLD);
      mock.verify();
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
          span: null as unknown as Span,
        }),
        () => {
          const attributes = utils.getIncomingRequestAttributesOnResponse(
            request,
            {} as ServerResponse,
            SemconvStability.OLD
          );
          assert.deepStrictEqual(attributes[ATTR_HTTP_ROUTE], '/user/:id');
          context.disable();
          return done();
        }
      );
    });

    it('should successfully process without middleware stack', () => {
      const request = {
        socket: {},
      } as IncomingMessage;
      const attributes = utils.getIncomingRequestAttributesOnResponse(
        request,
        {
          socket: {},
        } as ServerResponse & { socket: Socket },
        SemconvStability.OLD
      );
      assert.deepEqual(attributes[ATTR_HTTP_ROUTE], undefined);
    });
  });

  describe('getIncomingRequestMetricAttributesOnResponse()', () => {
    it('should correctly add http_route if span has it', () => {
      const spanAttributes: Attributes = {
        [ATTR_HTTP_ROUTE]: '/user/:id',
      };
      const metricAttributes =
        utils.getIncomingRequestMetricAttributesOnResponse(spanAttributes);

      assert.deepStrictEqual(metricAttributes[ATTR_HTTP_ROUTE], '/user/:id');
    });

    it('should skip http_route if span does not have it', () => {
      const spanAttributes: Attributes = {};
      const metricAttributes =
        utils.getIncomingRequestMetricAttributesOnResponse(spanAttributes);
      assert.deepEqual(metricAttributes[ATTR_HTTP_ROUTE], undefined);
    });
  });

  // Verify the key in the given attributes is set to the given value,
  // and that no other HTTP Content Length attributes are set.
  function verifyValueInAttributes(
    attributes: Attributes,
    key: string | undefined,
    value: number
  ) {
    const SemanticAttributess = [
      ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
      ATTR_HTTP_RESPONSE_CONTENT_LENGTH,
      ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
      ATTR_HTTP_REQUEST_CONTENT_LENGTH,
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
      const attributes: Attributes = {};
      const request = {} as IncomingMessage;

      request.headers = {
        'content-length': '1200',
      };
      utils.setRequestContentLengthAttribute(request, attributes);

      verifyValueInAttributes(
        attributes,
        ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
        1200
      );
    });

    it('should set request content-length uncompressed attribute with "identity" content-encoding header', () => {
      const attributes: Attributes = {};
      const request = {} as IncomingMessage;
      request.headers = {
        'content-length': '1200',
        'content-encoding': 'identity',
      };
      utils.setRequestContentLengthAttribute(request, attributes);

      verifyValueInAttributes(
        attributes,
        ATTR_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
        1200
      );
    });

    it('should set request content-length compressed attribute with "gzip" content-encoding header', () => {
      const attributes: Attributes = {};
      const request = {} as IncomingMessage;
      request.headers = {
        'content-length': '1200',
        'content-encoding': 'gzip',
      };
      utils.setRequestContentLengthAttribute(request, attributes);

      verifyValueInAttributes(
        attributes,
        ATTR_HTTP_REQUEST_CONTENT_LENGTH,
        1200
      );
    });
  });

  describe('setResponseContentLengthAttributes()', () => {
    it('should set response content-length uncompressed attribute with no content-encoding header', () => {
      const attributes: Attributes = {};

      const response = {} as IncomingMessage;

      response.headers = {
        'content-length': '1200',
      };
      utils.setResponseContentLengthAttribute(response, attributes);

      verifyValueInAttributes(
        attributes,
        ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
        1200
      );
    });

    it('should set response content-length uncompressed attribute with "identity" content-encoding header', () => {
      const attributes: Attributes = {};

      const response = {} as IncomingMessage;

      response.headers = {
        'content-length': '1200',
        'content-encoding': 'identity',
      };

      utils.setResponseContentLengthAttribute(response, attributes);

      verifyValueInAttributes(
        attributes,
        ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
        1200
      );
    });

    it('should set response content-length compressed attribute with "gzip" content-encoding header', () => {
      const attributes: Attributes = {};

      const response = {} as IncomingMessage;

      response.headers = {
        'content-length': '1200',
        'content-encoding': 'gzip',
      };

      utils.setResponseContentLengthAttribute(response, attributes);

      verifyValueInAttributes(
        attributes,
        ATTR_HTTP_RESPONSE_CONTENT_LENGTH,
        1200
      );
    });

    it('should set no attributes with no content-length header', () => {
      const attributes: Attributes = {};
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
        method: 'GET',
        socket: {},
      } as IncomingMessage;
      request.headers = {
        'user-agent': 'chrome',
        'x-forwarded-for': '<client>, <proxy1>, <proxy2>',
      };
      const attributes = utils.getIncomingRequestAttributes(
        request,
        {
          component: 'http',
          semconvStability: SemconvStability.OLD,
          enableSyntheticSourceDetection: false,
        },
        diag
      );
      assert.strictEqual(attributes[ATTR_HTTP_ROUTE], undefined);
    });

    it('should set http.target as path in http span attributes', () => {
      const request = {
        url: 'http://hostname/user/?q=val',
        method: 'GET',
        socket: {},
      } as IncomingMessage;
      request.headers = {
        'user-agent': 'chrome',
      };
      const attributes = utils.getIncomingRequestAttributes(
        request,
        {
          component: 'http',
          semconvStability: SemconvStability.OLD,
          enableSyntheticSourceDetection: false,
        },
        diag
      );
      assert.strictEqual(attributes[ATTR_HTTP_TARGET], '/user/?q=val');
      assert.strictEqual(attributes[ATTR_USER_AGENT_SYNTHETIC_TYPE], undefined);
    });

    it('should set synthetic attributes on requests', () => {
      const request = {
        url: 'http://hostname/user/:id',
        method: 'GET',
        socket: {},
      } as IncomingMessage;
      request.headers = {
        'user-agent': 'Googlebot',
      };
      const attributes = utils.getIncomingRequestAttributes(
        request,
        {
          component: 'http',
          semconvStability: SemconvStability.STABLE,
          enableSyntheticSourceDetection: true,
        },
        diag
      );
      assert.strictEqual(attributes[ATTR_USER_AGENT_ORIGINAL], 'Googlebot');
      assert.strictEqual(
        attributes[ATTR_USER_AGENT_SYNTHETIC_TYPE],
        USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT
      );
    });
  });

  describe('headers to span attributes capture', () => {
    let span: Span;
    let mock: sinon.SinonMock;

    beforeEach(() => {
      span = {
        setAttribute: () => undefined,
      } as unknown as Span;
      mock = sinon.mock(span);
    });

    it('should set attributes for request and response keys', () => {
      mock
        .expects('setAttribute')
        .calledWithExactly('http.request.header.origin', ['localhost']);
      mock
        .expects('setAttribute')
        .calledWithExactly('http.response.header.cookie', ['token=123']);

      utils.headerCapture('request', ['Origin'])(span, () => 'localhost');
      utils.headerCapture('response', ['Cookie'])(span, () => 'token=123');
      mock.verify();
    });

    it('should set attributes for multiple values', () => {
      mock
        .expects('setAttribute')
        .calledWithExactly('http.request.header.origin', [
          'localhost',
          'www.example.com',
        ]);

      utils.headerCapture('request', ['Origin'])(span, () => [
        'localhost',
        'www.example.com',
      ]);
      mock.verify();
    });

    it('sets attributes for multiple headers', () => {
      mock
        .expects('setAttribute')
        .calledWithExactly('http.request.header.origin', ['localhost']);
      mock
        .expects('setAttribute')
        .calledWithExactly('http.request.header.foo', [42]);

      utils.headerCapture('request', ['Origin', 'Foo'])(span, header => {
        if (header === 'origin') {
          return 'localhost';
        }

        if (header === 'foo') {
          return 42;
        }

        return undefined;
      });
      mock.verify();
    });

    it('should normalize header names', () => {
      mock
        .expects('setAttribute')
        .calledWithExactly('http.request.header.x_forwarded_for', ['foo']);

      utils.headerCapture('request', ['X-Forwarded-For'])(span, () => 'foo');
      mock.verify();
    });

    it('ignores non-existent headers', () => {
      mock
        .expects('setAttribute')
        .once()
        .calledWithExactly('http.request.header.origin', ['localhost']);

      utils.headerCapture('request', ['Origin', 'Accept'])(span, header => {
        if (header === 'origin') {
          return 'localhost';
        }

        return undefined;
      });
      mock.verify();
    });
  });

  describe('extractHostnameAndPort', () => {
    it('should return the hostname and port defined in the parsedOptions', () => {
      type tmpParsedOption = Pick<
        ParsedRequestOptions,
        'hostname' | 'host' | 'port' | 'protocol'
      >;
      const parsedOption: tmpParsedOption = {
        hostname: 'www.google.com',
        port: '80',
        host: 'www.google.com',
        protocol: 'http:',
      };
      const { hostname, port } = extractHostnameAndPort(parsedOption);
      assert.strictEqual(hostname, parsedOption.hostname);
      assert.strictEqual(port, parsedOption.port);
    });

    it('should return the hostname and port based on host field defined in the parsedOptions when hostname and port are missing', () => {
      type tmpParsedOption = Pick<
        ParsedRequestOptions,
        'hostname' | 'host' | 'port' | 'protocol'
      >;
      const parsedOption: tmpParsedOption = {
        hostname: null,
        port: null,
        host: 'www.google.com:8181',
        protocol: 'http:',
      };
      const { hostname, port } = extractHostnameAndPort(parsedOption);
      assert.strictEqual(hostname, 'www.google.com');
      assert.strictEqual(port, '8181');
    });

    it('should infer the port number based on protocol https when can not extract it from host field', () => {
      type tmpParsedOption = Pick<
        ParsedRequestOptions,
        'hostname' | 'host' | 'port' | 'protocol'
      >;
      const parsedOption: tmpParsedOption = {
        hostname: null,
        port: null,
        host: 'www.google.com',
        protocol: 'https:',
      };
      const { hostname, port } = extractHostnameAndPort(parsedOption);
      assert.strictEqual(hostname, 'www.google.com');
      assert.strictEqual(port, '443');
    });

    it('should infer the port number based on protocol http when can not extract it from host field', () => {
      type tmpParsedOption = Pick<
        ParsedRequestOptions,
        'hostname' | 'host' | 'port' | 'protocol'
      >;
      const parsedOption: tmpParsedOption = {
        hostname: null,
        port: null,
        host: 'www.google.com',
        protocol: 'http:',
      };
      const { hostname, port } = extractHostnameAndPort(parsedOption);
      assert.strictEqual(hostname, 'www.google.com');
      assert.strictEqual(port, '80');
    });
  });

  describe('getRemoteClientAddress()', () => {
    it('returns IP address from x-forwarded-for header', () => {
      const request = {
        headers: {
          'x-forwarded-for': '127.0.0.1, <proxy1>, <proxy2>',
        },
      } as unknown as IncomingMessage;
      assert.strictEqual(utils.getRemoteClientAddress(request), '127.0.0.1');
    });

    it('returns IP address from x-forwarded-for header array', () => {
      const request = {
        headers: {
          'x-forwarded-for': ['127.0.0.1'],
        },
      } as unknown as IncomingMessage;
      assert.strictEqual(utils.getRemoteClientAddress(request), '127.0.0.1');
    });

    it('returns IP address without port from x-forwarded-for header', () => {
      const request = {
        headers: {
          'x-forwarded-for': '127.0.0.1:54321',
        },
      } as unknown as IncomingMessage;
      assert.strictEqual(utils.getRemoteClientAddress(request), '127.0.0.1');
    });

    it('returns IP address without port from x-forwarded-for header array', () => {
      const request = {
        headers: {
          'x-forwarded-for': ['127.0.0.1:54321'],
        },
      } as unknown as IncomingMessage;
      assert.strictEqual(utils.getRemoteClientAddress(request), '127.0.0.1');
    });

    it('handles IPv6 addresses containing brackets in x-forwarded-for header', () => {
      const request = {
        headers: {
          'x-forwarded-for': '[::1]',
        },
      } as unknown as IncomingMessage;
      assert.strictEqual(utils.getRemoteClientAddress(request), '::1');
    });

    it('forwarded header takes precedence over x-forwarded-for', () => {
      const request = {
        headers: {
          forwarded: 'for=192.0.2.60;proto=http;by=203.0.113.43',
          'x-forwarded-for': '127.0.0.1',
        },
      } as unknown as IncomingMessage;
      assert.strictEqual(utils.getRemoteClientAddress(request), '192.0.2.60');
    });

    it('handles forwarded header with chain of proxies', () => {
      const request = {
        headers: {
          forwarded: 'for=192.0.2.43, for=198.51.100.17',
        },
      } as unknown as IncomingMessage;
      assert.strictEqual(utils.getRemoteClientAddress(request), '192.0.2.43');
    });

    it('handles IPv6 addresses containing brackets in forwarded header', () => {
      const request = {
        headers: {
          forwarded: 'for="[2001:db8:cafe::17]:4711"',
        },
      } as unknown as IncomingMessage;
      assert.strictEqual(
        utils.getRemoteClientAddress(request),
        '2001:db8:cafe::17'
      );
    });

    it('returns address from socket as fallback', () => {
      const request = {
        headers: {},
        socket: {
          remoteAddress: '192.168.0.1',
        },
      } as unknown as IncomingMessage;
      assert.strictEqual(utils.getRemoteClientAddress(request), '192.168.0.1');
    });

    it('returns null if client address cannot be determined', () => {
      const request = {
        headers: {},
        socket: {},
      } as unknown as IncomingMessage;
      assert.strictEqual(utils.getRemoteClientAddress(request), null);
    });
  });
});

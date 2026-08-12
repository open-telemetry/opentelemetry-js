/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Span } from '@opentelemetry/api';
import { SpanStatusCode, SpanKind, context, diag } from '@opentelemetry/api';
import {
  ATTR_ERROR_TYPE,
  ATTR_HTTP_ROUTE,
  ATTR_URL_PATH,
  ATTR_USER_AGENT_ORIGINAL,
} from '@opentelemetry/semantic-conventions';
import * as assert from 'assert';
import type { IncomingMessage, RequestOptions, ServerResponse } from 'http';
import type { Socket } from 'net';
import * as sinon from 'sinon';
import * as url from 'url';
import {
  ATTR_USER_AGENT_SYNTHETIC_TYPE,
  USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT,
} from '../../src/semconv';
import type {
  IgnoreMatcher,
  ParsedRequestOptions,
} from '../../src/internal-types';
import * as utils from '../../src/utils';
import { RPCType, setRPCMetadata } from '@opentelemetry/core';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { extractHostnameAndPort } from '../../src/utils';
import type { ParsedUrlQuery } from 'node:querystring';

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
      const urlParsed = {
        protocol: 'http:',
        slashes: true,
        auth: 'u:p',
        host: 'google.fr',
        port: null,
        hostname: 'google.fr',
        hash: null,
        search: '?qu=ry',
        query: 'qu=ry',
        pathname: '/aPath',
        path: '/aPath?qu=ry',
        href: 'http://u:p@google.fr/aPath?qu=ry',
      };
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
      const whatWgUrl = new URL(webUrl);
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

    it('should not throw when method is not a string', () => {
      // Node.js rejects a non-string method itself; the instrumentation must
      // not throw before Node.js gets the chance to raise its own error.
      const result = utils.getRequestInfo(diag, {
        hostname: 'www.google.com',
        method: 1234,
      } as unknown as RequestOptions);
      assert.strictEqual(result.method, 'GET');
    });

    it('should treat URL-like objects the same as URL instances, like Node.js does', () => {
      // Node.js detects URL objects by shape (`href` and `origin`), not by
      // `instanceof`, so URL objects from other realms (e.g. `vm` contexts)
      // or WHATWG URL polyfills must take the URL code path as well. Their
      // properties commonly live on the prototype as getters, which the
      // options-object code path cannot see (`Object.assign` only copies own
      // enumerable properties) - taking the wrong path would misdirect the
      // request.
      const realUrl = new URL('http://u:p@google.fr:8181/aPath?qu=ry');
      const urlLike = Object.create({
        get href() {
          return realUrl.href;
        },
        get origin() {
          return realUrl.origin;
        },
        get protocol() {
          return realUrl.protocol;
        },
        get username() {
          return realUrl.username;
        },
        get password() {
          return realUrl.password;
        },
        get host() {
          return realUrl.host;
        },
        get hostname() {
          return realUrl.hostname;
        },
        get port() {
          return realUrl.port;
        },
        get pathname() {
          return realUrl.pathname;
        },
        get search() {
          return realUrl.search;
        },
        get hash() {
          return realUrl.hash;
        },
      });
      assert.strictEqual(urlLike instanceof url.URL, false);

      const result = utils.getRequestInfo(diag, urlLike);
      assert.strictEqual(result.optionsParsed.hostname, 'google.fr');
      assert.strictEqual(result.optionsParsed.protocol, 'http:');
      assert.strictEqual(result.optionsParsed.port, 8181);
      assert.strictEqual(result.optionsParsed.path, '/aPath?qu=ry');
      assert.strictEqual(result.pathname, '/aPath');
      assert.strictEqual(result.origin, 'http://google.fr:8181');
    });
  });

  describe('isURLLike()', () => {
    it('should match URL instances and URL-shaped objects', () => {
      assert.strictEqual(utils.isURLLike(new URL('http://google.fr')), true);
      // A cross-realm / polyfilled URL is recognised by shape: it carries
      // `href` and `protocol` but no `auth`/`path` (those live only on request
      // options and legacy parsed URLs).
      assert.strictEqual(
        utils.isURLLike({
          href: 'http://google.fr/',
          protocol: 'http:',
          origin: 'http://google.fr',
        }),
        true
      );
    });

    it('should not match strings, non-URL objects and legacy parsed URLs', () => {
      assert.strictEqual(utils.isURLLike('http://google.fr'), false);
      assert.strictEqual(utils.isURLLike(null), false);
      assert.strictEqual(utils.isURLLike(undefined), false);
      assert.strictEqual(utils.isURLLike({ hostname: 'google.fr' }), false);
      // an object that only carries `href` is not a URL and must not be
      // treated as one
      assert.strictEqual(utils.isURLLike({ href: 'http://google.fr/' }), false);
      // legacy url.parse() results have `href` and `protocol` but also `path`,
      // so they must keep taking the options-object code path
      assert.strictEqual(utils.isURLLike(url.parse('http://google.fr')), false);
      // getRequestInfo()'s own output sets `href`, `origin` and `path`; it is
      // an options object, not a URL, and must not be re-classified as one
      const parsedOptions = utils.getRequestInfo(
        diag,
        'http://google.fr/aPath?qu=ry'
      ).optionsParsed;
      assert.strictEqual(utils.isURLLike(parsedOptions), false);
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
      const result = utils.getAbsoluteUrl(
        {
          protocol: null,
          slashes: null,
          auth: null,
          host: null,
          port: null,
          hostname: null,
          hash: null,
          search: null,
          query: null as unknown as undefined,
          pathname: '/test/1',
          path: '/test/1',
          href: '/test/1',
        },
        {}
      );
      assert.strictEqual(result, `http://localhost${path}`);
    });
    it('should return absolute url', () => {
      const absUrl = 'http://www.google/test/1?query=1';
      const result = utils.getAbsoluteUrl(
        {
          protocol: 'http:',
          slashes: true,
          auth: null,
          host: 'www.google',
          port: null,
          hostname: 'www.google',
          hash: null,
          search: '?query=1',
          query: 'query=1' as unknown as ParsedUrlQuery,
          pathname: '/test/1',
          path: '/test/1?query=1',
          href: 'http://www.google/test/1?query=1',
        },
        {}
      );
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
    it('does not perform redaction if the provided path cannot be parsed', () => {
      const result = utils.getAbsoluteUrl(
        { path: 'http://?AWSAccessKeyId=secret123' },
        {}
      );
      assert.strictEqual(
        result,
        'http://localhosthttp://?AWSAccessKeyId=secret123'
      );
    });
    it('should ignore a non-string host and use hostname instead', () => {
      // Node.js accepts these options: when `hostname` is a valid string it
      // never looks at `host`. See
      // https://github.com/open-telemetry/opentelemetry-js/issues/6967
      const result = utils.getAbsoluteUrl(
        {
          host: new URL('http://stale.example.com'),
          hostname: 'www.google.com',
          path: '/test/1',
        } as unknown as ParsedRequestOptions,
        {}
      );
      assert.strictEqual(result, 'http://www.google.com/test/1');
    });
    it('should use the host header when neither host nor hostname is a string', () => {
      // Note: Node.js rejects a non-string `hostname` outright, so these exact
      // options do not produce a request. This pins the fallback order used
      // when deriving a best-effort URL, it does not claim Node.js accepts
      // them.
      const result = utils.getAbsoluteUrl(
        {
          host: 1234,
          hostname: new URL('http://stale.example.com'),
          path: '/test/1',
        } as unknown as ParsedRequestOptions,
        { host: 'www.google.com:8181' }
      );
      assert.strictEqual(result, 'http://www.google.com:8181/test/1');
    });
    it('should not throw on options that Node.js itself rejects', () => {
      // These options never reach the network: Node.js resolves the target as
      // `validateHost(hostname) || validateHost(host) || 'localhost'`, and
      // `validateHost` throws ERR_INVALID_ARG_TYPE for any non-string, non-null
      // value. With no usable `hostname`, the non-string `host` is validated and
      // rejected - a valid `host` header does not rescue it either.
      //
      // So there is no destination to report here, and the URL below is only
      // ever attached to an error span for a request that never left the
      // process. What matters is that the instrumentation does not throw first,
      // so the caller sees Node.js's own error rather than a TypeError from us.
      // The `localhost` value is this function's long-standing last resort (see
      // the 'should return default url' case above), not a claim about where
      // the request went.
      const result = utils.getAbsoluteUrl(
        {
          host: new URL('http://stale.example.com'),
          hostname: undefined,
          path: '/test/1',
        } as unknown as ParsedRequestOptions,
        { host: 1234 as unknown as string }
      );
      assert.strictEqual(result, 'http://localhost/test/1');
    });
    it('should not throw when path is not a string', () => {
      const result = utils.getAbsoluteUrl(
        {
          host: 'www.google.com',
          path: 1234,
        } as unknown as ParsedRequestOptions,
        {}
      );
      assert.strictEqual(result, 'http://www.google.com1234');
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
      mock.expects('setAttribute').calledWithExactly(ATTR_ERROR_TYPE, 'Error');
      mock.expects('setStatus').calledWithExactly({
        code: SpanStatusCode.ERROR,
        message: errorMessage,
      });
      mock.expects('recordException').calledWithExactly(error);

      utils.setSpanWithError(span, error);
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
    for (const options of [
      'url',
      url.urlToHttpOptions(new URL('http://url.com')),
      {},
    ]) {
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
      context.with(
        setRPCMetadata(context.active(), {
          type: RPCType.HTTP,
          route: '/user/:id',
          span: null as unknown as Span,
        }),
        () => {
          const attributes = utils.getIncomingRequestAttributesOnResponse(
            {} as ServerResponse
          );
          assert.deepStrictEqual(attributes[ATTR_HTTP_ROUTE], '/user/:id');
          context.disable();
          return done();
        }
      );
    });

    it('should successfully process without middleware stack', () => {
      const attributes = utils.getIncomingRequestAttributesOnResponse({
        socket: {},
      } as ServerResponse & { socket: Socket });
      assert.deepEqual(attributes[ATTR_HTTP_ROUTE], undefined);
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
          enableSyntheticSourceDetection: false,
        },
        diag
      );
      assert.strictEqual(attributes[ATTR_URL_PATH], '/user/');
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
    it('should capture attributes for request and response keys', () => {
      const reqAttrs = utils.headerCapture('request', ['Origin'])(
        () => 'localhost'
      );
      const resAttrs = utils.headerCapture('response', ['Cookie'])(
        () => 'token=123'
      );

      assert.deepStrictEqual(reqAttrs, {
        'http.request.header.origin': ['localhost'],
      });
      assert.deepStrictEqual(resAttrs, {
        'http.response.header.cookie': ['token=123'],
      });
    });

    it('should capture attributes for multiple values', () => {
      const attrs = utils.headerCapture('request', ['Origin'])(() => [
        'localhost',
        'www.example.com',
      ]);

      assert.deepStrictEqual(attrs, {
        'http.request.header.origin': ['localhost', 'www.example.com'],
      });
    });

    it('should capture attributes for multiple headers', () => {
      const attrs = utils.headerCapture('request', ['Origin', 'Foo'])(
        header => {
          if (header === 'origin') {
            return 'localhost';
          }

          if (header === 'foo') {
            return 42;
          }

          return undefined;
        }
      );

      assert.deepStrictEqual(attrs, {
        'http.request.header.origin': ['localhost'],
        'http.request.header.foo': [42],
      });
    });

    it('should normalize header names', () => {
      const attrs = utils.headerCapture('request', ['X-Forwarded-For'])(
        () => 'foo'
      );
      assert.deepStrictEqual(attrs, {
        'http.request.header.x-forwarded-for': ['foo'],
      });
    });

    it('ignores non-existent headers', () => {
      const attrs = utils.headerCapture('request', ['Origin', 'Accept'])(
        header => {
          if (header === 'origin') {
            return 'localhost';
          }

          return undefined;
        }
      );

      assert.deepStrictEqual(attrs, {
        'http.request.header.origin': ['localhost'],
      });
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

    it('should ignore a non-string host and use hostname instead', () => {
      // Node.js accepts these options: when `hostname` is a valid string it
      // never looks at `host`. See
      // https://github.com/open-telemetry/opentelemetry-js/issues/6967
      const { hostname, port } = extractHostnameAndPort({
        hostname: 'www.google.com',
        port: null,
        host: new URL('http://stale.example.com'),
        protocol: 'http:',
      } as unknown as ParsedRequestOptions);
      assert.strictEqual(hostname, 'www.google.com');
      assert.strictEqual(port, '80');
    });

    it('should derive host and port from the host field when hostname is not a string', () => {
      // Note: Node.js rejects a non-string `hostname` outright, so these exact
      // options do not produce a request. This pins the fallback order used
      // when deriving best-effort attributes, it does not claim Node.js accepts
      // them.
      const { hostname, port } = extractHostnameAndPort({
        hostname: new URL('http://stale.example.com'),
        port: null,
        host: 'www.google.com:8181',
        protocol: 'http:',
      } as unknown as ParsedRequestOptions);
      assert.strictEqual(hostname, 'www.google.com');
      assert.strictEqual(port, '8181');
    });

    it('should not throw on options that Node.js itself rejects', () => {
      // As above: a non-string `hostname` is rejected by Node.js outright
      // (it is the first value passed to `validateHost`), so this request
      // never reaches the network. The values below are the pre-existing
      // defaults used when no host information is available; they describe an
      // error span rather than a destination. The point of the test is that we
      // do not throw before Node.js gets to raise its own error.
      const { hostname, port } = extractHostnameAndPort({
        hostname: new URL('http://stale.example.com'),
        port: null,
        host: 1234,
        protocol: 'https:',
      } as unknown as ParsedRequestOptions);
      assert.strictEqual(hostname, 'localhost');
      assert.strictEqual(port, '443');
    });

    it('should ignore a port that is neither a string nor a number', () => {
      const { hostname, port } = extractHostnameAndPort({
        hostname: 'www.google.com',
        port: { value: 8181 },
        host: null,
        protocol: 'https:',
      } as unknown as ParsedRequestOptions);
      assert.strictEqual(hostname, 'www.google.com');
      assert.strictEqual(port, '443');
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

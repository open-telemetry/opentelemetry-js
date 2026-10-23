/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { strict as assert } from 'assert';
import type { ParsedUrlQuery } from 'node:querystring';
import type { ParsedRequestOptions } from '../../src/internal-types';
import {
  getAbsoluteUrl,
  parseHttpAuthority,
  parseHttpRequestTarget,
  redactQueryString,
} from '../../src/http-url';

describe('HTTP URL parsing', () => {
  describe('parseHttpAuthority()', () => {
    it('parses a host and port', () => {
      assert.deepStrictEqual(parseHttpAuthority(' example.test:8080 '), {
        value: 'example.test:8080',
        hostname: 'example.test',
        port: 8080,
      });
    });

    it('normalizes an empty port', () => {
      assert.deepStrictEqual(parseHttpAuthority('example.test:'), {
        value: 'example.test',
        hostname: 'example.test',
        port: undefined,
      });
    });

    it('parses IPv6 and IPvFuture literals', () => {
      assert.deepStrictEqual(parseHttpAuthority('[2001:db8::1]:8080'), {
        value: '[2001:db8::1]:8080',
        hostname: '2001:db8::1',
        port: 8080,
      });
      assert.deepStrictEqual(parseHttpAuthority('[v1.fe80]:8080'), {
        value: '[v1.fe80]:8080',
        hostname: 'v1.fe80',
        port: 8080,
      });
    });

    for (const value of [
      '',
      'user:secret@example.test',
      'example.test/path',
      'example.test?query',
      'example.test#fragment',
      'example.test:invalid',
      'example.test:65536',
      '2001:db8::1',
    ]) {
      it(`rejects ${JSON.stringify(value)}`, () => {
        assert.strictEqual(parseHttpAuthority(value), undefined);
      });
    }
  });

  describe('parseHttpRequestTarget()', () => {
    it('rejects a non-string request target', () => {
      assert.strictEqual(parseHttpRequestTarget(1234), undefined);
    });

    it('ignores a non-string method when parsing origin-form', () => {
      assert.deepStrictEqual(parseHttpRequestTarget('/path', 1234), {
        form: 'origin-form',
        pathname: '/path',
        search: '',
      });
    });

    it('parses an origin-form request target', () => {
      assert.deepStrictEqual(parseHttpRequestTarget('/path?query=value'), {
        form: 'origin-form',
        pathname: '/path',
        search: '?query=value',
      });
    });

    it('preserves a double-slash origin-form path', () => {
      assert.deepStrictEqual(parseHttpRequestTarget('//foo?x=1'), {
        form: 'origin-form',
        pathname: '//foo',
        search: '?x=1',
      });
    });

    it('preserves malformed percent escapes in an origin-form target', () => {
      assert.deepStrictEqual(parseHttpRequestTarget('/foo%GG?x=%'), {
        form: 'origin-form',
        pathname: '/foo%GG',
        search: '?x=%',
      });
    });

    it('does not normalize an origin-form path', () => {
      assert.deepStrictEqual(parseHttpRequestTarget('/a/../b\\c?x=1'), {
        form: 'origin-form',
        pathname: '/a/../b\\c',
        search: '?x=1',
      });
    });

    it('parses an asterisk-form request target with an empty URI path', () => {
      assert.deepStrictEqual(parseHttpRequestTarget('*'), {
        form: 'asterisk-form',
        pathname: '',
        search: '',
      });
    });

    it('parses an absolute-form request target', () => {
      assert.deepStrictEqual(
        parseHttpRequestTarget('https://[v1.fe80]:8443/path?query=value'),
        {
          form: 'absolute-form',
          authority: {
            value: '[v1.fe80]:8443',
            hostname: 'v1.fe80',
            port: 8443,
          },
          pathname: '/path',
          protocol: 'https:',
          search: '?query=value',
        }
      );
    });

    it('parses an authority-form request target for CONNECT', () => {
      assert.deepStrictEqual(
        parseHttpRequestTarget('example.test:8443', 'CONNECT'),
        {
          form: 'authority-form',
          authority: {
            value: 'example.test:8443',
            hostname: 'example.test',
            port: 8443,
          },
          pathname: '',
          search: '',
        }
      );
      assert.strictEqual(
        parseHttpRequestTarget('example.test:8443', 'GET'),
        undefined
      );
    });

    it('normalizes an empty port in an absolute-form target', () => {
      assert.deepStrictEqual(
        parseHttpRequestTarget('http://origin.example:/path'),
        {
          form: 'absolute-form',
          authority: {
            value: 'origin.example',
            hostname: 'origin.example',
            port: undefined,
          },
          pathname: '/path',
          protocol: 'http:',
          search: '',
        }
      );
    });

    it('rejects unsupported request-target forms', () => {
      assert.strictEqual(
        parseHttpRequestTarget('ftp://example.test/'),
        undefined
      );
      assert.strictEqual(parseHttpRequestTarget('relative'), undefined);
      assert.strictEqual(parseHttpRequestTarget('/path#fragment'), undefined);
    });
  });

  describe('getAbsoluteUrl()', () => {
    it('should return absolute url with localhost', () => {
      const path = '/test/1';
      const result = getAbsoluteUrl(
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
      const result = getAbsoluteUrl(
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
      const result = getAbsoluteUrl(null, {});
      assert.strictEqual(result, 'http://localhost/');
    });
    it("{ path: '/helloworld', port: 8080 } should return http://localhost:8080/helloworld", () => {
      const result = getAbsoluteUrl({ path: '/helloworld', port: 8080 }, {});
      assert.strictEqual(result, 'http://localhost:8080/helloworld');
    });
    it('should omit only the default port for the URL scheme', () => {
      const cases: Array<{
        options: ParsedRequestOptions;
        expected: string;
      }> = [
        {
          options: { protocol: 'http:', hostname: 'example.com', port: 80 },
          expected: 'http://example.com/',
        },
        {
          options: { protocol: 'https:', hostname: 'example.com', port: 443 },
          expected: 'https://example.com/',
        },
        {
          options: { protocol: 'https:', hostname: 'example.com', port: 80 },
          expected: 'https://example.com:80/',
        },
        {
          options: { protocol: 'http:', hostname: '::1', port: 443 },
          expected: 'http://[::1]:443/',
        },
      ];

      for (const { options, expected } of cases) {
        assert.strictEqual(getAbsoluteUrl(options, {}), expected);
      }
    });
    it('should preserve a bracketed IPv6 authority with a port', () => {
      const result = getAbsoluteUrl(
        {
          protocol: 'http:',
          host: '[::1]:8080',
          port: 9090,
          path: '/helloworld',
        },
        {}
      );
      assert.strictEqual(result, 'http://[::1]:8080/helloworld');
    });
    it('should return auth credentials as REDACTED to avoid leaking sensitive information', () => {
      const result = getAbsoluteUrl(
        { path: '/helloworld', port: 8080, auth: 'user:password' },
        {}
      );
      assert.strictEqual(
        result,
        'http://REDACTED:REDACTED@localhost:8080/helloworld'
      );
    });

    it('should use the normalized host when adding a separate port', () => {
      assert.strictEqual(
        getAbsoluteUrl(
          { host: 'example.test:', port: 8080, path: '/' },
          {},
          'http:'
        ),
        'http://example.test:8080/'
      );
      assert.strictEqual(
        getAbsoluteUrl({ host: '[::1]:', port: 8080, path: '/' }, {}, 'http:'),
        'http://[::1]:8080/'
      );
    });

    it('should reconstruct an authority-form CONNECT target', () => {
      assert.strictEqual(
        getAbsoluteUrl(
          {
            host: 'proxy.test:3128',
            method: 'CONNECT',
            path: 'example.test:443',
          },
          {},
          'http:'
        ),
        'http://example.test:443'
      );
    });
    it('should return auth credentials and particular query strings as REDACTED', () => {
      const result = getAbsoluteUrl(
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
      const result = getAbsoluteUrl(
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
    it('preserves the request path while redacting its query', () => {
      const result = getAbsoluteUrl(
        { path: '/a/../b?AWSAccessKeyId=secret123' },
        {}
      );
      assert.strictEqual(
        result,
        'http://localhost/a/../b?AWSAccessKeyId=REDACTED'
      );
    });
    it('redacts a query in a malformed request target', () => {
      const result = getAbsoluteUrl(
        { path: '/path?AWSAccessKeyId=secret123#fragment' },
        {}
      );
      assert.strictEqual(
        result,
        'http://localhost/path?AWSAccessKeyId=REDACTED'
      );
    });
    it('does not perform redaction if the provided path cannot be parsed', () => {
      const result = getAbsoluteUrl(
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
      const result = getAbsoluteUrl(
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
      const result = getAbsoluteUrl(
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
      const result = getAbsoluteUrl(
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
      const result = getAbsoluteUrl(
        {
          host: 'www.google.com',
          path: 1234,
        } as unknown as ParsedRequestOptions,
        {}
      );
      assert.strictEqual(result, 'http://www.google.com1234');
    });
  });

  describe('redactQueryString()', () => {
    it('redacts a matching parameter', () => {
      assert.strictEqual(
        redactQueryString('sig=secret&foo=bar', ['sig']),
        'sig=REDACTED&foo=bar'
      );
    });

    it('leaves non-matching parameters unchanged', () => {
      assert.strictEqual(
        redactQueryString('foo=bar&baz=qux', ['sig']),
        'foo=bar&baz=qux'
      );
    });

    it('redacts multiple parameters', () => {
      assert.strictEqual(
        redactQueryString('sig=a&AWSAccessKeyId=b&keep=c', [
          'sig',
          'AWSAccessKeyId',
        ]),
        'sig=REDACTED&AWSAccessKeyId=REDACTED&keep=c'
      );
    });

    it('returns the input unchanged when the list is empty', () => {
      assert.strictEqual(redactQueryString('sig=secret', []), 'sig=secret');
    });

    it('redacts a param with an empty value', () => {
      assert.strictEqual(
        redactQueryString('sig=&foo=bar', ['sig']),
        'sig=REDACTED&foo=bar'
      );
    });

    it('redacts all occurrences of a duplicated parameter', () => {
      assert.strictEqual(
        redactQueryString('sig=SECRET1&sig=SECRET2&foo=bar', ['sig']),
        'sig=REDACTED&foo=bar'
      );
    });

    it('preserves the query when no parameter needs redaction', () => {
      assert.strictEqual(redactQueryString('x=%', ['AWSAccessKeyId']), 'x=%');
    });
  });
});

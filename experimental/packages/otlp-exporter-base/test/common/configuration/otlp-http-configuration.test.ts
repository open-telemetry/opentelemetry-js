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
  mergeOtlpHttpConfigurationWithDefaults,
  OtlpHttpConfiguration,
} from '../../../src/configuration/otlp-http-configuration';
import * as assert from 'assert';
import { testSharedConfigBehavior } from './shared-configuration.test';

describe('mergeOtlpHttpConfigurationWithDefaults', function () {
  const testDefaults: OtlpHttpConfiguration = {
    url: 'http://default.example.test',
    timeoutMillis: 1,
    compression: 'none',
    concurrencyLimit: 2,
    headers: () => ({ 'User-Agent': 'default-user-agent' }),
    agentFactory: () => null!,
  };

  describe('headers', function () {
    it('merges headers instead of overriding', function () {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {
          headers: () => ({ foo: 'user' }),
        },
        {
          headers: () => ({ foo: 'fallback', bar: 'fallback' }),
        },
        testDefaults
      );
      assert.deepStrictEqual(config.headers(), {
        'User-Agent': 'default-user-agent',
        foo: 'user',
        bar: 'fallback',
      });
    });

    it('does not override default (required) header', function () {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {
          headers: () => ({ 'User-Agent': 'custom' }),
        },
        {
          headers: () => ({ 'User-Agent': 'custom-fallback' }),
        },
        testDefaults
      );
      assert.deepStrictEqual(config.headers(), {
        'User-Agent': 'default-user-agent',
      });
    });

    it('drops user-provided headers with undefined values', function () {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore simulating plain JavaScript usage, ignoring types
          headers: () => ({
            foo: 'foo-user-provided',
            bar: undefined,
            baz: null,
          }),
        },
        {},
        testDefaults
      );
      assert.deepStrictEqual(config.headers(), {
        foo: 'foo-user-provided',
        baz: 'null',
        'User-Agent': 'default-user-agent',
      });
    });
  });

  describe('url', function () {
    it('uses user provided url over fallback', function () {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {
          url: 'https://example.test/user-provided',
        },
        {
          url: 'https://example.test/fallback',
        },
        testDefaults
      );
      assert.strictEqual(config.url, 'https://example.test/user-provided');
    });

    it('uses fallback url over default', function () {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {},
        {
          url: 'https://example.test/fallback',
        },
        testDefaults
      );
      assert.strictEqual(config.url, 'https://example.test/fallback');
    });

    it('uses default if none other are specified', function () {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {},
        {},
        testDefaults
      );
      assert.strictEqual(config.url, testDefaults.url);
    });

    it('throws error when the user-provided url is not parseable', function () {
      assert.throws(() => {
        mergeOtlpHttpConfigurationWithDefaults(
          { url: 'this is not a URL' },
          {},
          testDefaults
        );
      }, new Error("Configuration: Could not parse user-provided export URL: 'this is not a URL'"));
    });

    it('allows relative URLs', function () {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        { url: './api/logs' },
        {},
        testDefaults
      );
      assert.strictEqual(config.url, './api/logs');
    });

    it('allows relative URLs with different formats', function () {
      const testCases = [
        './api/logs',
        '../logs',
        '/api/logs',
        'api/logs',
        './v1/logs',
        '../../../logs',
        './nested/path/logs',
        'simple-path',
        'path_with_underscores',
        'path-with-dashes',
        'path.with.dots',
        '123numeric',
        'a1b2c3',
        './api/logs/v1',
        '../parent/logs',
        '/absolute/from/root',
      ];

      testCases.forEach(relativeUrl => {
        const config = mergeOtlpHttpConfigurationWithDefaults(
          { url: relativeUrl },
          {},
          testDefaults
        );
        assert.strictEqual(config.url, relativeUrl);
      });
    });

    it('allows relative URLs with spaces in specific formats', function () {
      // URLs with spaces are allowed if they start with ./ ../ or /
      const validUrlsWithSpaces = [
        './api logs',
        '../parent logs',
        '/root logs',
      ];

      validUrlsWithSpaces.forEach(url => {
        const config = mergeOtlpHttpConfigurationWithDefaults(
          { url },
          {},
          testDefaults
        );
        assert.strictEqual(config.url, url);
      });
    });

    it('rejects relative URLs with spaces in invalid formats', function () {
      // URLs with spaces that don't start with ./ ../ or / should be rejected
      const invalidUrlsWithSpaces = [
        'api logs',
        'simple path with spaces',
        'invalid url format',
      ];

      invalidUrlsWithSpaces.forEach(url => {
        assert.throws(
          () => {
            mergeOtlpHttpConfigurationWithDefaults({ url }, {}, testDefaults);
          },
          new RegExp(
            `Configuration: Could not parse user-provided export URL: '${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`
          )
        );
      });
    });

    it('rejects URLs that do not match any valid pattern', function () {
      const invalidUrls = [
        '?invalid',
        '#hash',
        '@symbol',
        '*wildcard',
        '!exclamation',
        '%percent',
        '^caret',
        '&ampersand',
        '()parentheses',
        '{}braces',
        '[]brackets',
        '|pipe',
        '\\backslash',
        '"quotes"',
        "'single'",
        '<>brackets',
        '=equals',
        '+plus',
        '~tilde',
        '`backtick',
      ];

      invalidUrls.forEach(url => {
        assert.throws(
          () => {
            mergeOtlpHttpConfigurationWithDefaults({ url }, {}, testDefaults);
          },
          new RegExp(
            `Configuration: Could not parse user-provided export URL: '${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`
          )
        );
      });
    });

    it('handles null and undefined URLs correctly', function () {
      // Test null URL
      const configWithNull = mergeOtlpHttpConfigurationWithDefaults(
        { url: null as any },
        {},
        testDefaults
      );
      assert.strictEqual(configWithNull.url, testDefaults.url);

      // Test undefined URL
      const configWithUndefined = mergeOtlpHttpConfigurationWithDefaults(
        { url: undefined },
        {},
        testDefaults
      );
      assert.strictEqual(configWithUndefined.url, testDefaults.url);

      // Test missing URL property
      const configWithMissing = mergeOtlpHttpConfigurationWithDefaults(
        {},
        {},
        testDefaults
      );
      assert.strictEqual(configWithMissing.url, testDefaults.url);
    });

    it('prioritizes user URL over fallback URL', function () {
      const userUrl = './my-custom-path';
      const fallbackUrl = './fallback-path';

      const config = mergeOtlpHttpConfigurationWithDefaults(
        { url: userUrl },
        { url: fallbackUrl },
        testDefaults
      );
      assert.strictEqual(config.url, userUrl);
    });

    it('uses fallback URL when user URL is null', function () {
      const fallbackUrl = './fallback-path';

      const config = mergeOtlpHttpConfigurationWithDefaults(
        { url: null as any },
        { url: fallbackUrl },
        testDefaults
      );
      assert.strictEqual(config.url, fallbackUrl);
    });

    it('handles edge case URLs', function () {
      const edgeCaseUrls = [
        '.', // current directory
        '..', // parent directory
        '/', // root
        './.', // current directory with extra dot
        '../.', // parent directory with extra dot
        './..', // current then parent
        '../..', // multiple levels up
        './././', // multiple current directory references
        '../../../', // deep relative path
        'a', // single character
        '1', // single number
        '_', // single underscore
        '-', // single dash
        '.hidden', // hidden file style
        '..hidden', // hidden file with double dots
      ];

      edgeCaseUrls.forEach(url => {
        const config = mergeOtlpHttpConfigurationWithDefaults(
          { url },
          {},
          testDefaults
        );
        assert.strictEqual(config.url, url);
      });
    });

    it('validates absolute URLs properly', function () {
      const validUrls = [
        'http://localhost:4318',
        'https://example.com/api/logs',
        'http://192.168.1.1:8080/logs',
      ];

      validUrls.forEach(absoluteUrl => {
        const config = mergeOtlpHttpConfigurationWithDefaults(
          { url: absoluteUrl },
          {},
          testDefaults
        );
        assert.strictEqual(config.url, absoluteUrl);
      });
    });

    it('throws error for malformed absolute URLs', function () {
      const invalidUrls = [
        'http://',
        'https://[invalid',
        'http://[::1:8080', // malformed IPv6
      ];

      invalidUrls.forEach(invalidUrl => {
        assert.throws(
          () => {
            mergeOtlpHttpConfigurationWithDefaults(
              { url: invalidUrl },
              {},
              testDefaults
            );
          },
          new RegExp(
            `Configuration: Could not parse user-provided export URL: '${invalidUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`
          )
        );
      });
    });
  });

  testSharedConfigBehavior(
    mergeOtlpHttpConfigurationWithDefaults,
    testDefaults
  );
});

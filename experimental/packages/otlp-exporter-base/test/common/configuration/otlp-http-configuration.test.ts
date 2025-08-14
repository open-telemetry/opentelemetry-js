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
  });

  testSharedConfigBehavior(
    mergeOtlpHttpConfigurationWithDefaults,
    testDefaults
  );
});

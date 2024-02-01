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

import * as assert from 'assert';
import {
  mergeOtlpHttpConfigurationWithDefaults,
  OtlpHttpConfiguration,
} from '../src';

describe('mergeOtlpHttpConfigurationWithDefaults', function () {
  const testDefaults: OtlpHttpConfiguration = {
    url: 'default-url',
    timeoutMillis: 1,
    compression: 'none',
    concurrencyLimit: 2,
    headers: { 'User-Agent': 'default-user-agent' },
  };

  describe('headers', function () {
    it('merges headers instead of overriding', function () {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {
          headers: { foo: 'user' },
        },
        {
          headers: { foo: 'fallback', bar: 'fallback' },
        },
        testDefaults
      );
      assert.deepEqual(config.headers, {
        'User-Agent': 'default-user-agent',
        foo: 'user',
        bar: 'fallback',
      });
    });
    it('does not default header override', function () {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {
          headers: { 'User-Agent': 'custom' },
        },
        {
          headers: { 'User-Agent': 'custom-fallback' },
        },
        {
          url: 'default-url',
          timeoutMillis: 1,
          compression: 'none',
          concurrencyLimit: 2,
          headers: { 'User-Agent': 'default-user-agent' },
        }
      );
      assert.deepEqual(config.headers, {
        'User-Agent': 'default-user-agent',
      });
    });
  });

  describe('url', function () {
    it('uses user provided url over fallback', () => {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {
          url: 'https://example.com/user-provided',
        },
        {
          url: 'https://example.com/fallback',
        },
        testDefaults
      );
      assert.deepEqual(config.url, 'https://example.com/user-provided');
    });
    it('uses fallback url over default', () => {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {},
        {
          url: 'https://example.com/fallback',
        },
        testDefaults
      );
      assert.deepEqual(config.url, 'https://example.com/fallback');
    });
    it('uses default if none other are specified', () => {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {},
        {},
        testDefaults
      );
      assert.deepEqual(config.url, testDefaults.url);
    });
  });

  describe('timeout', function () {
    it('uses user provided timeout over fallback', () => {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {
          timeoutMillis: 222,
        },
        {
          timeoutMillis: 333,
        },
        testDefaults
      );
      assert.deepEqual(config.timeoutMillis, 222);
    });
    it('uses fallback timeout over default', () => {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {},
        {
          timeoutMillis: 444,
        },
        testDefaults
      );
      assert.deepEqual(config.timeoutMillis, 444);
    });
    it('uses default if none other are specified', () => {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {},
        {},
        testDefaults
      );
      assert.deepEqual(config.timeoutMillis, testDefaults.timeoutMillis);
    });

    it('throws when value is negative', function () {
      assert.throws(() =>
        mergeOtlpHttpConfigurationWithDefaults(
          { timeoutMillis: -1 },
          {},
          testDefaults
        )
      );
    });
  });

  describe('compression', function () {
    it('uses user provided compression over fallback', () => {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {
          compression: 'gzip',
        },
        {
          compression: 'none',
        },
        testDefaults
      );
      assert.deepEqual(config.compression, 'gzip');
    });
    it('uses fallback compression over default', () => {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {},
        {
          compression: 'gzip',
        },
        testDefaults
      );
      assert.deepEqual(config.compression, 'gzip');
    });
    it('uses default if none other are specified', () => {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {},
        {},
        testDefaults
      );
      assert.deepEqual(config.compression, testDefaults.compression);
    });
  });

  describe('concurrency limit', function () {
    it('uses user provided limit over fallback', () => {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {
          concurrencyLimit: 20,
        },
        {
          concurrencyLimit: 40,
        },
        testDefaults
      );
      assert.deepEqual(config.concurrencyLimit, 20);
    });
    it('uses fallback limit over default', () => {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {},
        {
          concurrencyLimit: 50,
        },
        testDefaults
      );
      assert.deepEqual(config.concurrencyLimit, 50);
    });
    it('uses default if none other are specified', () => {
      const config = mergeOtlpHttpConfigurationWithDefaults(
        {},
        {},
        testDefaults
      );
      assert.deepEqual(config.concurrencyLimit, testDefaults.concurrencyLimit);
    });
  });
});

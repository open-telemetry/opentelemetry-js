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
  mergeOtlpSharedConfigurationWithDefaults,
  OtlpSharedConfiguration,
} from '../../../src';

export function testSharedConfigBehavior<T extends OtlpSharedConfiguration>(
  sut: (
    userProvidedConfiguration: Partial<OtlpSharedConfiguration>,
    fallbackConfiguration: Partial<OtlpSharedConfiguration>,
    defaultConfiguration: T
  ) => OtlpSharedConfiguration,
  defaults: T
): void {
  // copy so that we don't modify the original and pollute other tests.
  const testDefaults = Object.assign({}, defaults);

  testDefaults.timeoutMillis = 1;
  testDefaults.compression = 'none';
  testDefaults.concurrencyLimit = 2;

  describe('timeout', function () {
    it('uses user provided timeout over fallback', () => {
      const config = sut(
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
      const config = sut(
        {},
        {
          timeoutMillis: 444,
        },
        testDefaults
      );
      assert.deepEqual(config.timeoutMillis, 444);
    });
    it('uses default if none other are specified', () => {
      const config = sut({}, {}, testDefaults);
      assert.deepEqual(config.timeoutMillis, testDefaults.timeoutMillis);
    });

    it('throws when value is negative', function () {
      assert.throws(() => sut({ timeoutMillis: -1 }, {}, testDefaults));
    });
  });

  describe('compression', function () {
    it('uses user provided compression over fallback', () => {
      const config = sut(
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
      const config = sut(
        {},
        {
          compression: 'gzip',
        },
        testDefaults
      );
      assert.deepEqual(config.compression, 'gzip');
    });
    it('uses default if none other are specified', () => {
      const config = sut({}, {}, testDefaults);
      assert.deepEqual(config.compression, testDefaults.compression);
    });
  });

  describe('concurrency limit', function () {
    it('uses user provided limit over fallback', () => {
      const config = sut(
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
      const config = sut(
        {},
        {
          concurrencyLimit: 50,
        },
        testDefaults
      );
      assert.deepEqual(config.concurrencyLimit, 50);
    });
    it('uses default if none other are specified', () => {
      const config = sut({}, {}, testDefaults);
      assert.deepEqual(config.concurrencyLimit, testDefaults.concurrencyLimit);
    });
  });
}

describe('mergeOtlpSharedConfigurationWithDefaults', function () {
  testSharedConfigBehavior(mergeOtlpSharedConfigurationWithDefaults, {
    timeoutMillis: 1,
    compression: 'none',
    concurrencyLimit: 2,
  });
});

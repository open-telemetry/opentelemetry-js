/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as assert from 'assert';
import {
  mergeOtlpHttpConfigurationWithDefaults,
  type OtlpHttpConfiguration,
} from '../../../src/configuration/otlp-http-configuration';

describe('mergeOtlpHttpConfigurationWithDefaults (browser)', function () {
  const testDefaults: OtlpHttpConfiguration = {
    url: 'http://default.example.test',
    timeoutMillis: 1,
    compression: 'none',
    concurrencyLimit: 2,
    headers: async () => ({ 'User-Agent': 'default-user-agent' }),
  };

  it('resolves user-provided relative url to document', function () {
    const configuration = mergeOtlpHttpConfigurationWithDefaults(
      { url: '/test' },
      {},
      testDefaults
    );
    const expectedHref = new URL('/test', window.location.href).href;
    assert.equal(configuration.url, expectedHref);
  });
});

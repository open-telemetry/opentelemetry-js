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

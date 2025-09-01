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
} from '../../../src/configuration/otlp-http-configuration';

describe('mergeOtlpHttpConfigurationWithDefaults (node)', function () {
  const testDefaults: OtlpHttpConfiguration = {
    url: 'http://default.example.test',
    timeoutMillis: 1,
    compression: 'none',
    concurrencyLimit: 2,
    headers: () => ({ 'User-Agent': 'default-user-agent' }),
    agentFactory: () => null!,
  };

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

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
import { mergeOtlpNodeHttpConfigurationWithDefaults } from '../../../src/configuration/otlp-node-http-configuration';
import { OtlpNodeHttpConfiguration } from '../../../src/configuration/otlp-node-http-configuration';

describe('mergeOtlpNodeHttpConfigurationWithDefaults', function () {
  const testDefaults: Required<OtlpNodeHttpConfiguration> = {
    url: 'http://default.example.test',
    timeoutMillis: 1,
    compression: 'none',
    concurrencyLimit: 2,
    headers: () => ({}),
    agentFactory: () => null!,
    userAgent: 'OTel-OTLP-Exporter-JavaScript/1.2.3',
  };

  it('throws error when the user-provided url is not parseable', function () {
    assert.throws(() => {
      mergeOtlpNodeHttpConfigurationWithDefaults(
        { url: 'this is not a URL' },
        {},
        testDefaults
      );
    }, new Error("Configuration: Could not parse user-provided export URL: 'this is not a URL'"));
  });

  it('merges user-agent from the provided config and defaults', function () {
    const config = mergeOtlpNodeHttpConfigurationWithDefaults(
      { userAgent: 'Custom-User-Agent/1.2.3' },
      {},
      testDefaults
    );

    assert.strictEqual(
      config.userAgent,
      'Custom-User-Agent/1.2.3 OTel-OTLP-Exporter-JavaScript/1.2.3'
    );
  });
});

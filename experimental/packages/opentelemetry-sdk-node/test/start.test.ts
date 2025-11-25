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
import { startNodeSDK } from '../src/start';
import { context, diag } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import * as Sinon from 'sinon';

describe('startNodeSDK', function () {
  const _origEnvVariables = { ...process.env };

  afterEach(function () {
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    for (const [key, value] of Object.entries(_origEnvVariables)) {
      process.env[key] = value;
    }
    Sinon.restore();
  });

  it('should return NOOP_SDK when disabled is true', () => {
    const info = Sinon.spy(diag, 'info');
    process.env.OTEL_SDK_DISABLED = 'true';
    const sdk = startNodeSDK({});

    Sinon.assert.calledWith(info, 'OpenTelemetry SDK is disabled');

    sdk.shutdown();
  });

  it('should return NOOP_SDK when disabled is true', () => {
    process.env.OTEL_EXPERIMENTAL_CONFIG_FILE =
      'test/fixtures/kitchen-sink.yaml';
    const sdk = startNodeSDK({});

    assertDefaultContextManagerRegistered();

    sdk.shutdown();
  });
});

function assertDefaultContextManagerRegistered() {
  assert.ok(
    context['_getContextManager']().constructor.name ===
      AsyncLocalStorageContextManager.name
  );
}

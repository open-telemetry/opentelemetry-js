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
import { NoopLogger } from '../../../src/experimental/NoopLogger';
import { NoopLoggerProvider } from '../../../src/experimental/NoopLoggerProvider';

describe('experimental NoopLoggerProvider', () => {
  it('should not crash', () => {
    const loggerProvider = new NoopLoggerProvider();

    assert.ok(loggerProvider.getLogger('logger-name') instanceof NoopLogger);
    assert.ok(
      loggerProvider.getLogger('logger-name', 'v1') instanceof NoopLogger
    );
    assert.ok(
      loggerProvider.getLogger('logger-name', 'v1', {
        schemaUrl: 'https://opentelemetry.io/schemas/1.7.0',
      }) instanceof NoopLogger
    );
  });
});

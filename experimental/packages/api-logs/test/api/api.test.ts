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
import { Logger, ProxyLoggerProvider, logs } from '../../src';
import { NoopLogger } from '../../src/NoopLogger';
import { NoopLoggerProvider } from '../../src/NoopLoggerProvider';

describe('API', () => {
  const dummyLogger = new NoopLogger();

  it('should expose a logger provider via getLoggerProvider', () => {
    assert.ok(logs.getLoggerProvider() instanceof ProxyLoggerProvider);
    assert.ok(
      (logs.getLoggerProvider() as ProxyLoggerProvider).getDelegate() instanceof
        NoopLoggerProvider
    );
  });

  describe('GlobalLoggerProvider', () => {
    beforeEach(() => {
      logs.disable();
    });

    it('should use the global logger provider', () => {
      logs.setGlobalLoggerProvider(new TestLoggerProvider());
      const logger = logs.getLoggerProvider().getLogger('name');
      assert.deepStrictEqual(logger, dummyLogger);
    });

    it('should not allow overriding global provider if already set', () => {
      const provider1 = new TestLoggerProvider();
      const provider2 = new TestLoggerProvider();
      logs.setGlobalLoggerProvider(provider1);
      assert.equal(logs.getLoggerProvider(), provider1);
      logs.setGlobalLoggerProvider(provider2);
      assert.equal(logs.getLoggerProvider(), provider1);
    });
  });

  describe('getLogger', () => {
    beforeEach(() => {
      logs.disable();
    });

    it('should return a logger instance from global provider', () => {
      logs.setGlobalLoggerProvider(new TestLoggerProvider());
      const logger = logs.getLogger('myLogger');
      assert.deepStrictEqual(logger, dummyLogger);
    });
  });

  class TestLoggerProvider extends NoopLoggerProvider {
    override getLogger(): Logger {
      return dummyLogger;
    }
  }
});

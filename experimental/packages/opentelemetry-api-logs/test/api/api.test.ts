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
import { Logger, logs, NoopLogger, NoopLoggerProvider } from '../../src';

describe('API', () => {
  const dummyLogger = new NoopLogger();

  it('should expose a logger provider via getLoggerProvider', () => {
    const provider = logs.getLoggerProvider();
    assert.ok(provider);
    assert.strictEqual(typeof provider, 'object');
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

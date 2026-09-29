/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { logs } from '../../../../src/logs-api';
import type { Logger } from '../../../../src/logs/Logger';
import { ProxyLoggerProvider } from '../../../../src/logs/ProxyLoggerProvider';
import { NoopLogger } from '../../../../src/logs/NoopLogger';
import { NoopLoggerProvider } from '../../../../src/logs/NoopLoggerProvider';

describe('API', () => {
  const dummyLogger = new NoopLogger();

  it('should expose a logger provider via getLoggerProvider', () => {
    assert.ok(logs.getLoggerProvider() instanceof ProxyLoggerProvider);
    assert.ok(
      (
        logs.getLoggerProvider() as ProxyLoggerProvider
      )._getDelegate() instanceof NoopLoggerProvider
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
      assert.strictEqual(logs.setGlobalLoggerProvider(provider1), true);
      assert.strictEqual(logs.setGlobalLoggerProvider(provider2), false);
      assert.strictEqual(logs.getLoggerProvider(), provider1);
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

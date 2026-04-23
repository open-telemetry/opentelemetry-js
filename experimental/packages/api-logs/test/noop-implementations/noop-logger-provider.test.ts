/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { NoopLogger } from '../../src/NoopLogger';
import { NoopLoggerProvider } from '../../src/NoopLoggerProvider';

describe('NoopLoggerProvider', () => {
  const loggerProvider = new NoopLoggerProvider();

  it('should not crash', () => {
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

  describe('LoggerOptions#attributes (LogAttributes)', () => {
    it('should accept attributes with primitive values', () => {
      const logger = loggerProvider.getLogger('logger-name', undefined, {
        attributes: {
          'service.name': 'api',
          version: 1,
          enabled: true,
        },
      });
      assert.ok(logger instanceof NoopLogger);
    });

    it('should accept attributes with LogAttribute value types', () => {
      const logger = loggerProvider.getLogger('logger-name', undefined, {
        attributes: {
          scalar: 'value',
          number: 42,
          bool: true,
          arr: [1, 2, 3],
          nested: { key: 'value' },
          bytes: new Uint8Array([1, 2, 3]),
          nullVal: null,
        },
      });
      assert.ok(logger instanceof NoopLogger);
    });
  });
});

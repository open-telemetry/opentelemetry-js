/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { NoopLogger } from '../../src/NoopLogger';
import { NoopLoggerProvider } from '../../src/NoopLoggerProvider';

describe('NoopLoggerProvider', () => {
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

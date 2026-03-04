/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { SeverityNumber } from '../../src';
import { NoopLogger } from '../../src/NoopLogger';
import { NoopLoggerProvider } from '../../src/NoopLoggerProvider';

describe('NoopLogger', () => {
  it('constructor should not crash', () => {
    const logger = new NoopLoggerProvider().getLogger('test-noop');
    assert.ok(logger instanceof NoopLogger);
  });

  it('calling emit should not crash', () => {
    const logger = new NoopLoggerProvider().getLogger('test-noop');
    logger.emit({
      severityNumber: SeverityNumber.TRACE,
      body: 'log body',
    });
  });
});

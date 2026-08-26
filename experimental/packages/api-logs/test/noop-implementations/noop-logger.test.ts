/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { SeverityNumber } from '../../src';
import { NoopLoggerProvider } from '../../src/NoopLoggerProvider';

describe('NoopLogger', () => {
  it('calling emit should not crash', () => {
    const logger = new NoopLoggerProvider().getLogger('test-noop');
    logger.emit({
      severityNumber: SeverityNumber.TRACE,
      body: 'log body',
    });
  });

  it('calling enabled should return false', () => {
    const logger = new NoopLoggerProvider().getLogger('test-noop');
    assert.ok(!logger.enabled());
  });
});

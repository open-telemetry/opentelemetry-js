/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { createHook } from 'async_hooks';
import {
  BatchLogRecordProcessor,
  InMemoryLogRecordExporter,
} from '../../../src';

describe('BatchLogRecordProcessor', () => {
  it('uses linear promise work for many overlapping flush calls', async () => {
    const processor = new BatchLogRecordProcessor({
      exporter: new InMemoryLogRecordExporter(),
    });
    const callers = 128;
    let promises = 0;
    const hook = createHook({
      init(_asyncId, type) {
        if (type === 'PROMISE') {
          promises++;
        }
      },
    });
    hook.enable();
    try {
      await Promise.all(
        Array.from({ length: callers }, () => processor.forceFlush())
      );
    } finally {
      hook.disable();
      await processor.shutdown();
    }
    // Leave room for runtime overhead while rejecting quadratic waiter retries.
    assert.ok(
      promises < callers * 16,
      `${promises} promises for ${callers} calls`
    );
  });
});

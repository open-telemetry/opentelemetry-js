/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import type { LogRecordProcessor } from '../../src';
import { MultiLogRecordProcessor } from '../../src/MultiLogRecordProcessor';

describe('MultiLogRecordProcessor attempt-all lifecycle', () => {
  it('rejects shutdown after attempting every processor', async () => {
    const error = new Error('logs shutdown failure');
    let firstCalls = 0;
    let secondCalls = 0;
    const first: LogRecordProcessor = {
      onEmit() {},
      forceFlush: () => Promise.resolve(),
      shutdown: () => {
        firstCalls += 1;
        throw error;
      },
    };
    const second: LogRecordProcessor = {
      onEmit() {},
      forceFlush: () => Promise.resolve(),
      shutdown: () => {
        secondCalls += 1;
        return Promise.resolve();
      },
    };
    const processor = new MultiLogRecordProcessor([first, second]);

    await assert.rejects(
      processor.shutdown(),
      candidate => candidate === error
    );
    assert.strictEqual(firstCalls, 1);
    assert.strictEqual(secondCalls, 1);
  });

  it('uses the opening processor snapshot during shutdown', async () => {
    const processors: LogRecordProcessor[] = [];
    let secondCalls = 0;
    const first: LogRecordProcessor = {
      onEmit() {},
      forceFlush: () => Promise.resolve(),
      shutdown: () => {
        processors.splice(1, 1);
        return Promise.resolve();
      },
    };
    const second: LogRecordProcessor = {
      onEmit() {},
      forceFlush: () => Promise.resolve(),
      shutdown: () => {
        secondCalls += 1;
        return Promise.resolve();
      },
    };
    processors.push(first, second);

    await new MultiLogRecordProcessor(processors).shutdown();

    assert.strictEqual(secondCalls, 1);
    assert.deepStrictEqual(processors, [first]);
  });

  it('rejects forceFlush after attempting every processor', async () => {
    const error = new Error('logs forceFlush failure');
    let firstCalls = 0;
    let secondCalls = 0;
    const first: LogRecordProcessor = {
      onEmit() {},
      shutdown: () => Promise.resolve(),
      forceFlush: () => {
        firstCalls += 1;
        throw error;
      },
    };
    const second: LogRecordProcessor = {
      onEmit() {},
      shutdown: () => Promise.resolve(),
      forceFlush: () => {
        secondCalls += 1;
        return Promise.resolve();
      },
    };
    const processor = new MultiLogRecordProcessor([first, second]);

    await assert.rejects(
      processor.forceFlush(),
      candidate => candidate === error
    );
    assert.strictEqual(firstCalls, 1);
    assert.strictEqual(secondCalls, 1);
  });

  it('uses the opening processor snapshot during forceFlush', async () => {
    const processors: LogRecordProcessor[] = [];
    let secondCalls = 0;
    const first: LogRecordProcessor = {
      onEmit() {},
      shutdown: () => Promise.resolve(),
      forceFlush: () => {
        processors.splice(1, 1);
        return Promise.resolve();
      },
    };
    const second: LogRecordProcessor = {
      onEmit() {},
      shutdown: () => Promise.resolve(),
      forceFlush: () => {
        secondCalls += 1;
        return Promise.resolve();
      },
    };
    processors.push(first, second);

    await new MultiLogRecordProcessor(processors).forceFlush();

    assert.strictEqual(secondCalls, 1);
    assert.deepStrictEqual(processors, [first]);
  });
});

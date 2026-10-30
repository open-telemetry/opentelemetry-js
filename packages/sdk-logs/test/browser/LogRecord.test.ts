/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { HrTime } from '@opentelemetry/api';
import {
  checkClockDrift,
  hrTime,
  hrTimeToMilliseconds,
} from '@opentelemetry/core';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  InMemoryLogRecordExporter,
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '../../src';

const SLEEP_MS = 60_000;
// The disagreement between the clocks when core loaded moves the times below
// that include a sleep by the same few milliseconds.
const TOLERANCE_MS = 100;

// Node.js runs this file too, and core only follows sleeps in browsers.
const describeBrowser = typeof document === 'object' ? describe : describe.skip;

describeBrowser('LogRecord (browser)', () => {
  const exporter = new InMemoryLogRecordExporter();
  const loggerProvider = new LoggerProvider({
    processors: [new SimpleLogRecordProcessor({ exporter })],
  });
  const logger = loggerProvider.getLogger('test');

  const emitted = async () => {
    await loggerProvider.forceFlush();
    return exporter.getFinishedLogRecords()[0];
  };

  const assertNear = (time: HrTime, expectedMillis: number) => {
    const millis = hrTimeToMilliseconds(time);
    assert.ok(
      Math.abs(millis - expectedMillis) < TOLERANCE_MS,
      `${millis} is not near ${expectedMillis}`
    );
  };

  // Core's clock is shared by every test in this bundle and keeps the sleeps
  // simulated here. Each test runs on its own stretch of performance.now()
  // values, above the previous test's and far above the real one, from the
  // time origin core already has there, so earlier sleeps don't count.
  let stretch = 1e10;
  let timeOrigin: number;
  let at: (value: number, sleptMs?: number) => void;

  beforeEach(() => {
    exporter.reset();
    stretch += 1e6;
    timeOrigin = hrTimeToMilliseconds(hrTime(stretch)) - stretch;
    const performanceNow = sinon.stub(performance, 'now');
    const wallNow = sinon.stub(Date, 'now');
    at = (value, sleptMs = 0) => {
      performanceNow.returns(stretch + value);
      wallNow.returns(timeOrigin + stretch + value + sleptMs);
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  // A performance.now() value in this test's stretch.
  const offset = (value: number) => stretch + value;
  // The wall-clock time of an offset, after sleeping `sleptMs` before it.
  const wallTime = (value: number, sleptMs = 0) =>
    timeOrigin + stretch + value + sleptMs;

  describe('without a sleep', () => {
    it('converts performance.now() timestamps', async () => {
      at(400);
      logger.emit({
        body: 'log',
        timestamp: offset(300),
        observedTimestamp: offset(350),
      });

      const logRecord = await emitted();
      assertNear(logRecord.hrTime, wallTime(300));
      assertNear(logRecord.hrTimeObserved, wallTime(350));
    });
  });

  // The host sleeps for a minute: performance.now() barely moves while
  // Date.now() moves on by SLEEP_MS.
  describe('after a sleep', () => {
    it('stamps a log without a timestamp with Date.now(), sleep included', async () => {
      at(0);
      checkClockDrift();
      at(500, SLEEP_MS);
      logger.emit({ body: 'log' });

      const logRecord = await emitted();
      assertNear(logRecord.hrTime, wallTime(500, SLEEP_MS));
    });

    it('moves a timestamp taken after the first clock check after waking forward by the sleep', async () => {
      at(0);
      checkClockDrift();
      at(500, SLEEP_MS);
      checkClockDrift();
      at(600, SLEEP_MS);
      logger.emit({ body: 'log', timestamp: offset(550) });

      const logRecord = await emitted();
      assertNear(logRecord.hrTime, wallTime(550, SLEEP_MS));
    });

    it('keeps a timestamp taken before the sleep', async () => {
      at(0);
      checkClockDrift();
      at(500, SLEEP_MS);
      logger.emit({ body: 'log', timestamp: offset(-100) });

      const logRecord = await emitted();
      assertNear(logRecord.hrTime, wallTime(-100));
    });

    it('leaves a timestamp taken after waking, before any clock check, early by the sleep', async () => {
      at(0);
      checkClockDrift();
      // Taken at 400 after waking. Converting it is the first clock check
      // after the sleep, so it falls before the sleep is known.
      at(500, SLEEP_MS);
      logger.emit({ body: 'log', timestamp: offset(400) });

      const logRecord = await emitted();
      assertNear(logRecord.hrTime, wallTime(400));
    });
  });
});

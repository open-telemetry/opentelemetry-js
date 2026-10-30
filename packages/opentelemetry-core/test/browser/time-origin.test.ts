/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import { TimeOriginHistory } from '../../src/platform/browser/time-origin';

const TIME_ORIGIN = 1_700_000_000_000;
const SLEEP_MS = 60_000;

describe('TimeOriginHistory', () => {
  it('keeps timeOrigin while the clocks agree', () => {
    const history = new TimeOriginHistory(
      TIME_ORIGIN,
      1000,
      TIME_ORIGIN + 1000
    );
    // Up to the threshold, a lead is not a sleep.
    history.check(5000, TIME_ORIGIN + 5000 + 1000);

    assert.strictEqual(history.getTimeOrigin(0), TIME_ORIGIN);
    assert.strictEqual(history.getTimeOrigin(5000), TIME_ORIGIN);
  });

  it('keeps a disagreement that was there at startup', () => {
    const history = new TimeOriginHistory(
      TIME_ORIGIN,
      1000,
      TIME_ORIGIN + 1000 + 5000
    );
    history.check(2000, TIME_ORIGIN + 2000 + 5000);

    assert.strictEqual(history.getTimeOrigin(2000), TIME_ORIGIN);
  });

  it('starts a segment at the first check after a sleep', () => {
    const history = new TimeOriginHistory(
      TIME_ORIGIN,
      1000,
      TIME_ORIGIN + 1000
    );
    history.check(1500, TIME_ORIGIN + 1500 + SLEEP_MS);

    assert.strictEqual(history.getTimeOrigin(1499), TIME_ORIGIN);
    assert.strictEqual(history.getTimeOrigin(1500), TIME_ORIGIN + SLEEP_MS);
    assert.strictEqual(history.getTimeOrigin(9000), TIME_ORIGIN + SLEEP_MS);
  });

  it('measures each sleep from the segment before it', () => {
    const history = new TimeOriginHistory(
      TIME_ORIGIN,
      1000,
      TIME_ORIGIN + 1000
    );
    history.check(1500, TIME_ORIGIN + 1500 + SLEEP_MS);
    history.check(2000, TIME_ORIGIN + 2000 + SLEEP_MS + 30_000);

    assert.strictEqual(history.getTimeOrigin(1200), TIME_ORIGIN);
    assert.strictEqual(history.getTimeOrigin(1700), TIME_ORIGIN + SLEEP_MS);
    assert.strictEqual(
      history.getTimeOrigin(2000),
      TIME_ORIGIN + SLEEP_MS + 30_000
    );
  });

  it('ignores a wall clock that steps back', () => {
    const history = new TimeOriginHistory(
      TIME_ORIGIN,
      1000,
      TIME_ORIGIN + 1000
    );
    history.check(2000, TIME_ORIGIN + 2000 - SLEEP_MS);

    assert.strictEqual(history.getTimeOrigin(2000), TIME_ORIGIN);
  });

  it('counts a sleep only between values outside the checks around it', () => {
    const history = new TimeOriginHistory(
      TIME_ORIGIN,
      1000,
      TIME_ORIGIN + 1000
    );
    history.check(1200, TIME_ORIGIN + 1200);
    history.check(1505, TIME_ORIGIN + 1505 + SLEEP_MS);

    assert.strictEqual(history.getSleepBetween(1100, 1600), SLEEP_MS);
    assert.strictEqual(history.getSleepBetween(1200, 1505), SLEEP_MS);
    // 1300 and 1502 fall between the checks, on an unknown side of the sleep.
    assert.strictEqual(history.getSleepBetween(1300, 1600), 0);
    assert.strictEqual(history.getSleepBetween(1100, 1502), 0);
    assert.strictEqual(history.getSleepBetween(1600, 2000), 0);
  });

  it('adds up the sleeps between two values', () => {
    const history = new TimeOriginHistory(
      TIME_ORIGIN,
      1000,
      TIME_ORIGIN + 1000
    );
    history.check(1500, TIME_ORIGIN + 1500 + SLEEP_MS);
    history.check(2000, TIME_ORIGIN + 2000 + SLEEP_MS + 30_000);

    assert.strictEqual(history.getSleepBetween(900, 2100), SLEEP_MS + 30_000);
    assert.strictEqual(history.getSleepBetween(1500, 2100), 30_000);
  });

  it('drops the oldest sleep, not the first segment, past 100 segments', () => {
    const history = new TimeOriginHistory(
      TIME_ORIGIN,
      1000,
      TIME_ORIGIN + 1000
    );
    for (let sleep = 1; sleep <= 101; sleep++) {
      const performanceNow = 1000 + sleep * 1000;
      history.check(
        performanceNow,
        TIME_ORIGIN + performanceNow + sleep * SLEEP_MS
      );
    }

    // 102 segments were started; the first two sleeps were dropped.
    assert.strictEqual(history.getTimeOrigin(500), TIME_ORIGIN);
    assert.strictEqual(history.getTimeOrigin(2000), TIME_ORIGIN);
    assert.strictEqual(history.getTimeOrigin(3000), TIME_ORIGIN);
    assert.strictEqual(history.getTimeOrigin(4000), TIME_ORIGIN + 3 * SLEEP_MS);
    assert.strictEqual(
      history.getTimeOrigin(102_000),
      TIME_ORIGIN + 101 * SLEEP_MS
    );
  });
});

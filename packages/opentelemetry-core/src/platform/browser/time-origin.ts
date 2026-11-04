/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Browsers on macOS, Linux, Android and iOS stop performance.now() while the
// host sleeps, but Date.now() keeps counting, so timeOrigin + performance.now()
// falls behind the wall clock by the time asleep. Only a lead over this
// threshold is taken as a sleep, so a host that never sleeps keeps its times.
const SLEEP_THRESHOLD_MS = 1000;
// Bounds memory on a page that sleeps many times.
const MAX_SEGMENTS = 100;

interface Segment {
  /** performance.now() at the last check before the sleep. */
  previousCheck: number;
  /** performance.now() at the first check after the sleep. */
  start: number;
  /** Time asleep, in milliseconds. */
  slept: number;
  /** Epoch milliseconds at performance.now() === 0 for offsets in this segment. */
  timeOrigin: number;
}

/**
 * The time origin each performance.now() offset was taken under. A segment
 * starts at the first check that finds the wall clock ahead by more than the
 * threshold. performance.now() barely moves during a sleep, so an offset from
 * before the sleep is below that check and keeps the origin from before it.
 * An offset taken after waking but before the check also keeps that origin.
 */
export class TimeOriginHistory {
  private readonly _segments: Segment[];
  // Date.now() and timeOrigin + performance.now() can already disagree at
  // startup; only growth beyond that is a sleep.
  private readonly _baselineDrift: number;
  private _lastCheck: number;

  constructor(timeOrigin: number, performanceNow: number, wallNow: number) {
    this._segments = [{ previousCheck: 0, start: 0, slept: 0, timeOrigin }];
    this._baselineDrift = wallNow - (timeOrigin + performanceNow);
    this._lastCheck = performanceNow;
  }

  check(performanceNow: number, wallNow: number): void {
    const latest = this._segments[this._segments.length - 1];
    const lead =
      wallNow - (latest.timeOrigin + performanceNow) - this._baselineDrift;

    // Forward only: a wall clock stepping back is not a sleep, and following
    // it would let hrTime() go backwards.
    if (lead > SLEEP_THRESHOLD_MS) {
      this._segments.push({
        previousCheck: this._lastCheck,
        start: performanceNow,
        slept: lead,
        timeOrigin: latest.timeOrigin + lead,
      });
      if (this._segments.length > MAX_SEGMENTS) {
        // The first segment holds what happened before the first sleep, such
        // as navigation timing, so the oldest sleep goes instead.
        this._segments.splice(1, 1);
      }
    }
    this._lastCheck = performanceNow;
  }

  getTimeOrigin(performanceNow: number): number {
    for (let i = this._segments.length - 1; i > 0; i--) {
      if (this._segments[i].start <= performanceNow) {
        return this._segments[i].timeOrigin;
      }
    }
    return this._segments[0].timeOrigin;
  }

  /**
   * A sleep happened somewhere between the checks around it, so it counts
   * only when `from` is at or before the check before it and `to` at or after
   * the check after it.
   */
  getSleepBetween(from: number, to: number): number {
    let slept = 0;
    for (const segment of this._segments) {
      if (from <= segment.previousCheck && segment.start <= to) {
        slept += segment.slept;
      }
    }
    return slept;
  }
}

// timeOrigin is read once: Safari moves it forward by the time asleep, which
// would move times from before the sleep forward too.
const timeOriginHistory = new TimeOriginHistory(
  performance.timeOrigin,
  performance.now(),
  Date.now()
);

/**
 * Checks whether the host slept since the last check. In browsers,
 * performance.now() can stop while the host sleeps; values read after this
 * check then get a time origin moved forward by the time asleep. Call it before
 * reading the performance.now() value to convert. Does nothing in Node.js.
 */
export function checkClockDrift(): void {
  timeOriginHistory.check(performance.now(), Date.now());
}

/**
 * Returns the epoch milliseconds that `performanceNow`, a performance.now()
 * value, counts from: performance.timeOrigin, moved forward in browsers by any
 * time the host slept before the value was taken.
 */
export function getTimeOrigin(performanceNow: number): number {
  return timeOriginHistory.getTimeOrigin(performanceNow);
}

/**
 * Returns the milliseconds the host slept between two performance.now()
 * values, `from` before `to`. A sleep is only known to have happened between
 * the clock checks around it, so one that may fall outside the two values does
 * not count. Always 0 in Node.js.
 */
export function getSleepBetween(from: number, to: number): number {
  return timeOriginHistory.getSleepBetween(from, to);
}

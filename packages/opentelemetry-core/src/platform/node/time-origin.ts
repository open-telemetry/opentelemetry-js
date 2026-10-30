/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Servers don't sleep, so Node.js keeps timeOrigin + performance.now(). The
// browser implementation re-anchors to the wall clock after the host sleeps.

/**
 * Checks whether the host slept since the last check. In browsers,
 * performance.now() can stop while the host sleeps; values read after this
 * check then get a time origin moved forward by the time asleep. Call it before
 * reading the performance.now() value to convert. Does nothing in Node.js.
 */
export function checkClockDrift(): void {}

/**
 * Returns the epoch milliseconds that `performanceNow`, a performance.now()
 * value, counts from: performance.timeOrigin, moved forward in browsers by any
 * time the host slept before the value was taken.
 */
export function getTimeOrigin(_performanceNow: number): number {
  return performance.timeOrigin;
}

/**
 * Returns the milliseconds the host slept between two performance.now()
 * values, `from` before `to`. A sleep is only known to have happened between
 * the clock checks around it, so one that may fall outside the two values does
 * not count. Always 0 in Node.js.
 */
export function getSleepBetween(_from: number, _to: number): number {
  return 0;
}

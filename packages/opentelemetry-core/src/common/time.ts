/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type * as api from '@opentelemetry/api';

const NANOSECOND_DIGITS = 9;
const NANOSECOND_DIGITS_IN_MILLIS = 6;
const MILLISECONDS_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS_IN_MILLIS);
const SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);

/**
 * Converts a number of milliseconds from epoch to HrTime([seconds, remainder in nanoseconds]).
 * @param epochMillis
 */
export function millisToHrTime(epochMillis: number): api.HrTime {
  const epochSeconds = epochMillis / 1000;
  // Decimals only.
  const seconds = Math.trunc(epochSeconds);
  // Round sub-nanosecond accuracy to nanosecond.
  const nanos = Math.round((epochMillis % 1000) * MILLISECONDS_TO_NANOSECONDS);
  return [seconds, nanos];
}

// performance.now() can stop advancing while the host sleeps, and Date.now()
// can step; past this divergence the wall clock wins.
const CLOCK_DRIFT_THRESHOLD_MS = 1000;
// Bounds memory. Timestamps older than the oldest kept segment take its drift.
const MAX_CLOCK_DRIFT_SEGMENTS = 16;

interface ClockDriftSegment {
  startPerformanceNow: number;
  driftMs: number;
}

// Ordered by startPerformanceNow. A segment starts at the first read after the
// clocks diverge.
const clockDriftSegments: ClockDriftSegment[] = [
  { startPerformanceNow: 0, driftMs: 0 },
];

function updateClockDrift(currentPerformanceNow: number): void {
  const drift = Date.now() - (performance.timeOrigin + currentPerformanceNow);
  const latest = clockDriftSegments[clockDriftSegments.length - 1];
  if (Math.abs(drift - latest.driftMs) <= CLOCK_DRIFT_THRESHOLD_MS) {
    return;
  }
  // Keep the list ordered if a segment already starts at or after this read.
  while (
    clockDriftSegments.length > 0 &&
    clockDriftSegments[clockDriftSegments.length - 1].startPerformanceNow >=
      currentPerformanceNow
  ) {
    clockDriftSegments.pop();
  }
  clockDriftSegments.push({
    startPerformanceNow: currentPerformanceNow,
    driftMs: drift,
  });
  if (clockDriftSegments.length > MAX_CLOCK_DRIFT_SEGMENTS) {
    clockDriftSegments.shift();
  }
}

function getClockDrift(performanceNow: number): number {
  for (let i = clockDriftSegments.length - 1; i > 0; i--) {
    if (clockDriftSegments[i].startPerformanceNow <= performanceNow) {
      return clockDriftSegments[i].driftMs;
    }
  }
  return clockDriftSegments[0].driftMs;
}

/**
 * Returns an hrtime calculated via performance component.
 *
 * The result is re-anchored to `Date.now()` when the performance clock and the
 * wall clock diverge by more than one second, for example after the host
 * sleeps. A passed `performanceNow` gets the correction that applied when it
 * was taken, so a timestamp from before a sleep is not moved by that sleep.
 *
 * @param performanceNow
 */
export function hrTime(performanceNow?: number): api.HrTime {
  const currentPerformanceNow = performance.now();
  updateClockDrift(currentPerformanceNow);
  const now =
    typeof performanceNow === 'number' ? performanceNow : currentPerformanceNow;
  const timeOrigin = millisToHrTime(
    performance.timeOrigin + getClockDrift(now)
  );

  return addHrTimes(timeOrigin, millisToHrTime(now));
}

/**
 *
 * Converts a TimeInput to an HrTime, defaults to _hrtime().
 * @param time
 */
export function timeInputToHrTime(time: api.TimeInput): api.HrTime {
  // process.hrtime
  if (isTimeInputHrTime(time)) {
    return time as api.HrTime;
  } else if (typeof time === 'number') {
    // Distinguish between a relative performance.now() value and an absolute
    // epoch-millisecond timestamp.
    //
    // performance.timeOrigin uses a monotonic clock that may be slightly ahead
    // of Date.now() due to clock adjustments (see MDN docs). This means a
    // real epoch-ms value (e.g. Date.now()) can land just below
    // performance.timeOrigin, causing it to be misclassified as a relative
    // performance.now() reading and doubled when timeOrigin is added.
    //
    // A genuine performance.now() value represents elapsed time since the
    // document/process started, so it is bounded by system uptime. No real
    // system has been running long enough for performance.now() to reach half
    // the current epoch time (~1994 in ms terms). We therefore treat any value
    // below half of performance.timeOrigin as a relative performance.now()
    // reading, and everything else as an absolute epoch-millisecond timestamp.
    if (time < performance.timeOrigin / 2) {
      return hrTime(time);
    } else {
      // epoch milliseconds or performance.timeOrigin
      return millisToHrTime(time);
    }
  } else if (time instanceof Date) {
    return millisToHrTime(time.getTime());
  } else {
    throw TypeError('Invalid input type');
  }
}

/**
 * Returns a duration of two hrTime.
 * @param startTime
 * @param endTime
 */
export function hrTimeDuration(
  startTime: api.HrTime,
  endTime: api.HrTime
): api.HrTime {
  let seconds = endTime[0] - startTime[0];
  let nanos = endTime[1] - startTime[1];

  // overflow
  if (nanos < 0) {
    seconds -= 1;
    // negate
    nanos += SECOND_TO_NANOSECONDS;
  }

  return [seconds, nanos];
}

/**
 * Convert hrTime to timestamp, for example "2019-05-14T17:00:00.000123456Z"
 * @param time
 */
export function hrTimeToTimeStamp(time: api.HrTime): string {
  const precision = NANOSECOND_DIGITS;
  const tmp = `${'0'.repeat(precision)}${time[1]}Z`;
  const nanoString = tmp.substring(tmp.length - precision - 1);
  const date = new Date(time[0] * 1000).toISOString();
  return date.replace('000Z', nanoString);
}

/**
 * Convert hrTime to nanoseconds.
 * @param time
 */
export function hrTimeToNanoseconds(time: api.HrTime): number {
  return time[0] * SECOND_TO_NANOSECONDS + time[1];
}

/**
 * Convert hrTime to microseconds.
 * @param time
 */
export function hrTimeToMicroseconds(time: api.HrTime): number {
  return time[0] * 1e6 + time[1] / 1e3;
}

/**
 * Convert hrTime to milliseconds.
 * @param time
 */
export function hrTimeToMilliseconds(time: api.HrTime): number {
  return time[0] * 1e3 + time[1] / 1e6;
}

/**
 * Convert hrTime to seconds.
 * @param time
 */
export function hrTimeToSeconds(time: api.HrTime): number {
  return time[0] + time[1] / SECOND_TO_NANOSECONDS;
}
/**
 * check if time is HrTime
 * @param value
 */
export function isTimeInputHrTime(value: unknown): value is api.HrTime {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  );
}

/**
 * check if input value is a correct types.TimeInput
 * @param value
 */
export function isTimeInput(
  value: unknown
): value is api.HrTime | number | Date {
  return (
    isTimeInputHrTime(value) ||
    typeof value === 'number' ||
    value instanceof Date
  );
}

/**
 * Given 2 HrTime formatted times, return their sum as an HrTime.
 */
export function addHrTimes(time1: api.HrTime, time2: api.HrTime): api.HrTime {
  const out = [time1[0] + time2[0], time1[1] + time2[1]] as api.HrTime;

  // Nanoseconds
  if (out[1] >= SECOND_TO_NANOSECONDS) {
    out[1] -= SECOND_TO_NANOSECONDS;
    out[0] += 1;
  }

  return out;
}

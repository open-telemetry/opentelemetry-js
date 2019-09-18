/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as types from '@opentelemetry/types';
import { otperformance as performance } from '../platform';

const NANOSECOND_DIGITS = 9;
const SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);

// Converts a number to HrTime
function numberToHrtime(time: number): types.HrTime {
  // Decimals only.
  const seconds = Math.trunc(time);
  // Round sub-nanosecond accuracy to nanosecond.
  const nanos =
    Number((time - seconds).toFixed(NANOSECOND_DIGITS)) * SECOND_TO_NANOSECONDS;
  return [seconds, nanos];
}

// Returns an hrtime calculated via performance component.
export function hrTime(performanceNow?: number): types.HrTime {
  const timeOrigin = numberToHrtime(performance.timeOrigin);
  const now = numberToHrtime(performanceNow || performance.now());

  let seconds = timeOrigin[0] + now[0];
  let nanos = timeOrigin[1] + now[1];

  // Nanoseconds
  if (nanos > SECOND_TO_NANOSECONDS) {
    nanos -= SECOND_TO_NANOSECONDS;
    seconds += 1;
  }

  return [seconds, nanos];
}

// Converts a TimeInput to an HrTime, defaults to _hrtime().
export function timeInputToHrTime(time: types.TimeInput): types.HrTime {
  // process.hrtime
  if (Array.isArray(time)) {
    return time;
  } else if (typeof time === 'number') {
    // Must be a performance.now() if it's smaller than process start time.
    if (time < performance.timeOrigin) {
      return hrTime(time);
    }
    // epoch milliseconds or performance.timeOrigin
    else {
      return numberToHrtime(time);
    }
  } else if (time instanceof Date) {
    return [time.getTime(), 0];
  } else {
    throw TypeError('Invalid input type');
  }
}

// Returns a duration of two hrTime.
export function hrTimeDuration(
  startTime: types.HrTime,
  endTime: types.HrTime
): types.HrTime {
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

// Convert hrTime to nanoseconds.
export function hrTimeToNanoseconds(hrTime: types.HrTime): number {
  const nanos = hrTime[0] * SECOND_TO_NANOSECONDS + hrTime[1];
  return nanos;
}

// Convert hrTime to milliseconds.
export function hrTimeToMilliseconds(hrTime: types.HrTime): number {
  const nanos = Math.round(hrTime[0] * 1000 + hrTime[1] / 1e6);
  return nanos;
}

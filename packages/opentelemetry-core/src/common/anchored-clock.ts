/*
 * Copyright The OpenTelemetry Authors
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

/**
 * A utility for returning wall times anchored to a given point in time. Wall time measurements will
 * not be taken from the system, but instead are computed by adding performance.now() monotonic time
 * to the anchor point.
 *
 * This is needed because the system time can change and result in unexpected situations like
 * spans ending before they are started. Creating an anchored clock for each local root span
 * ensures that span timings and durations are accurate while preventing span times from drifting
 * too far from the system clock.
 *
 * Only creating an anchored clock once per local trace ensures we minimize the performance
 * impact of accessing the system clock.
 *
 * Heavily inspired by the OTel Java anchored clock
 * https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk/trace/src/main/java/io/opentelemetry/sdk/trace/AnchoredClock.java
 */
export class AnchoredClock {
  private constructor(
    private _performance: Clock,
    private _epochMillis: number,
    private _performanceMillis: number,
  ) { }

  /** Create a new AnchoredClock anchored to the current time returned by clock */
  public static create(clock: Clock, performance: Clock) {
    return new AnchoredClock(performance, clock.now(), performance.now());
  }

  /**
   * Returns the current time by adding the number of milliseconds since the
   * AnchoredClock was created to the creation epoch time
   */
  public now(): number {
    const delta = this._performance.now() - this._performanceMillis;
    return this._epochMillis + delta;
  }
}

export interface Clock {
  /** Return the current time in milliseconds */
  now(): number;
}

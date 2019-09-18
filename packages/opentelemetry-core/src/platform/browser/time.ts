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

/** Returns performance.now() or pollyfill with Date.now() */
export function performanceNow() {
  return window.performance ? performance.now() : Date.now();
}

let perfOriginPolyfill = 0;

/** Returns performance.timeOrigin or calculated pollyfill. */
export function performanceTimeOrigin() {
  if (!window.performance) return 0;
  if (performance.timeOrigin) return performance.timeOrigin;

  if (!perfOriginPolyfill) {
    perfOriginPolyfill = Date.now() - performance.now();
  }
  return perfOriginPolyfill;
}

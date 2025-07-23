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
 * check if an object has `addEventListener` and `removeEventListener` functions.
 * Generally only called with a `TargetWithEvents` but may be called with an `unknown` value.
 * @param obj - The object to check.
 */
export function isListenerObject(obj: unknown): boolean {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'addEventListener' in obj &&
    typeof obj.addEventListener === 'function' &&
    'removeEventListener' in obj &&
    typeof obj.removeEventListener === 'function'
  );
}

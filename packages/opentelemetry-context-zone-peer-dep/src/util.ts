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

import { TargetWithEvents } from './types';

/**
 * check if an object has addEventListener and removeEventListener functions then it will return true
 * @param obj
 */
export function isListenerObject(obj: TargetWithEvents = {}): boolean {
  return (
    typeof obj.addEventListener === 'function' &&
    typeof obj.removeEventListener === 'function'
  );
}

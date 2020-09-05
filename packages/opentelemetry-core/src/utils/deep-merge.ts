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
function deepMerge(target: Record<string, any>, source: Record<string, any>) {
  const merged = target;
  for (const prop in source) {
    if (propIsArrayInBoth(source, prop, target)) {
      merged[prop] = source[prop].concat(target[prop]);
    } else if (typeof source[prop] === 'object' && source[prop] !== null) {
      merged[prop] = deepMerge(target[prop], source[prop]);
    } else {
      merged[prop] = source[prop];
    }
  }
  return merged;
}

function propIsArrayInBoth(
  source: Record<string, any>,
  prop: string,
  target: Record<string, any>
) {
  return Array.isArray(source[prop]) && Array.isArray(target[prop]);
}

export default deepMerge;

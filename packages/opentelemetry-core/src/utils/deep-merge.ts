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
export function deepMerge(
  target: Record<string, any>,
  source: Record<string, any>,
  maxDepth = 10
) {
  const merged = target;
  if (maxDepth === 0) {
    throw new Error('Max depth exceeded.');
  }
  for (const [prop, value] of Object.entries(source)) {
    if (bothPropsAreArrays(target, source, prop)) {
      merged[prop] = [];
      merged[prop] = value;
    } else if (bothPropsAreObjects(target, source, prop)) {
      merged[prop] = deepMerge(target[prop], value, maxDepth - 1);
    } else {
      merged[prop] = value;
    }
  }
  return merged;
}

function bothPropsAreObjects(
  target: Record<string, any>,
  source: Record<string, any>,
  prop: string
) {
  const targetIsObject =
    typeof target[prop] === 'object' && target[prop] !== null;
  const sourceIsObject =
    typeof source[prop] === 'object' && source[prop] !== null;
  return targetIsObject && sourceIsObject;
}

function bothPropsAreArrays(
  target: Record<string, any>,
  source: Record<string, any>,
  prop: string
) {
  return Array.isArray(source[prop]) && Array.isArray(target[prop]);
}

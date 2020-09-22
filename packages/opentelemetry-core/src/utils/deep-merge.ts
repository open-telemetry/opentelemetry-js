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
 * Deeply merges a source object onto a target object.
 * If a given property is an array in both source and target, the
 * source property replaces the target property entirely.
 * @param target
 * @param source
 * @param maxDepth avoids an infinite CPU loop. Defaults to 10.
 * @returns a deeply merged object
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
    if (bothPropsAreObjects(target, source, prop)) {
      if (bothPropsAreArrays(target, source, prop)) {
        merged[prop] = value;
      } else {
        merged[prop] = deepMerge(target[prop], value, maxDepth - 1);
      }
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
  return propIsObject(target, prop) && propIsObject(source, prop);
}

function propIsObject(object: any, prop: string) {
  return typeof object[prop] === 'object' && object[prop] !== null;
}

function bothPropsAreArrays(
  target: Record<string, any>,
  source: Record<string, any>,
  prop: string
) {
  return Array.isArray(source[prop]) && Array.isArray(target[prop]);
}

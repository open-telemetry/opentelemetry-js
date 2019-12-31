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

import { IgnoreMatcher } from '@opentelemetry/types';

/**
 * Check if {@param url} matches an ignore matcher. An ignore
 * matcher is matched if it satisfies one of the following:
 *
 * 1. Exact string match (case insensitive)
 *
 * 2. Matches regexp using pattern.test
 *
 * 3. Function does not throw AND returns a truthy value
 *
 * @param url e.g URL of request
 * @param pattern Match pattern may be a string, regex, or function
 */
export function matchesPattern(url: string, pattern?: IgnoreMatcher): boolean {
  if (!pattern) {
    return false;
  }

  // exact string match
  if (typeof pattern === 'string') {
    return pattern.toUpperCase() === url.toUpperCase();
  }

  // test regex
  if (pattern instanceof RegExp) {
    return pattern.test(url);
  }

  // function does not throw AND returns truthy value
  if (typeof pattern === 'function') {
    try {
      return Boolean(pattern(url));
    } catch {
      return false;
    }
  }

  // If none of the above conditions are met, the
  // url is not considered matched.
  return false;
}

/**
 * Check if {@param url} matches any matcher in an array of
 * ignore matchers. An ignore matcher is matched if it satisfies
 * one of the following:
 *
 * 1. Exact string match (case insensitive)
 *
 * 2. Matches regexp using pattern.test
 *
 * 3. Function does not throw AND returns a truthy value
 *
 * @param url e.g URL of request
 * @param patterns Array of match patterns which may be a string, regex, or function
 */
export function matchesAnyPattern(
  url: string,
  patterns?: IgnoreMatcher[]
): boolean {
  if (!patterns) {
    return false;
  }

  // If any matcher in an array is matched, the url
  // is considered ignored.
  for (const p of patterns) {
    if (matchesPattern(url, p)) {
      return true;
    }
  }
  return false;
}

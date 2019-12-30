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

import { IgnoreMatcher } from "@opentelemetry/types";

// /**
//  * Check if {@param url} matches {@param urlToMatch}
//  * @param url
//  * @param urlToMatch
//  */
// export function urlMatches(url: string, urlToMatch: string | RegExp): boolean {
//   if (typeof urlToMatch === 'string') {
//     return url === urlToMatch;
//   } else {
//     return !!url.match(urlToMatch);
//   }
// }
// /**
//  * @param url
//  * @param ignoredUrls
//  */
// export function isUrlIgnored(
//   url: string,
//   ignoredUrls?: Array<string | RegExp>
// ): boolean {
//   if (!ignoredUrls) {
//     return false;
//   }

//   for (const ignoreUrl of ignoredUrls) {
//     if (urlMatches(url, ignoreUrl)) {
//       return true;
//     }
//   }
//   return false;
// }



/**
 * Check if {@param url} should be ignored when comparing against {@param ignoredUrls}
 *
 * @param url e.g URL of request
 * @param pattern Match pattern
 */
export function isIgnored<T>(
  url: string,
  pattern?: IgnoreMatcher | IgnoreMatcher[],
  catcher?: (err: Error) => void
): boolean {
  if (!pattern) {
    return false;
  }

  if (Array.isArray(pattern)) {
    for (const p of pattern) {
      if (isIgnored(url, p)) {
        return true;
      }
    }
    return false;
  }

  if (typeof pattern === 'string') {
    return pattern === url;
  }

  if (pattern instanceof RegExp) {
    return pattern.test(url);
  }

  if (typeof pattern === 'function') {
    try {
      return pattern(url);
    } catch (err) {
      if (catcher) {
        catcher(err);
      }
    }
  }

  return false;
};
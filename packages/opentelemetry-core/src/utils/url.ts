/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
export function urlMatches(url: string, urlToMatch: string | RegExp): boolean {
  if (typeof urlToMatch === 'string') {
    return url === urlToMatch;
  } else {
    return !!url.match(urlToMatch);
  }
}
/**
 * Check if {@param url} should be ignored when comparing against {@param ignoredUrls}
 * @param url
 * @param ignoredUrls
 */
export function isUrlIgnored(
  url: string,
  ignoredUrls?: Array<string | RegExp>
): boolean {
  if (!ignoredUrls) {
    return false;
  }

  for (const ignoreUrl of ignoredUrls) {
    if (urlMatches(url, ignoreUrl)) {
      return true;
    }
  }
  return false;
}

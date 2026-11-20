/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export function isExportHTTPErrorRetryable(statusCode: number): boolean {
  return (
    statusCode === 429 ||
    statusCode === 502 ||
    statusCode === 503 ||
    statusCode === 504
  );
}

export function parseRetryAfterToMills(
  retryAfter?: string | undefined | null
): number | undefined {
  if (retryAfter == null) {
    return undefined;
  }

  const trimmedRetryAfter = retryAfter.trim();
  const seconds = /^-?\d+$/.test(trimmedRetryAfter)
    ? Number.parseInt(trimmedRetryAfter, 10)
    : NaN;
  if (Number.isInteger(seconds)) {
    return seconds > 0 ? seconds * 1000 : -1;
  }
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After#directives
  // Every HTTP-date form (RFC 9110: IMF-fixdate, RFC 850, asctime) begins with
  // a day-of-week name. Requiring one stops `Date` from coercing non-date
  // strings into bogus timestamps: `new Date('1.5')` is Jan 5 2001 and
  // `new Date('+5')` is a 2001 date, both of which look like a past "HTTP-date"
  // and would trigger an immediate retry.
  const isHttpDate = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*[,\s]/.test(
    trimmedRetryAfter
  );
  const delay = isHttpDate
    ? new Date(trimmedRetryAfter).getTime() - Date.now()
    : NaN;

  if (Number.isNaN(delay)) {
    // Neither delay-seconds nor a parseable HTTP-date. Returning undefined
    // lets the retrying transport fall back to its exponential backoff
    // instead of retrying immediately.
    return undefined;
  }
  if (delay >= 0) {
    return delay;
  }
  return 0;
}

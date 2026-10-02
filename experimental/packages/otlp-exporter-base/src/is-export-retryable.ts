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
  const delay = new Date(trimmedRetryAfter).getTime() - Date.now();

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

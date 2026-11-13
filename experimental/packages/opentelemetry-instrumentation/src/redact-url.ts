/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Value that replaces sensitive parts of a URL.
 */
export const STR_REDACTED = 'REDACTED';

/**
 * Query string keys whose values are redacted by {@link redactUrl}.
 * This is the list from the URL semantic conventions. Keys are matched
 * exactly (case-sensitive) after percent-decoding.
 *
 * @see https://opentelemetry.io/docs/specs/semconv/registry/attributes/url/
 */
export const REDACTED_QUERY_PARAMS: readonly string[] = [
  'sig',
  'Signature',
  'AWSAccessKeyId',
  'X-Goog-Signature',
  'X-Amz-Signature',
  'X-Amz-Credential',
  'X-Amz-Security-Token',
];

function decodeQueryKey(key: string): string {
  try {
    return decodeURIComponent(key.replace(/\+/g, ' '));
  } catch {
    return key;
  }
}

/**
 * Redacts credentials and the values of sensitive query string keys before a
 * URL is recorded as a span attribute (for example `url.full`).
 *
 * Keys are matched case-sensitively. A URL with nothing to redact is returned
 * unchanged. A value that `new URL` cannot parse, including a relative URL,
 * is returned unchanged.
 *
 * @param url absolute URL
 */
export function redactUrl(url: string): string {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return url;
  }

  let redacted = false;

  if (parsedUrl.username || parsedUrl.password) {
    parsedUrl.username = STR_REDACTED;
    parsedUrl.password = STR_REDACTED;
    redacted = true;
  }

  if (parsedUrl.search.length > 1) {
    let queryRedacted = false;
    const pairs = parsedUrl.search
      .slice(1)
      .split('&')
      .map(pair => {
        const separator = pair.indexOf('=');
        const key = separator === -1 ? pair : pair.slice(0, separator);
        if (REDACTED_QUERY_PARAMS.includes(decodeQueryKey(key))) {
          queryRedacted = true;
          return `${key}=${STR_REDACTED}`;
        }
        return pair;
      });
    if (queryRedacted) {
      parsedUrl.search = `?${pairs.join('&')}`;
      redacted = true;
    }
  }

  return redacted ? parsedUrl.href : url;
}

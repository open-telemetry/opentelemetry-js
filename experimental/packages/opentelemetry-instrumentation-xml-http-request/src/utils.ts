/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Much of the logic here overlaps with the same utils file in opentelemetry-instrumentation-fetch
// These may be unified in the future.

import * as api from '@opentelemetry/api';
import { getStringListFromEnv } from '@opentelemetry/core';
import type { URLLike } from '@opentelemetry/web-common';

const DIAG_LOGGER = api.diag.createComponentLogger({
  namespace:
    '@opentelemetry/opentelemetry-instrumentation-xml-http-request/utils',
});

function isDocument(value: unknown): value is Document {
  return typeof Document !== 'undefined' && value instanceof Document;
}

/**
 * Helper function to determine payload content length for XHR requests
 * @param body
 * @returns content length
 */
export function getXHRBodyLength(
  body: Document | XMLHttpRequestBodyInit
): number | undefined {
  if (isDocument(body)) {
    return new XMLSerializer().serializeToString(document).length;
  }

  // XMLHttpRequestBodyInit expands to the following:
  if (typeof body === 'string') {
    return getByteLength(body);
  }

  if (body instanceof Blob) {
    return body.size;
  }

  if (body instanceof FormData) {
    return getFormDataSize(body);
  }

  if (body instanceof URLSearchParams) {
    return getByteLength(body.toString());
  }

  // ArrayBuffer | ArrayBufferView
  if (body.byteLength !== undefined) {
    return body.byteLength;
  }

  DIAG_LOGGER.warn('unknown body type');
  return undefined;
}

const TEXT_ENCODER = new TextEncoder();
function getByteLength(s: string): number {
  return TEXT_ENCODER.encode(s).byteLength;
}

function getFormDataSize(formData: FormData): number {
  let size = 0;
  for (const [key, value] of formData.entries()) {
    size += key.length;
    if (value instanceof Blob) {
      size += value.size;
    } else {
      size += value.length;
    }
  }
  return size;
}

/**
 * Normalize an HTTP request method string per `http.request.method` spec
 * https://github.com/open-telemetry/semantic-conventions/blob/main/docs/http/http-spans.md#http-client-span
 */
export function normalizeHttpRequestMethod(method: string): string {
  const knownMethods = getKnownMethods();
  const methUpper = method.toUpperCase();
  if (methUpper in knownMethods) {
    return methUpper;
  } else {
    return '_OTHER';
  }
}

const DEFAULT_KNOWN_METHODS = {
  CONNECT: true,
  DELETE: true,
  GET: true,
  HEAD: true,
  OPTIONS: true,
  PATCH: true,
  POST: true,
  PUT: true,
  TRACE: true,
  // QUERY from https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/
  QUERY: true,
};
let knownMethods: { [key: string]: boolean };
function getKnownMethods() {
  if (knownMethods === undefined) {
    const cfgMethods = getStringListFromEnv(
      'OTEL_INSTRUMENTATION_HTTP_KNOWN_METHODS'
    );
    if (cfgMethods && cfgMethods.length > 0) {
      knownMethods = {};
      cfgMethods.forEach(m => {
        knownMethods[m] = true;
      });
    } else {
      knownMethods = DEFAULT_KNOWN_METHODS;
    }
  }
  return knownMethods;
}

const HTTP_PORT_FROM_PROTOCOL: { [key: string]: string } = {
  'https:': '443',
  'http:': '80',
};
export function serverPortFromUrl(url: URLLike): number | undefined {
  const serverPort = Number(url.port || HTTP_PORT_FROM_PROTOCOL[url.protocol]);
  // Guard with `if (serverPort)` because `Number('') === 0`.
  if (serverPort && !isNaN(serverPort)) {
    return serverPort;
  } else {
    return undefined;
  }
}

/**
 * Value that replaces sensitive parts of a URL.
 */
const STR_REDACTED = 'REDACTED';

/**
 * Query string keys whose values are redacted from `url.full` by default.
 * This is the list from the URL semantic conventions.
 * @see https://opentelemetry.io/docs/specs/semconv/registry/attributes/url/
 */
const DEFAULT_QUERY_STRINGS_TO_REDACT: readonly string[] = [
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
 * Redacts the credentials and the sensitive query string values of a URL
 * before it is recorded as `url.full`. Keys are matched case-sensitively and
 * the rest of the URL is returned as it was given.
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
        if (DEFAULT_QUERY_STRINGS_TO_REDACT.includes(decodeQueryKey(key))) {
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

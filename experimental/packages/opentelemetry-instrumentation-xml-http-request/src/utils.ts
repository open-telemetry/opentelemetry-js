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

// Much of the logic here overlaps with the same utils file in opentelemetry-instrumentation-fetch
// These may be unified in the future.

import * as api from '@opentelemetry/api';
import { getStringListFromEnv } from '@opentelemetry/core';
import { URLLike } from '@opentelemetry/sdk-trace-web';

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

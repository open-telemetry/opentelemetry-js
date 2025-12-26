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

// Much of the logic here overlaps with the same utils file in opentelemetry-instrumentation-xml-http-request
// These may be unified in the future.

import { diag } from '@opentelemetry/api';
import { getStringListFromEnv } from '@opentelemetry/core';
import { URLLike } from '@opentelemetry/sdk-trace-web';

const DIAG_LOGGER = diag.createComponentLogger({
  namespace: '@opentelemetry/opentelemetry-instrumentation-fetch/utils',
});

export function isRequest(value: unknown): value is Request {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as {
    url?: unknown;
    method?: unknown;
    headers?: unknown;
    clone?: unknown;
  };

  const headers = candidate.headers as
    | { get?: unknown; set?: unknown }
    | undefined;

  return (
    typeof candidate.url === 'string' &&
    typeof candidate.method === 'string' &&
    typeof candidate.clone === 'function' &&
    typeof headers === 'object' &&
    headers !== null &&
    typeof headers.get === 'function' &&
    typeof headers.set === 'function'
  );
}

/**
 * Helper function to determine payload content length for fetch requests
 *
 * The fetch API is kinda messy: there are a couple of ways the body can be passed in.
 *
 * In all cases, the body param can be some variation of ReadableStream,
 * and ReadableStreams can only be read once! We want to avoid consuming the body here,
 * because that would mean that the body never gets sent with the actual fetch request.
 *
 * Either the first arg is a Request object, which can be cloned
 *   so we can clone that object and read the body of the clone
 *   without disturbing the original argument
 *   However, reading the body here can only be done async; the body() method returns a promise
 *   this means this entire function has to return a promise
 *
 * OR the first arg is a url/string
 *   in which case the second arg has type RequestInit
 *   RequestInit is NOT cloneable, but RequestInit.body is writable
 *   so we can chain it into ReadableStream.pipeThrough()
 *
 *   ReadableStream.pipeThrough() lets us process a stream and returns a new stream
 *   So we can measure the body length as it passes through the pie, but need to attach
 *   the new stream to the original request
 *   so that the browser still has access to the body.
 *
 * @param body
 * @returns promise that resolves to the content length of the body
 */
export function getFetchBodyLength(...args: Parameters<typeof fetch>) {
  if (args[0] instanceof URL || typeof args[0] === 'string') {
    const requestInit = args[1];
    if (!requestInit?.body) {
      return Promise.resolve();
    }
    if (requestInit.body instanceof ReadableStream) {
      const { body, length } = _getBodyNonDestructively(requestInit.body);
      requestInit.body = body;

      return length;
    } else {
      return Promise.resolve(getXHRBodyLength(requestInit.body));
    }
  } else if (isRequest(args[0])) {
    const info = args[0];
    if (!info.body) {
      return Promise.resolve();
    }

    return info
      .clone()
      .text()
      .then(t => getByteLength(t));
  } else {
    return Promise.resolve();
  }
}

function _getBodyNonDestructively(body: ReadableStream) {
  // can't read a ReadableStream without destroying it
  // but we CAN pipe it through and return a new ReadableStream

  // some (older) platforms don't expose the pipeThrough method and in that scenario, we're out of luck;
  //   there's no way to read the stream without consuming it.
  if (!body.pipeThrough) {
    DIAG_LOGGER.warn('Platform has ReadableStream but not pipeThrough!');
    return {
      body,
      length: Promise.resolve(undefined),
    };
  }

  let length = 0;
  let resolveLength: (l: number) => void;
  const lengthPromise = new Promise<number>(resolve => {
    resolveLength = resolve;
  });

  const transform = new TransformStream({
    start() {},
    async transform(chunk, controller) {
      const bytearray = (await chunk) as Uint8Array;
      length += bytearray.byteLength;

      controller.enqueue(chunk);
    },
    flush() {
      resolveLength(length);
    },
  });

  return {
    body: body.pipeThrough(transform),
    length: lengthPromise,
  };
}

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
      cfgMethods.forEach((m: string) => {
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

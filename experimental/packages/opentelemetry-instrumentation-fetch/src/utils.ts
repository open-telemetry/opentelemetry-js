/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Much of the logic here overlaps with the same utils file in opentelemetry-instrumentation-xml-http-request
// These may be unified in the future.

import { diag } from '@opentelemetry/api';
import { getStringListFromEnv } from '@opentelemetry/core';
import type {
  PerformanceResourceTimingInfo,
  URLLike,
} from '@opentelemetry/sdk-trace-web';
import { parseUrl, sortResources } from '@opentelemetry/sdk-trace-web';

const DIAG_LOGGER = diag.createComponentLogger({
  namespace: '@opentelemetry/opentelemetry-instrumentation-fetch/utils',
});

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
  } else {
    const info = args[0];
    if (!info?.body) {
      return Promise.resolve();
    }

    return info
      .clone()
      .text()
      .then(t => getByteLength(t));
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

/** Returns the origin if present (if in browser context). */
function getOrigin(): string | undefined {
  return typeof location !== 'undefined' ? location.origin : undefined;
}

/**
 * Get closest performance resource ignoring the resources that have been
 * already used.
 * @param spanUrl
 * @param performanceStartTime
 * @param performanceEndTime
 * @param resources
 * @param ignoredResources
 * @param initiatorType
 */
export function getResource(
  spanUrl: string,
  performanceStartTime: number,
  performanceEndTime: number,
  resources: PerformanceResourceTiming[],
  ignoredResources: WeakSet<PerformanceResourceTiming> = new WeakSet<PerformanceResourceTiming>(),
  initiatorType?: string
): PerformanceResourceTimingInfo {
  // de-relativize the URL before usage (does no harm to absolute URLs)
  const parsedSpanUrl = parseUrl(spanUrl);
  spanUrl = parsedSpanUrl.toString();

  const filteredResources = filterResourcesForSpan(
    spanUrl,
    performanceStartTime,
    performanceEndTime,
    resources,
    ignoredResources,
    initiatorType
  );

  if (filteredResources.length === 0) {
    return {
      mainRequest: undefined,
    };
  }
  if (filteredResources.length === 1) {
    return {
      mainRequest: filteredResources[0],
    };
  }
  const sorted = sortResources(filteredResources);

  if (parsedSpanUrl.origin !== getOrigin() && sorted.length > 1) {
    let corsPreFlightRequest: PerformanceResourceTiming | undefined = sorted[0];
    let mainRequest: PerformanceResourceTiming = findMainRequest(
      sorted,
      corsPreFlightRequest.responseEnd,
      performanceEndTime
    );

    const responseEnd = corsPreFlightRequest.responseEnd;
    const fetchStart = mainRequest.fetchStart;

    // no corsPreFlightRequest
    if (fetchStart < responseEnd) {
      mainRequest = corsPreFlightRequest;
      corsPreFlightRequest = undefined;
    }

    return {
      corsPreFlightRequest,
      mainRequest,
    };
  } else {
    return {
      mainRequest: filteredResources[0],
    };
  }
}

/**
 * Will find the main request skipping the cors pre flight requests
 * @param resources
 * @param corsPreFlightRequestEndTime
 * @param performanceEndTime
 */
function findMainRequest(
  resources: PerformanceResourceTiming[],
  corsPreFlightRequestEndTime: number,
  performanceEndTime: number
): PerformanceResourceTiming {
  let mainRequest: PerformanceResourceTiming = resources[1];
  let bestGap;

  const length = resources.length;
  for (let i = 1; i < length; i++) {
    const resource = resources[i];
    const resourceStartTime = resource.fetchStart;
    const resourceEndTime = resource.responseEnd;

    const currentGap = performanceEndTime - resourceEndTime;

    if (
      resourceStartTime >= corsPreFlightRequestEndTime &&
      (!bestGap || currentGap < bestGap)
    ) {
      bestGap = currentGap;
      mainRequest = resource;
    }
  }
  return mainRequest;
}

/**
 * Filter all resources that has started and finished according to span start time and end time.
 *     It will return the closest resource to a start time
 * @param spanUrl
 * @param performanceStartTime
 * @param performanceEndTime
 * @param resources
 * @param ignoredResources
 * @param initiatorType
 */
function filterResourcesForSpan(
  spanUrl: string,
  performanceStartTime: number,
  performanceEndTime: number,
  resources: PerformanceResourceTiming[],
  ignoredResources: WeakSet<PerformanceResourceTiming>,
  initiatorType?: string
) {
  let filteredResources = resources.filter(resource => {
    const resourceStartTime = resource.fetchStart;
    const resourceEndTime = resource.responseEnd;

    return (
      resource.initiatorType.toLowerCase() ===
        (initiatorType || 'xmlhttprequest') &&
      resource.name === spanUrl &&
      resourceStartTime >= performanceStartTime &&
      resourceEndTime <= performanceEndTime
    );
  });

  if (filteredResources.length > 0) {
    filteredResources = filteredResources.filter(resource => {
      return !ignoredResources.has(resource);
    });
  }

  return filteredResources;
}

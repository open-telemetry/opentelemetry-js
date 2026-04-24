/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Much of the logic here overlaps with the same utils file in opentelemetry-instrumentation-xml-http-request
// These may be unified in the future.

import type { HrTime, Span } from '@opentelemetry/api';
import { diag } from '@opentelemetry/api';
import {
  hrTimeToNanoseconds,
  timeInputToHrTime,
  urlMatches,
} from '@opentelemetry/core';

import { PerformanceTimingNames } from './enums/PerformanceTimingNames';
import { ATTR_HTTP_RESPONSE_CONTENT_LENGTH, ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED } from './semconv';

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

/**
 * Normalize an HTTP request method string per `http.request.method` spec
 * https://github.com/open-telemetry/semantic-conventions/blob/main/docs/http/http-spans.md#http-client-span
 */
export function normalizeHttpRequestMethod(method: string): string {
  const knownMethods = DEFAULT_KNOWN_METHODS;
  const methUpper = method.toUpperCase();
  if (methUpper in knownMethods) {
    return methUpper;
  } else {
    return '_OTHER';
  }
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

export type PropagateTraceHeaderCorsUrls = string | RegExp | Array<string | RegExp>;
export type PerformanceEntries = {
  [PerformanceTimingNames.CONNECT_END]?: number;
  [PerformanceTimingNames.CONNECT_START]?: number;
  [PerformanceTimingNames.DECODED_BODY_SIZE]?: number;
  [PerformanceTimingNames.DOM_COMPLETE]?: number;
  [PerformanceTimingNames.DOM_CONTENT_LOADED_EVENT_END]?: number;
  [PerformanceTimingNames.DOM_CONTENT_LOADED_EVENT_START]?: number;
  [PerformanceTimingNames.DOM_INTERACTIVE]?: number;
  [PerformanceTimingNames.DOMAIN_LOOKUP_END]?: number;
  [PerformanceTimingNames.DOMAIN_LOOKUP_START]?: number;
  [PerformanceTimingNames.ENCODED_BODY_SIZE]?: number;
  [PerformanceTimingNames.FETCH_START]?: number;
  [PerformanceTimingNames.LOAD_EVENT_END]?: number;
  [PerformanceTimingNames.LOAD_EVENT_START]?: number;
  [PerformanceTimingNames.REDIRECT_END]?: number;
  [PerformanceTimingNames.REDIRECT_START]?: number;
  [PerformanceTimingNames.REQUEST_START]?: number;
  [PerformanceTimingNames.RESPONSE_END]?: number;
  [PerformanceTimingNames.RESPONSE_START]?: number;
  [PerformanceTimingNames.SECURE_CONNECTION_START]?: number;
  [PerformanceTimingNames.START_TIME]?: number;
  [PerformanceTimingNames.UNLOAD_EVENT_END]?: number;
  [PerformanceTimingNames.UNLOAD_EVENT_START]?: number;
};

/**
 * Helper function for adding network events and content length attributes.
 */
export function addSpanNetworkEvents(
  span: Span,
  resource: PerformanceEntries,
  ignoreNetworkEvents = false,
  ignoreZeros?: boolean,
  skipOldSemconvContentLengthAttrs?: boolean
): void {
  if (ignoreZeros === undefined) {
    ignoreZeros = resource[PerformanceTimingNames.START_TIME] !== 0;
  }

  if (!ignoreNetworkEvents) {
    addSpanNetworkEvent(span, PerformanceTimingNames.FETCH_START, resource, ignoreZeros);
    addSpanNetworkEvent(span, PerformanceTimingNames.DOMAIN_LOOKUP_START, resource, ignoreZeros);
    addSpanNetworkEvent(span, PerformanceTimingNames.DOMAIN_LOOKUP_END, resource, ignoreZeros);
    addSpanNetworkEvent(span, PerformanceTimingNames.CONNECT_START, resource, ignoreZeros);
    addSpanNetworkEvent(
      span,
      PerformanceTimingNames.SECURE_CONNECTION_START,
      resource,
      ignoreZeros
    );
    addSpanNetworkEvent(span, PerformanceTimingNames.CONNECT_END, resource, ignoreZeros);
    addSpanNetworkEvent(span, PerformanceTimingNames.REQUEST_START, resource, ignoreZeros);
    addSpanNetworkEvent(span, PerformanceTimingNames.RESPONSE_START, resource, ignoreZeros);
    addSpanNetworkEvent(span, PerformanceTimingNames.RESPONSE_END, resource, ignoreZeros);
  }

  if (!skipOldSemconvContentLengthAttrs) {
    // This block adds content-length-related span attributes using the
    // *old* HTTP semconv (v1.7.0).
    const encodedLength = resource[PerformanceTimingNames.ENCODED_BODY_SIZE];
    if (encodedLength !== undefined) {
      span.setAttribute(ATTR_HTTP_RESPONSE_CONTENT_LENGTH, encodedLength);
    }

    const decodedLength = resource[PerformanceTimingNames.DECODED_BODY_SIZE];
    // Spec: Not set if transport encoding not used (in which case encoded and decoded sizes match)
    if (decodedLength !== undefined && encodedLength !== decodedLength) {
      span.setAttribute(
        ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
        decodedLength
      );
    }
  }
}

/**
 * Helper function to be able to use enum as typed key in type and in interface when using forEach
 * @param obj
 * @param key
 */
export function hasKey<O extends object>(
  obj: O,
  key: PropertyKey
): key is keyof O {
  return key in obj;
}

/**
 * Helper function for starting an event on span based on {@link PerformanceEntries}
 * @param span
 * @param performanceName name of performance entry for time start
 * @param entries
 * @param ignoreZeros
 */
export function addSpanNetworkEvent(
  span: Span,
  performanceName: string,
  entries: PerformanceEntries,
  ignoreZeros = true
): Span | undefined {
  if (
    hasKey(entries, performanceName) &&
    typeof entries[performanceName] === 'number' &&
    !(ignoreZeros && entries[performanceName] === 0)
  ) {
    return span.addEvent(performanceName, entries[performanceName]);
  }

  return undefined;
}

/**
 * The URLLike interface represents an URL and HTMLAnchorElement compatible fields.
 */
export interface URLLike {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  readonly origin: string;
  password: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  username: string;
}

let urlNormalizingAnchor: HTMLAnchorElement | undefined;
/**
 * Parses url using URL constructor or fallback to anchor element.
 * @param url
 */
export function parseUrl(url: string): URLLike {
  if (typeof URL === 'function') {
    return new URL(
      url,
      typeof document !== 'undefined'
        ? document.baseURI
        : typeof location !== 'undefined' // Some JS runtimes (e.g. Deno) don't define this
          ? location.href
          : undefined
    );
  }

  if (!urlNormalizingAnchor) {
    urlNormalizingAnchor = document.createElement('a');
  }
  urlNormalizingAnchor.href = url;
  return urlNormalizingAnchor;
}

/**
 * Checks if trace headers should be propagated
 * @param spanUrl
 * @private
 */
export function shouldPropagateTraceHeaders(
  spanUrl: string,
  propagateTraceHeaderCorsUrls?: PropagateTraceHeaderCorsUrls
): boolean {
  let propagateTraceHeaderUrls = propagateTraceHeaderCorsUrls || [];
  if (
    typeof propagateTraceHeaderUrls === 'string' ||
    propagateTraceHeaderUrls instanceof RegExp
  ) {
    propagateTraceHeaderUrls = [propagateTraceHeaderUrls];
  }
  const parsedSpanUrl = parseUrl(spanUrl);

  if (parsedSpanUrl.origin === location?.origin) {
    return true;
  } else {
    return propagateTraceHeaderUrls.some(propagateTraceHeaderUrl =>
      urlMatches(spanUrl, propagateTraceHeaderUrl)
    );
  }
}

/**
 * This interface is used in {@link getResource} function to return
 *     main request and it's corresponding PreFlight request
 */
export interface PerformanceResourceTimingInfo {
  corsPreFlightRequest?: PerformanceResourceTiming;
  mainRequest?: PerformanceResourceTiming;
}

/**
 * Filter all resources that has started and finished according to span start time and end time.
 *     It will return the closest resource to a start time
 * @param spanUrl
 * @param startTimeHR
 * @param endTimeHR
 * @param resources
 * @param ignoredResources
 */
function filterResourcesForSpan(
  spanUrl: string,
  startTimeHR: HrTime,
  endTimeHR: HrTime,
  resources: PerformanceResourceTiming[],
  ignoredResources: WeakSet<PerformanceResourceTiming>,
  initiatorType?: string
) {
  const startTime = hrTimeToNanoseconds(startTimeHR);
  const endTime = hrTimeToNanoseconds(endTimeHR);
  let filteredResources = resources.filter(resource => {
    const resourceStartTime = hrTimeToNanoseconds(
      timeInputToHrTime(resource[PerformanceTimingNames.FETCH_START])
    );
    const resourceEndTime = hrTimeToNanoseconds(
      timeInputToHrTime(resource[PerformanceTimingNames.RESPONSE_END])
    );

    return (
      resource.initiatorType.toLowerCase() ===
        (initiatorType || 'xmlhttprequest') &&
      resource.name === spanUrl &&
      resourceStartTime >= startTime &&
      resourceEndTime <= endTime
    );
  });

  if (filteredResources.length > 0) {
    filteredResources = filteredResources.filter(resource => {
      return !ignoredResources.has(resource);
    });
  }

  return filteredResources;
}

/**
 * sort resources by startTime
 * @param filteredResources
 */
function sortResources(
  filteredResources: PerformanceResourceTiming[]
): PerformanceResourceTiming[] {
  return filteredResources.slice().sort((a, b) => {
    const valueA = a[PerformanceTimingNames.FETCH_START];
    const valueB = b[PerformanceTimingNames.FETCH_START];
    if (valueA > valueB) {
      return 1;
    } else if (valueA < valueB) {
      return -1;
    }
    return 0;
  });
}

/**
 * Will find the main request skipping the cors pre flight requests
 * @param resources
 * @param corsPreFlightRequestEndTime
 * @param spanEndTimeHR
 */
function findMainRequest(
  resources: PerformanceResourceTiming[],
  corsPreFlightRequestEndTime: number,
  spanEndTimeHR: HrTime
): PerformanceResourceTiming {
  const spanEndTime = hrTimeToNanoseconds(spanEndTimeHR);
  const minTime = hrTimeToNanoseconds(
    timeInputToHrTime(corsPreFlightRequestEndTime)
  );

  let mainRequest: PerformanceResourceTiming = resources[1];
  let bestGap;

  const length = resources.length;
  for (let i = 1; i < length; i++) {
    const resource = resources[i];
    const resourceStartTime = hrTimeToNanoseconds(
      timeInputToHrTime(resource[PerformanceTimingNames.FETCH_START])
    );

    const resourceEndTime = hrTimeToNanoseconds(
      timeInputToHrTime(resource[PerformanceTimingNames.RESPONSE_END])
    );

    const currentGap = spanEndTime - resourceEndTime;

    if (resourceStartTime >= minTime && (!bestGap || currentGap < bestGap)) {
      bestGap = currentGap;
      mainRequest = resource;
    }
  }
  return mainRequest;
}

/**
 * Get closest performance resource ignoring the resources that have been
 * already used.
 * @param spanUrl
 * @param startTimeHR
 * @param endTimeHR
 * @param resources
 * @param ignoredResources
 * @param initiatorType
 */
export function getResource(
  spanUrl: string,
  startTimeHR: HrTime,
  endTimeHR: HrTime,
  resources: PerformanceResourceTiming[],
  ignoredResources: WeakSet<PerformanceResourceTiming> = new WeakSet<PerformanceResourceTiming>(),
  initiatorType?: string
): PerformanceResourceTimingInfo {
  // de-relativize the URL before usage (does no harm to absolute URLs)
  const parsedSpanUrl = parseUrl(spanUrl);
  spanUrl = parsedSpanUrl.toString();

  const filteredResources = filterResourcesForSpan(
    spanUrl,
    startTimeHR,
    endTimeHR,
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

  if (parsedSpanUrl.origin !== location?.origin && sorted.length > 1) {
    let corsPreFlightRequest: PerformanceResourceTiming | undefined = sorted[0];
    let mainRequest: PerformanceResourceTiming = findMainRequest(
      sorted,
      corsPreFlightRequest[PerformanceTimingNames.RESPONSE_END],
      endTimeHR
    );

    const responseEnd = corsPreFlightRequest[PerformanceTimingNames.RESPONSE_END];
    const fetchStart = mainRequest[PerformanceTimingNames.FETCH_START];

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


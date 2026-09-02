/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Much of the logic here overlaps with the same utils file in opentelemetry-instrumentation-fetch
// These may be unified in the future.

import * as api from '@opentelemetry/api';
import { getStringListFromEnv } from '@opentelemetry/core';
import type { URLLike } from '@opentelemetry/sdk-trace-web';
import { parseUrl } from '@opentelemetry/sdk-trace-web';

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

export interface PerformanceResourceTimingInfo {
  corsPreFlightRequest?: PerformanceResourceTiming;
  mainRequest?: PerformanceResourceTiming;
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

/**
 * sort resources by startTime
 * @param filteredResources
 */
function sortResources(
  filteredResources: PerformanceResourceTiming[]
): PerformanceResourceTiming[] {
  return filteredResources.slice().sort((a, b) => {
    const valueA = a.fetchStart;
    const valueB = b.fetchStart;
    if (valueA > valueB) {
      return 1;
    } else if (valueA < valueB) {
      return -1;
    }
    return 0;
  });
}

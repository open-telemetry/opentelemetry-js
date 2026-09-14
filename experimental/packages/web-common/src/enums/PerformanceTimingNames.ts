/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PerformanceTimingNames {
  CONNECT_END = 'connectEnd',
  CONNECT_START = 'connectStart',
  DECODED_BODY_SIZE = 'decodedBodySize',
  DOM_COMPLETE = 'domComplete',
  DOM_CONTENT_LOADED_EVENT_END = 'domContentLoadedEventEnd',
  DOM_CONTENT_LOADED_EVENT_START = 'domContentLoadedEventStart',
  DOM_INTERACTIVE = 'domInteractive',
  DOMAIN_LOOKUP_END = 'domainLookupEnd',
  DOMAIN_LOOKUP_START = 'domainLookupStart',
  ENCODED_BODY_SIZE = 'encodedBodySize',
  FETCH_START = 'fetchStart',
  LOAD_EVENT_END = 'loadEventEnd',
  LOAD_EVENT_START = 'loadEventStart',
  NAVIGATION_START = 'navigationStart',
  REDIRECT_END = 'redirectEnd',
  REDIRECT_START = 'redirectStart',
  REQUEST_START = 'requestStart',
  RESPONSE_END = 'responseEnd',
  RESPONSE_START = 'responseStart',
  SECURE_CONNECTION_START = 'secureConnectionStart',
  START_TIME = 'startTime',
  UNLOAD_EVENT_END = 'unloadEventEnd',
  UNLOAD_EVENT_START = 'unloadEventStart',
}

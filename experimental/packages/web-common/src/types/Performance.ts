/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PerformanceTimingNames } from '../enums/PerformanceTimingNames';

/**
 * @deprecated See https://github.com/open-telemetry/opentelemetry-js/issues/3174
 */
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
 * This interface defines a fallback to read performance metrics,
 * this happens for example on Safari Mac
 * @deprecated See https://github.com/open-telemetry/opentelemetry-js/issues/3174
 */
export interface PerformanceLegacy {
  timing?: PerformanceEntries;
}

/**
 * This interface is used in {@link getResource} function to return
 *     main request and it's corresponding PreFlight request
 * @deprecated See https://github.com/open-telemetry/opentelemetry-js/issues/3174
 */
export interface PerformanceResourceTimingInfo {
  corsPreFlightRequest?: PerformanceResourceTiming;
  mainRequest?: PerformanceResourceTiming;
}

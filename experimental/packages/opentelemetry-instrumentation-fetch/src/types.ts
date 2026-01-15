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

import type { HrTime, Span } from '@opentelemetry/api';
import type { InstrumentationConfig } from '@opentelemetry/instrumentation';
import type { PropagateTraceHeaderCorsUrls } from '@opentelemetry/sdk-trace-web';

/**
 * Interface used to provide information to finish span on fetch response
 */
export interface FetchResponse {
  status: number;
  statusText?: string;
  url: string;
}

/**
 * Interface used to provide information to finish span on fetch error
 */
export interface FetchError {
  status?: number;
  message: string;
}

/**
 * Interface used to keep information about span between creating and
 * ending span
 */
export interface SpanData {
  entries: PerformanceResourceTiming[];
  observer?: PerformanceObserver;
  spanUrl: string;
  startTime: HrTime;
}

export interface FetchCustomAttributeFunction {
  (
    span: Span,
    request: Request | RequestInit,
    result: Response | FetchError
  ): void;
}

export interface FetchRequestHookFunction {
  (span: Span, request: Request | RequestInit): void;
}

/**
 * FetchPlugin Config
 */
export interface FetchInstrumentationConfig extends InstrumentationConfig {
  // the number of timing resources is limited, after the limit
  // (chrome 250, safari 150) the information is not collected anymore
  // the only way to prevent that is to regularly clean the resources
  // whenever it is possible, this is needed only when PerformanceObserver
  // is not available
  clearTimingResources?: boolean;
  // urls which should include trace headers when origin doesn't match
  propagateTraceHeaderCorsUrls?: PropagateTraceHeaderCorsUrls;
  /**
   * URLs that partially match any regex in ignoreUrls will not be traced.
   * In addition, URLs that are _exact matches_ of strings in ignoreUrls will
   * also not be traced.
   */
  ignoreUrls?: Array<string | RegExp>;
  /** Function for adding custom attributes on the span */
  applyCustomAttributesOnSpan?: FetchCustomAttributeFunction;
  /** Function for adding custom attributes or headers before the request is handled */
  requestHook?: FetchRequestHookFunction;
  // Ignore adding network events as span events
  ignoreNetworkEvents?: boolean;
  /** Measure outgoing request size */
  measureRequestSize?: boolean;
  /** Select the HTTP semantic conventions version(s) used. */
  semconvStabilityOptIn?: string;
}

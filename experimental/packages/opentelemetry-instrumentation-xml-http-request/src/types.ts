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

import * as api from '@opentelemetry/api';

/**
 * method "open" from XMLHttpRequest
 */
export type OpenFunction = (
  method: string,
  url: string,
  async?: boolean,
  user?: string | null,
  pass?: string | null
) => void;

/**
 * method "send" from XMLHttpRequest
 */
export type SendFunction = typeof XMLHttpRequest.prototype.send;

export type SendBody =
  | string
  | Document
  | Blob
  | ArrayBufferView
  | ArrayBuffer
  | FormData
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  | URLSearchParams
  | ReadableStream<Uint8Array>
  | null;

/**
 * interface to store information in weak map about spans, resources and
 * callbacks
 */
export interface XhrMem {
  status?: number;
  statusText?: string;
  // span assigned to xhr
  span: api.Span;
  // span url - not available on types.Span
  spanUrl?: string;
  // startTime of send function - used to filter cors preflight requests
  sendStartTime?: api.HrTime;
  // resources created between send and end plus some additional timeout
  createdResources?: {
    observer: PerformanceObserver;
    entries: PerformanceResourceTiming[];
  };
  // callback to remove events from xhr once the span ends
  callbackToRemoveEvents?: () => void;
}

export type PropagateTraceHeaderCorsUrl = string | RegExp;

export type PropagateTraceHeaderCorsUrls =
  | PropagateTraceHeaderCorsUrl
  | PropagateTraceHeaderCorsUrl[];

/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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

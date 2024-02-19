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
import type { InstrumentationConfig } from '@opentelemetry/instrumentation';
import type { Attributes, Span } from '@opentelemetry/api';

// TODO: notes about support
// - `fetch` API is added in node v16.15.0
// - `undici` supports node >=18

// TODO: `Request` class was added in node v16.15.0, make it work with v14
// also we do not get that object from the diagnostics channel message but the
// core request from https://github.com/nodejs/undici/blob/main/lib/core/request.js
// which is not typed

export interface UndiciRequest {
  origin: string;
  method: string;
  path: string;
  /**
   * Serialized string of headers in the form `name: value\r\n`
   */
  headers: string;
  throwOnError: boolean;
  completed: boolean;
  aborted: boolean;
  idempotent: boolean;
  contentLength: number | null;
  contentType: string | null;
  body: any;
}

export interface UnidiciResponse {
  headers: Buffer[];
  statusCode: number;
}

// This package will instrument HTTP requests made through `undici` or  `fetch` global API
// so it seems logical to have similar options than the HTTP instrumentation
export interface UndiciInstrumentationConfig<RequestType = UndiciRequest>
  extends InstrumentationConfig {
  /** Not trace all outgoing requests that matched with custom function */
  ignoreRequestHook?: (request: RequestType) => boolean;
  /** Function for adding custom attributes after response is handled */
  applyCustomAttributesOnSpan?: (
    span: Span,
    request: RequestType,
    response: Response
  ) => void;
  /** Function for adding custom attributes before request is handled */
  requestHook?: (span: Span, request: RequestType) => void;
  /** Function for adding custom attributes before a span is started in outgoingRequest */
  startSpanHook?: (request: RequestType) => Attributes;
  /** Require parent to create span for outgoing requests */
  requireParentforSpans?: boolean;
  /** Map the following HTTP headers to span attributes. */
  headersToSpanAttributes?: {
    requestHeaders?: string[];
    responseHeaders?: string[];
  };
}

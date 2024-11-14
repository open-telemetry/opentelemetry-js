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
import { Span, Attributes } from '@opentelemetry/api';
import {
  ClientRequest,
  IncomingMessage,
  ServerResponse,
  RequestOptions,
} from 'http';
import { InstrumentationConfig } from '@opentelemetry/instrumentation';

export interface HttpCustomAttributeFunction {
  (
    span: Span,
    request: ClientRequest | IncomingMessage,
    response: IncomingMessage | ServerResponse
  ): void;
}

export interface IgnoreIncomingRequestFunction {
  (request: IncomingMessage): boolean;
}

export interface IgnoreOutgoingRequestFunction {
  (request: RequestOptions): boolean;
}

export interface HttpRequestCustomAttributeFunction {
  (span: Span, request: ClientRequest | IncomingMessage): void;
}

export interface HttpResponseCustomAttributeFunction {
  (span: Span, response: IncomingMessage | ServerResponse): void;
}

export interface StartIncomingSpanCustomAttributeFunction {
  (request: IncomingMessage): Attributes;
}

export interface StartOutgoingSpanCustomAttributeFunction {
  (request: RequestOptions): Attributes;
}

/**
 * Options available for the HTTP instrumentation (see [documentation](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-instrumentation-http#http-instrumentation-options))
 */
export interface HttpInstrumentationConfig extends InstrumentationConfig {
  /** Not trace all incoming requests that matched with custom function */
  ignoreIncomingRequestHook?: IgnoreIncomingRequestFunction;
  /** Not trace all outgoing requests that matched with custom function */
  ignoreOutgoingRequestHook?: IgnoreOutgoingRequestFunction;
  /** If set to true, incoming requests will not be instrumented at all. */
  disableIncomingRequestInstrumentation?: boolean;
  /** If set to true, outgoing requests will not be instrumented at all. */
  disableOutgoingRequestInstrumentation?: boolean;
  /** Function for adding custom attributes after response is handled */
  applyCustomAttributesOnSpan?: HttpCustomAttributeFunction;
  /** Function for adding custom attributes before request is handled */
  requestHook?: HttpRequestCustomAttributeFunction;
  /** Function for adding custom attributes before response is handled */
  responseHook?: HttpResponseCustomAttributeFunction;
  /** Function for adding custom attributes before a span is started in incomingRequest */
  startIncomingSpanHook?: StartIncomingSpanCustomAttributeFunction;
  /** Function for adding custom attributes before a span is started in outgoingRequest */
  startOutgoingSpanHook?: StartOutgoingSpanCustomAttributeFunction;
  /** The primary server name of the matched virtual host. */
  serverName?: string;
  /** Require parent to create span for outgoing requests */
  requireParentforOutgoingSpans?: boolean;
  /** Require parent to create span for incoming requests */
  requireParentforIncomingSpans?: boolean;
  /** Map the following HTTP headers to span attributes. */
  headersToSpanAttributes?: {
    client?: { requestHeaders?: string[]; responseHeaders?: string[] };
    server?: { requestHeaders?: string[]; responseHeaders?: string[] };
  };
}

/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Span, Attributes } from '@opentelemetry/api';
import type {
  ClientRequest,
  IncomingMessage,
  ServerResponse,
  RequestOptions,
} from 'http';
import type { InstrumentationConfig } from '@opentelemetry/instrumentation';

export interface HttpCustomAttributeFunction {
  (
    span: Span,
    request: ClientRequest | IncomingMessage,
    response: IncomingMessage | ServerResponse
  ): void;
}

/**
 * Called with each incoming request. Return `true` to skip creating a server
 * span for that request.
 */
export interface IgnoreIncomingRequestFunction {
  (request: IncomingMessage): boolean;
}

/**
 * Called with each outgoing request's parsed options. Return `true` to skip
 * creating a client span for that request.
 */
export interface IgnoreOutgoingRequestFunction {
  (request: RequestOptions): boolean;
}

/**
 * Called with each incoming request. Return `true` to skip extracting the
 * propagation context from the incoming request's headers, e.g. to avoid
 * honoring trace context from untrusted sources (based on the request's
 * remote IP address, for example).
 */
export interface IgnoreIncomingPropagationFunction {
  (request: IncomingMessage): boolean;
}

/**
 * Called with the active span and request before the request is handled.
 */
export interface HttpRequestCustomAttributeFunction {
  (span: Span, request: ClientRequest | IncomingMessage): void;
}

/**
 * Called with the active span and response before the response is handled.
 */
export interface HttpResponseCustomAttributeFunction {
  (span: Span, response: IncomingMessage | ServerResponse): void;
}

/**
 * Called before an incoming request span is started. Returned attributes are
 * added to the new server span.
 */
export interface StartIncomingSpanCustomAttributeFunction {
  (request: IncomingMessage): Attributes;
}

/**
 * Called with an outgoing request's parsed options before the span is started.
 * Returned attributes are added to the new client span.
 */
export interface StartOutgoingSpanCustomAttributeFunction {
  (request: RequestOptions): Attributes;
}

/**
 * Options available for the HTTP instrumentation (see [documentation](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-http#http-instrumentation-options))
 */
export interface HttpInstrumentationConfig extends InstrumentationConfig {
  /** Do not trace incoming requests for which this function returns `true`. */
  ignoreIncomingRequestHook?: IgnoreIncomingRequestFunction;
  /** Do not trace outgoing requests for which this function returns `true`. */
  ignoreOutgoingRequestHook?: IgnoreOutgoingRequestFunction;
  /**
   * Do not extract the propagation context from incoming requests for which
   * this function returns `true`. The request is still traced, but the server
   * span will not be linked to a remote parent. This can be used to ignore
   * trace context from untrusted sources, e.g. based on the request's IP
   * address.
   */
  ignoreIncomingPropagationHook?: IgnoreIncomingPropagationFunction;
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
  /**
   * The primary server name of the matched virtual host.
   * @deprecated No longer used. Stable HTTP semantic conventions do not include
   * the `http.server_name` attribute; this option has no effect.
   */
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
  /**
   * Enable automatic population of synthetic source type based on the user-agent header
   * @experimental
   **/
  enableSyntheticSourceDetection?: boolean;
  /**
   * [Optional] Additional query parameters to redact.
   * Use this to specify custom query strings that contain sensitive information.
   * These will replace/overwrite the default query strings that are to be redacted.
   * @example default strings ['sig','Signature','AWSAccessKeyId','X-Goog-Signature']
   * @experimental
   */
  redactedQueryParams?: string[];
}

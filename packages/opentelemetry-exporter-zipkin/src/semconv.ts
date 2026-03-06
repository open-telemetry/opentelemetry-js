/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/*
 * This file contains a copy of unstable semantic convention definitions
 * used by this package.
 * @see https://github.com/open-telemetry/opentelemetry-js/tree/main/semantic-conventions#unstable-semconv
 */

/**
 * Enum value "zipkin_http_span_exporter" for attribute {@link ATTR_OTEL_COMPONENT_TYPE}.
 *
 * Zipkin span exporter over HTTP
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OTEL_COMPONENT_TYPE_VALUE_ZIPKIN_HTTP_SPAN_EXPORTER =
  'zipkin_http_span_exporter' as const;

/**
 * [HTTP response status code](https://tools.ietf.org/html/rfc7231#section-6).
 *
 * @example 200
 */
export const ATTR_HTTP_RESPONSE_STATUS_CODE =
  'http.response.status_code' as const;

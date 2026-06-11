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
 * Enum value "prometheus_http_text_metric_exporter" for attribute {@link ATTR_OTEL_COMPONENT_TYPE}.
 *
 * Prometheus metric exporter over HTTP with the default text-based format
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OTEL_COMPONENT_TYPE_VALUE_PROMETHEUS_HTTP_TEXT_METRIC_EXPORTER =
  'prometheus_http_text_metric_exporter' as const;

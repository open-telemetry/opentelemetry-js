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
 * Enum value "otlp_grpc_log_exporter" for attribute {@link ATTR_OTEL_COMPONENT_TYPE}.
 *
 * OTLP log record exporter over gRPC with protobuf serialization
 *
 * @experimental This enum value is experimental and is subject to breaking changes in minor releases of `@opentelemetry/semantic-conventions`.
 */
export const OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_LOG_EXPORTER =
  'otlp_grpc_log_exporter' as const;

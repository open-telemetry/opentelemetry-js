/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/semantic_conventions/http.md
 */

interface AttributesType {
  GRPC_ERROR_NAME: string;
  GRPC_ERROR_MESSAGE: string;
}

export const AttributeNames: Readonly<AttributesType> = {
  GRPC_ERROR_NAME: 'grpc.error_name',
  GRPC_ERROR_MESSAGE: 'grpc.error_message',
};

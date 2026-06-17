/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SpanStatusCode } from '@opentelemetry/api';
import type { SpanStatus, Span } from '@opentelemetry/api';
import type { status as GrpcStatus, Metadata } from '@grpc/grpc-js';
import type { IgnoreMatcher } from './types';

// e.g., "dns:otel-productcatalogservice:8080" or "otel-productcatalogservice:8080" or "127.0.0.1:8080"
export const URI_REGEX =
  /(?:([A-Za-z0-9+.-]+):(?:\/\/)?)?(?<name>[A-Za-z0-9+.-]+):(?<port>[0-9+.-]+)$/;

/**
 * Convert a grpc status code to an opentelemetry SpanStatus code.
 * @param status
 */
export const _grpcStatusCodeToOpenTelemetryStatusCode = (
  status?: GrpcStatus
): SpanStatusCode => {
  if (status !== undefined && status === 0) {
    return SpanStatusCode.UNSET;
  }
  return SpanStatusCode.ERROR;
};

export const _grpcStatusCodeToSpanStatus = (status: number): SpanStatus => {
  return { code: _grpcStatusCodeToOpenTelemetryStatusCode(status) };
};

/**
 * Returns true if methodName matches pattern
 * @param methodName the name of the method
 * @param pattern Match pattern
 */
const _satisfiesPattern = (
  methodName: string,
  pattern: IgnoreMatcher
): boolean => {
  if (typeof pattern === 'string') {
    return pattern.toLowerCase() === methodName.toLowerCase();
  } else if (pattern instanceof RegExp) {
    return pattern.test(methodName);
  } else if (typeof pattern === 'function') {
    return pattern(methodName);
  } else {
    return false;
  }
};

/**
 * Returns true if the current plugin configuration
 * ignores the given method.
 * @param methodName the name of the method
 * @param ignoredMethods a list of matching patterns
 * @param onException an error handler for matching exceptions
 */
export const _methodIsIgnored = (
  methodName: string,
  ignoredMethods?: IgnoreMatcher[]
): boolean => {
  if (!ignoredMethods) {
    // No ignored gRPC methods
    return false;
  }

  for (const pattern of ignoredMethods) {
    if (_satisfiesPattern(methodName, pattern)) {
      return true;
    }
  }

  return false;
};

/**
 * Return method and service values getting from grpc name/path
 * @param name the grpc name/path
 */
export const _extractMethodAndService = (
  name: string
): { service: string; method: string } => {
  const serviceMethod = name.replace(/^\//, '').split('/');
  const service = serviceMethod.shift() || '';
  const method = serviceMethod.join('/');

  return {
    service,
    method,
  };
};

export function metadataCapture(
  type: 'request' | 'response',
  metadataToAdd: string[]
) {
  const normalizedMetadataAttributes = new Map(
    metadataToAdd.map(value => [
      value.toLowerCase(),
      value.toLowerCase().replace(/-/g, '_'),
    ])
  );

  return (span: Span, metadata: Metadata) => {
    for (const [
      capturedMetadata,
      normalizedMetadata,
    ] of normalizedMetadataAttributes) {
      const metadataValues = metadata
        .get(capturedMetadata)
        .flatMap(value => (typeof value === 'string' ? value.toString() : []));

      if (metadataValues === undefined || metadataValues.length === 0) {
        continue;
      }

      const key = `rpc.${type}.metadata.${normalizedMetadata}`;

      span.setAttribute(key, metadataValues);
    }
  };
}

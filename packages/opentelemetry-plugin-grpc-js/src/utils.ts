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

import { CanonicalCode, Status } from '@opentelemetry/api';
import type * as grpcTypes from '@grpc/grpc-js'; // For types only
import { IgnoreMatcher } from './types';

/**
 * Symbol to include on grpc call if it has already emitted an error event.
 * grpc events that emit 'error' will also emit 'finish' and so only the
 * error event should be processed.
 */
export const CALL_SPAN_ENDED = Symbol('opentelemetry call span ended');

/**
 * Metadata key used to denote an outgoing opentelemetry request.
 */
const OTEL_OUTGOING_REQUEST_KEY = 'x-opentelemetry-outgoing-request';

/**
 * Convert a grpc status code to an opentelemetry Canonical code. For now, the enums are exactly the same
 * @param status
 */
export const grpcStatusCodeToCanonicalCode = (
  status?: grpcTypes.status
): CanonicalCode => {
  if (status !== 0 && !status) {
    return CanonicalCode.UNKNOWN;
  }
  return status as number;
};

/**
 * Convert grpc status code to an opentelemetry Status object.
 * @param status
 */
export const grpcStatusCodeToSpanStatus = (status: number): Status => {
  return { code: status };
};

/**
 * Returns true if the metadata contains
 * the opentelemetry outgoing request header.
 */
export const containsOtelMetadata = (metadata: grpcTypes.Metadata): boolean => {
  return metadata.get(OTEL_OUTGOING_REQUEST_KEY).length > 0;
};

/**
 * Returns true if methodName matches pattern
 * @param methodName the name of the method
 * @param pattern Match pattern
 */
const satisfiesPattern = (
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
export const methodIsIgnored = (
  methodName: string,
  ignoredMethods?: IgnoreMatcher[]
): boolean => {
  if (!ignoredMethods) {
    // No ignored gRPC methods
    return false;
  }

  for (const pattern of ignoredMethods) {
    if (satisfiesPattern(methodName, pattern)) {
      return true;
    }
  }

  return false;
};

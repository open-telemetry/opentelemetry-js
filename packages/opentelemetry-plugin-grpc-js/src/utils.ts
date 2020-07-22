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

/**
 * Symbol to include on grpc call if it has already emitted an error event.
 * grpc events that emit 'error' will also emit 'finish' and so only the
 * error event should be processed.
 */
export const CALL_SPAN_ENDED = Symbol('opentelemetry call span ended');

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

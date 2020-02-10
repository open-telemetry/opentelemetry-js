/*!
 * Copyright 2019, OpenTelemetry Authors
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
import * as grpcTypes from 'grpc'; // For types only

// Equivalent to lodash _.findIndex
export const findIndex: <T>(args: T[], fn: (arg: T) => boolean) => number = (
  args,
  fn: Function
) => {
  let index = -1;
  for (const arg of args) {
    index++;
    if (fn(arg)) {
      return index;
    }
  }
  return -1;
};

/**
 * Convert a grpc status code to an opentelemetry Canonical code. For now, the enums are exactly the same
 * @param status
 */
export const _grpcStatusCodeToCanonicalCode = (
  status?: grpcTypes.status
): CanonicalCode => {
  if (status !== 0 && !status) {
    return CanonicalCode.UNKNOWN;
  }
  return status as number;
};

export const _grpcStatusCodeToSpanStatus = (status: number): Status => {
  return { code: status };
};

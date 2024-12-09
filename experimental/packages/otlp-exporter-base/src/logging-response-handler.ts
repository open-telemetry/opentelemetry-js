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
import { diag } from '@opentelemetry/api';
import { IOtlpResponseHandler } from './response-handler';

function isPartialSuccessResponse(
  response: unknown
): response is { partialSuccess: never } {
  return Object.prototype.hasOwnProperty.call(response, 'partialSuccess');
}

/**
 * Default response handler that logs a partial success to the console.
 */
export function createLoggingPartialSuccessResponseHandler<
  T,
>(): IOtlpResponseHandler<T> {
  return {
    handleResponse(response: T) {
      // Partial success MUST never be an empty object according the specification
      // see https://opentelemetry.io/docs/specs/otlp/#partial-success
      if (
        response == null ||
        !isPartialSuccessResponse(response) ||
        response.partialSuccess == null ||
        Object.keys(response.partialSuccess).length === 0
      ) {
        return;
      }
      diag.warn(
        'Received Partial Success response:',
        JSON.stringify(response.partialSuccess)
      );
    },
  };
}

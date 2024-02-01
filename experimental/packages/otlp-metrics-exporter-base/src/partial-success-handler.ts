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

import { IExportMetricsServiceResponse } from '@opentelemetry/otlp-transformer';
import { diag } from '@opentelemetry/api';
import { IOTLPResponseHandler } from '@opentelemetry/otlp-exporter-base';

export function createMetricsPartialSuccessHandler(): IOTLPResponseHandler<IExportMetricsServiceResponse> {
  return {
    handleResponse(response: IExportMetricsServiceResponse) {
      if (
        response.partialSuccess?.errorMessage != null ||
        response.partialSuccess?.rejectedDataPoints != null
      ) {
        diag.warn(
          `Export succeeded partially, rejected data points: ${response.partialSuccess.rejectedDataPoints}, message:\n${response.partialSuccess.errorMessage}`
        );
      }
    },
  };
}

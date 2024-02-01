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
import {
  ExportMetricsServiceRequest,
  ExportMetricsServiceResponse,
  IExportMetricsServiceRequest as ProtobufServiceRequest,
} from '@opentelemetry/otlp-proto-exporter-base';
import {
  IExportMetricsServiceRequest,
  IExportMetricsServiceResponse,
} from '@opentelemetry/otlp-transformer';
import { IMetricsSerializer } from '@opentelemetry/otlp-metrics-exporter-base';

export function createProtobufMetricsSerializer(): IMetricsSerializer {
  return {
    serializeRequest,
    deserializeResponse,
  };
}

function serializeRequest(
  request: IExportMetricsServiceRequest
): Uint8Array | undefined {
  const message = ExportMetricsServiceRequest.create(
    request as ProtobufServiceRequest
  );
  if (message) {
    return ExportMetricsServiceRequest.encode(message).finish();
  }
  return undefined;
}

function deserializeResponse(data: Uint8Array): IExportMetricsServiceResponse {
  return ExportMetricsServiceResponse.decode(
    data
  ) as IExportMetricsServiceResponse;
}

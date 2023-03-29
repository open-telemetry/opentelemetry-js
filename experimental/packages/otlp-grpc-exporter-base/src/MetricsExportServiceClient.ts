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

import * as root from './generated/root';
import * as grpc from '@grpc/grpc-js';
import { IExportMetricsServiceRequest } from '@opentelemetry/otlp-transformer';
import { ExportRequestType } from './internal-types';
import IExportMetricsServiceResponse = root.opentelemetry.proto.collector.metrics.v1.IExportMetricsServiceResponse;

const responseType = root.opentelemetry.proto.collector.metrics.v1
  .ExportMetricsServiceResponse as ExportRequestType<IExportMetricsServiceResponse>;

const requestType = root.opentelemetry.proto.collector.metrics.v1
  .ExportMetricsServiceRequest as ExportRequestType<IExportMetricsServiceRequest>;

const metricsServiceDefinition = {
  export: {
    path: '/opentelemetry.proto.collector.metrics.v1.MetricsService/Export',
    requestStream: false,
    responseStream: false,
    requestSerialize: (arg: IExportMetricsServiceRequest) => {
      const buffer = requestType.encode(arg).finish();
      return Buffer.from(buffer);
    },
    requestDeserialize: (arg: Buffer) => {
      return requestType.decode(arg);
    },
    responseSerialize: (arg: IExportMetricsServiceResponse) => {
      const buffer = responseType.encode(arg).finish();
      return Buffer.from(buffer);
    },
    responseDeserialize: (arg: Buffer) => {
      return responseType.decode(arg);
    },
  },
};

// Creates a new instance of a gRPC service client for OTLP metrics
export const MetricExportServiceClient: grpc.ServiceClientConstructor =
  grpc.makeGenericClientConstructor(
    metricsServiceDefinition,
    'MetricsExportService'
  );

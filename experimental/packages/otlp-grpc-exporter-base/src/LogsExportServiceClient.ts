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
import { IExportLogsServiceRequest } from '@opentelemetry/otlp-transformer';
import { ExportType } from './internal-types';
import IExportLogsServiceResponse = root.opentelemetry.proto.collector.logs.v1.IExportLogsServiceResponse;

const responseType = root.opentelemetry.proto.collector.logs.v1
  .ExportLogsServiceResponse as ExportType<IExportLogsServiceResponse>;

const requestType = root.opentelemetry.proto.collector.logs.v1
  .ExportLogsServiceRequest as ExportType<IExportLogsServiceRequest>;

const logsServiceDefinition = {
  export: {
    path: '/opentelemetry.proto.collector.logs.v1.LogsService/Export',
    requestStream: false,
    responseStream: false,
    requestSerialize: (arg: IExportLogsServiceRequest) => {
      return Buffer.from(requestType.encode(arg).finish());
    },
    requestDeserialize: (arg: Buffer) => {
      return requestType.decode(arg);
    },
    responseSerialize: (arg: IExportLogsServiceResponse) => {
      return Buffer.from(responseType.encode(arg).finish());
    },
    responseDeserialize: (arg: Buffer) => {
      return responseType.decode(arg);
    },
  },
};

// Creates a new instance of a gRPC service client for OTLP logs
export const LogsExportServiceClient: grpc.ServiceClientConstructor =
  grpc.makeGenericClientConstructor(logsServiceDefinition, 'LogsExportService');

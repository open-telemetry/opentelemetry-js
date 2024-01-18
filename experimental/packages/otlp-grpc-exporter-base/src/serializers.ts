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
import {
  IExportLogsServiceRequest,
  IExportLogsServiceResponse,
  IExportMetricsServiceRequest,
  IExportMetricsServiceResponse,
  IExportTraceServiceRequest,
  IExportTraceServiceResponse,
} from '@opentelemetry/otlp-transformer';
import { ExportType } from './internal-types';

const logsResponseType = root.opentelemetry.proto.collector.logs.v1
  .ExportLogsServiceResponse as ExportType<IExportLogsServiceResponse>;

const logsRequestType = root.opentelemetry.proto.collector.logs.v1
  .ExportLogsServiceRequest as ExportType<IExportLogsServiceRequest>;

const metricsResponseType = root.opentelemetry.proto.collector.metrics.v1
  .ExportMetricsServiceResponse as ExportType<IExportMetricsServiceResponse>;

const metricsRequestType = root.opentelemetry.proto.collector.metrics.v1
  .ExportMetricsServiceRequest as ExportType<IExportMetricsServiceRequest>;

const traceResponseType = root.opentelemetry.proto.collector.trace.v1
  .ExportTraceServiceResponse as ExportType<IExportTraceServiceResponse>;

const traceRequestType = root.opentelemetry.proto.collector.trace.v1
  .ExportTraceServiceRequest as ExportType<IExportTraceServiceRequest>;

/**
 * Serializes and deserializes the OTLP request/response to and from {@link Uint8Array}
 */
export interface ISerializer<Request, Response> {
  serializeRequest(request: Request): Uint8Array | undefined;
  deserializeResponse(data: Uint8Array): Response;
}

export const LogsSerializer: ISerializer<
  IExportLogsServiceRequest,
  IExportLogsServiceResponse
> = {
  serializeRequest: (arg: IExportLogsServiceRequest) => {
    return Buffer.from(logsRequestType.encode(arg).finish());
  },
  deserializeResponse: (arg: Buffer) => {
    return logsResponseType.decode(arg);
  },
};

export const TraceSerializer: ISerializer<
  IExportTraceServiceRequest,
  IExportTraceServiceResponse
> = {
  serializeRequest: (arg: IExportTraceServiceRequest) => {
    return Buffer.from(traceRequestType.encode(arg).finish());
  },
  deserializeResponse: (arg: Buffer) => {
    return traceResponseType.decode(arg);
  },
};

export const MetricsSerializer: ISerializer<
  IExportMetricsServiceRequest,
  IExportMetricsServiceResponse
> = {
  serializeRequest: (arg: IExportMetricsServiceRequest) => {
    return Buffer.from(metricsRequestType.encode(arg).finish());
  },
  deserializeResponse: (arg: Buffer) => {
    return metricsResponseType.decode(arg);
  },
};

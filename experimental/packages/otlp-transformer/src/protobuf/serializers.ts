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

import * as root from '../generated/root';
import { ISerializer } from '../common/i-serializer';
import {
  IExportMetricsServiceRequest,
  IExportMetricsServiceResponse,
} from '../metrics/types';
import { ExportType } from './protobuf-export-type';
import {
  IExportTraceServiceRequest,
  IExportTraceServiceResponse,
} from '../trace/types';
import {
  IExportLogsServiceRequest,
  IExportLogsServiceResponse,
} from '../logs/types';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { createExportTraceServiceRequest } from '../trace';
import { createExportMetricsServiceRequest } from '../metrics';
import { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import { createExportLogsServiceRequest } from '../logs';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';

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

export const ProtobufLogsSerializer: ISerializer<
  ReadableLogRecord[],
  IExportLogsServiceResponse
> = {
  serializeRequest: (arg: ReadableLogRecord[]) => {
    const request = createExportLogsServiceRequest(arg);
    return logsRequestType.encode(request).finish();
  },
  deserializeResponse: (arg: Uint8Array) => {
    return logsResponseType.decode(arg);
  },
};

export const ProtobufMetricsSerializer: ISerializer<
  ResourceMetrics[],
  IExportMetricsServiceResponse
> = {
  serializeRequest: (arg: ResourceMetrics[]) => {
    const request = createExportMetricsServiceRequest(arg);
    return metricsRequestType.encode(request).finish();
  },
  deserializeResponse: (arg: Uint8Array) => {
    return metricsResponseType.decode(arg);
  },
};

export const ProtobufTraceSerializer: ISerializer<
  ReadableSpan[],
  IExportTraceServiceResponse
> = {
  serializeRequest: (arg: ReadableSpan[]) => {
    const request = createExportTraceServiceRequest(arg);
    return traceRequestType.encode(request).finish();
  },
  deserializeResponse: (arg: Uint8Array) => {
    return traceResponseType.decode(arg);
  },
};

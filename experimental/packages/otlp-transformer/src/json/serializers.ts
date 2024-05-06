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
import { ISerializer } from '../common/i-serializer';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { IExportTraceServiceResponse } from '../trace/types';
import { createExportTraceServiceRequest } from '../trace';
import { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import { createExportMetricsServiceRequest } from '../metrics';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { IExportMetricsServiceResponse } from '../metrics/types';
import { IExportLogsServiceResponse } from '../logs/types';
import { createExportLogsServiceRequest } from '../logs';

export const JsonTraceSerializer: ISerializer<
  ReadableSpan[],
  IExportTraceServiceResponse
> = {
  serializeRequest: (arg: ReadableSpan[]) => {
    const request = createExportTraceServiceRequest(arg, {
      useHex: true,
      useLongBits: false,
    });
    const encoder = new TextEncoder();
    return encoder.encode(JSON.stringify(request));
  },
  deserializeResponse: (arg: Uint8Array) => {
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(arg)) as IExportTraceServiceResponse;
  },
};

export const JsonMetricsSerializer: ISerializer<
  ResourceMetrics[],
  IExportMetricsServiceResponse
> = {
  serializeRequest: (arg: ResourceMetrics[]) => {
    const request = createExportMetricsServiceRequest(arg, {
      useLongBits: false,
    });
    const encoder = new TextEncoder();
    return encoder.encode(JSON.stringify(request));
  },
  deserializeResponse: (arg: Uint8Array) => {
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(arg)) as IExportMetricsServiceResponse;
  },
};

export const JsonLogsSerializer: ISerializer<
  ReadableLogRecord[],
  IExportLogsServiceResponse
> = {
  serializeRequest: (arg: ReadableLogRecord[]) => {
    const request = createExportLogsServiceRequest(arg, {
      useHex: true,
      useLongBits: false,
    });
    const encoder = new TextEncoder();
    return encoder.encode(JSON.stringify(request));
  },
  deserializeResponse: (arg: Uint8Array) => {
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(arg)) as IExportLogsServiceResponse;
  },
};

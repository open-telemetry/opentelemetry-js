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

import * as root from '../../generated/root';
import { ISerializer } from '../../i-serializer';
import { ExportType } from '../../common/protobuf/protobuf-export-type';
import { IExportTraceServiceRequest } from '../internal-types';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { createExportTraceServiceRequest } from '../internal';
import { IExportTraceServiceResponse } from '../export-response';

const traceResponseType = root.opentelemetry.proto.collector.trace.v1
  .ExportTraceServiceResponse as ExportType<IExportTraceServiceResponse>;

const traceRequestType = root.opentelemetry.proto.collector.trace.v1
  .ExportTraceServiceRequest as ExportType<IExportTraceServiceRequest>;

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

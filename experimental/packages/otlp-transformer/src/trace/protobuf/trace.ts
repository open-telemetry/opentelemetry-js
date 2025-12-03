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

import { toBinary, fromBinary, fromJsonString } from '@bufbuild/protobuf';
import { ISerializer } from '../../i-serializer';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { createExportTraceServiceRequest } from '../internal';
import { IExportTraceServiceResponse } from '../export-response';
import {
  ExportTraceServiceRequestSchema,
  ExportTraceServiceResponseSchema,
} from '../../generated/opentelemetry/proto/collector/trace/v1/trace_service_pb';
import { PROTOBUF_JSON_ENCODER } from '../../common/utils';

export const ProtobufTraceSerializer: ISerializer<
  ReadableSpan[],
  IExportTraceServiceResponse
> = {
  serializeRequest: (arg: ReadableSpan[]) => {
    const request = createExportTraceServiceRequest(arg, PROTOBUF_JSON_ENCODER);
    const message = fromJsonString(
      ExportTraceServiceRequestSchema,
      JSON.stringify(request)
    );
    return toBinary(ExportTraceServiceRequestSchema, message);
  },
  deserializeResponse: (arg: Uint8Array) => {
    const response = fromBinary(ExportTraceServiceResponseSchema, arg);
    return {
      partialSuccess: response.partialSuccess
        ? {
            rejectedSpans: Number(response.partialSuccess.rejectedSpans),
            errorMessage: response.partialSuccess.errorMessage,
          }
        : undefined,
    };
  },
};

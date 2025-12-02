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
import { toBinary, fromBinary, fromJson } from '@bufbuild/protobuf';
import type { JsonValue } from '@bufbuild/protobuf';
import { IExportLogsServiceResponse } from '../export-response';
import { createExportLogsServiceRequest } from '../internal';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ISerializer } from '../../i-serializer';
import {
  ExportLogsServiceRequestSchema,
  ExportLogsServiceResponseSchema,
} from '../../generated/opentelemetry/proto/collector/logs/v1/logs_service_pb';
import { PROTOBUF_JSON_ENCODER } from '../../common/utils';

/*
 * @experimental this serializer may receive breaking changes in minor versions, pin this package's version when using this constant
 */
export const ProtobufLogsSerializer: ISerializer<
  ReadableLogRecord[],
  IExportLogsServiceResponse
> = {
  serializeRequest: (arg: ReadableLogRecord[]) => {
    const request = createExportLogsServiceRequest(arg, PROTOBUF_JSON_ENCODER);
    const message = fromJson(
      ExportLogsServiceRequestSchema,
      request as unknown as JsonValue
    );
    return toBinary(ExportLogsServiceRequestSchema, message);
  },
  deserializeResponse: (arg: Uint8Array) => {
    const response = fromBinary(ExportLogsServiceResponseSchema, arg);
    return {
      partialSuccess: response.partialSuccess
        ? {
            rejectedLogRecords: Number(
              response.partialSuccess.rejectedLogRecords
            ),
            errorMessage: response.partialSuccess.errorMessage,
          }
        : undefined,
    };
  },
};

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

import { IExportLogsServiceRequest } from '../internal-types';
import { IExportLogsServiceResponse } from '../export-response';

import { createExportLogsServiceRequest } from '../internal';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ExportType } from '../../common/protobuf/protobuf-export-type';
import { ISerializer } from '../../i-serializer';
import { PROTOBUF_ENCODER } from '../../common/utils';

const logsResponseType = root.opentelemetry.proto.collector.logs.v1
  .ExportLogsServiceResponse as ExportType<IExportLogsServiceResponse>;

const logsRequestType = root.opentelemetry.proto.collector.logs.v1
  .ExportLogsServiceRequest as ExportType<IExportLogsServiceRequest>;

/*
 * @experimental this serializer may receive breaking changes in minor versions, pin this package's version when using this constant
 */
export const ProtobufLogsSerializer: ISerializer<
  ReadableLogRecord[],
  IExportLogsServiceResponse
> = {
  serializeRequest: (arg: ReadableLogRecord[]) => {
    const request = createExportLogsServiceRequest(arg, PROTOBUF_ENCODER);
    return logsRequestType.encode(request).finish();
  },
  deserializeResponse: (arg: Uint8Array) => {
    return logsResponseType.decode(arg);
  },
};

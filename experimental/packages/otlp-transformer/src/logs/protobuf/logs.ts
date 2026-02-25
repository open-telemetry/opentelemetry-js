/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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

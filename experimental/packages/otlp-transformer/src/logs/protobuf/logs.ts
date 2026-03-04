/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import * as root from '../../generated/root';

import { IExportLogsServiceResponse } from '../export-response';

import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ExportType } from '../../common/protobuf/protobuf-export-type';
import { ISerializer } from '../../i-serializer';
import { serializeLogsExportRequest } from './logs-serializer';

const logsResponseType = root.opentelemetry.proto.collector.logs.v1
  .ExportLogsServiceResponse as ExportType<IExportLogsServiceResponse>;

/*
 * @experimental this serializer may receive breaking changes in minor versions, pin this package's version when using this constant
 */
export const ProtobufLogsSerializer: ISerializer<
  ReadableLogRecord[],
  IExportLogsServiceResponse
> = {
  serializeRequest: (arg: ReadableLogRecord[]) => {
    return serializeLogsExportRequest(arg);
  },
  deserializeResponse: (arg: Uint8Array) => {
    return logsResponseType.decode(arg);
  },
};

/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import type { IExportLogsServiceResponse } from '../export-response';
import type { ISerializer } from '../../i-serializer';
import { serializeLogsExportRequest } from './logs-serializer';
import { deserializeExportLogsServiceResponse } from './response-deserializer';

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
    return deserializeExportLogsServiceResponse(arg);
  },
};

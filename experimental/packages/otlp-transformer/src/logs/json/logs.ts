/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { ISerializer } from '../../i-serializer';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { createExportLogsServiceRequest } from '../internal';
import { IExportLogsServiceResponse } from '../export-response';
import { JSON_ENCODER } from '../../common/utils';

/*
 * @experimental this serializer may receive breaking changes in minor versions, pin this package's version when using this constant
 */
export const JsonLogsSerializer: ISerializer<
  ReadableLogRecord[],
  IExportLogsServiceResponse
> = {
  serializeRequest: (arg: ReadableLogRecord[]) => {
    const request = createExportLogsServiceRequest(arg, JSON_ENCODER);
    const encoder = new TextEncoder();
    return encoder.encode(JSON.stringify(request));
  },
  deserializeResponse: (arg: Uint8Array) => {
    if (arg.length === 0) {
      return {};
    }
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(arg)) as IExportLogsServiceResponse;
  },
};

/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import type { ISerializer } from '../../i-serializer';
import type { IExportTraceServiceResponse } from '../export-response';
import { serializeTraceExportRequest } from './trace-serializer';
import { deserializeExportTraceServiceResponse } from './response-deserializer';

export const ProtobufTraceSerializer: ISerializer<
  ReadableSpan[],
  IExportTraceServiceResponse
> = {
  serializeRequest: (arg: ReadableSpan[]) => {
    return serializeTraceExportRequest(arg);
  },
  deserializeResponse: (arg: Uint8Array) => {
    return deserializeExportTraceServiceResponse(arg);
  },
};

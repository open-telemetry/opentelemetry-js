/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as root from '../../generated/root';
import { ISerializer } from '../../i-serializer';
import { ExportType } from '../../common/protobuf/protobuf-export-type';
import { IExportTraceServiceRequest } from '../internal-types';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { createExportTraceServiceRequest } from '../internal';
import { IExportTraceServiceResponse } from '../export-response';
import { PROTOBUF_ENCODER } from '../../common/utils';

const traceResponseType = root.opentelemetry.proto.collector.trace.v1
  .ExportTraceServiceResponse as ExportType<IExportTraceServiceResponse>;

const traceRequestType = root.opentelemetry.proto.collector.trace.v1
  .ExportTraceServiceRequest as ExportType<IExportTraceServiceRequest>;

export const ProtobufTraceSerializer: ISerializer<
  ReadableSpan[],
  IExportTraceServiceResponse
> = {
  serializeRequest: (arg: ReadableSpan[]) => {
    const request = createExportTraceServiceRequest(arg, PROTOBUF_ENCODER);
    return traceRequestType.encode(request).finish();
  },
  deserializeResponse: (arg: Uint8Array) => {
    return traceResponseType.decode(arg);
  },
};

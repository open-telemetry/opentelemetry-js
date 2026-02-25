/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { ISerializer } from '../../i-serializer';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { IExportTraceServiceResponse } from '../export-response';
import { createExportTraceServiceRequest } from '../internal';
import { JSON_ENCODER } from '../../common/utils';

export const JsonTraceSerializer: ISerializer<
  ReadableSpan[],
  IExportTraceServiceResponse
> = {
  serializeRequest: (arg: ReadableSpan[]) => {
    const request = createExportTraceServiceRequest(arg, JSON_ENCODER);
    const encoder = new TextEncoder();
    return encoder.encode(JSON.stringify(request));
  },
  deserializeResponse: (arg: Uint8Array) => {
    if (arg.length === 0) {
      return {};
    }
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(arg)) as IExportTraceServiceResponse;
  },
};

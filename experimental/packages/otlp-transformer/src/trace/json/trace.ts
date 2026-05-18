/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ISerializer } from '../../i-serializer';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import type { IExportTraceServiceResponse } from '../export-response';
import { createExportTraceServiceRequest } from '../internal';
import { JSON_ENCODER } from '../../common/utils';
import { diag } from '@opentelemetry/api';

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
    try {
      return JSON.parse(decoder.decode(arg)) as IExportTraceServiceResponse;
    } catch (err) {
      diag.warn(
        `Failed to parse trace export response: ${err.message}. Returning empty response`
      );
      return {};
    }
  },
};

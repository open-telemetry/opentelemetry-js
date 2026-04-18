/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ISerializer } from '../../i-serializer';
import type { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import { createExportMetricsServiceRequest } from '../internal';
import type { IExportMetricsServiceResponse } from '../export-response';
import { JSON_ENCODER } from '../../common/utils';
import { diag } from '@opentelemetry/api';

export const JsonMetricsSerializer: ISerializer<
  ResourceMetrics,
  IExportMetricsServiceResponse
> = {
  serializeRequest: (arg: ResourceMetrics) => {
    const request = createExportMetricsServiceRequest([arg], JSON_ENCODER);
    const encoder = new TextEncoder();
    return encoder.encode(JSON.stringify(request));
  },
  deserializeResponse: (arg: Uint8Array) => {
    if (arg.length === 0) {
      return {};
    }
    const decoder = new TextDecoder();
    try {
      return JSON.parse(decoder.decode(arg)) as IExportMetricsServiceResponse;
    } catch (err) {
      diag.warn(
        `Failed to parse metrics export response: ${err.message}. Returning empty response`
      );
      return {};
    }
  },
};

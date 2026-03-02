/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { ISerializer } from '../../i-serializer';
import { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import { createExportMetricsServiceRequest } from '../internal';
import { IExportMetricsServiceResponse } from '../export-response';
import { JSON_ENCODER } from '../../common/utils';

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
    return JSON.parse(decoder.decode(arg)) as IExportMetricsServiceResponse;
  },
};

/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ISerializer } from '../../i-serializer';
import type { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import type { IExportMetricsServiceResponse } from '../export-response';
import { serializeMetricsExportRequest } from './metrics-serializer';
import { deserializeExportMetricsServiceResponse } from './response-deserializer';

/*
 * @experimental this serializer may receive breaking changes in minor versions, pin this package's version when using this constant
 */
export const ProtobufMetricsSerializer: ISerializer<
  ResourceMetrics,
  IExportMetricsServiceResponse
> = {
  serializeRequest: (arg: ResourceMetrics) => {
    return serializeMetricsExportRequest(arg);
  },
  deserializeResponse: (arg: Uint8Array) => {
    return deserializeExportMetricsServiceResponse(arg);
  },
};

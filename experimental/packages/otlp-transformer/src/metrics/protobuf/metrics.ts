/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as root from '../../generated/root';
import { ISerializer } from '../../i-serializer';
import { IExportMetricsServiceRequest } from '../internal-types';
import { ExportType } from '../../common/protobuf/protobuf-export-type';
import { createExportMetricsServiceRequest } from '../internal';
import { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import { IExportMetricsServiceResponse } from '../export-response';
import { PROTOBUF_ENCODER } from '../../common/utils';

const metricsResponseType = root.opentelemetry.proto.collector.metrics.v1
  .ExportMetricsServiceResponse as ExportType<IExportMetricsServiceResponse>;

const metricsRequestType = root.opentelemetry.proto.collector.metrics.v1
  .ExportMetricsServiceRequest as ExportType<IExportMetricsServiceRequest>;

export const ProtobufMetricsSerializer: ISerializer<
  ResourceMetrics,
  IExportMetricsServiceResponse
> = {
  serializeRequest: (arg: ResourceMetrics) => {
    const request = createExportMetricsServiceRequest([arg], PROTOBUF_ENCODER);
    return metricsRequestType.encode(request).finish();
  },
  deserializeResponse: (arg: Uint8Array) => {
    return metricsResponseType.decode(arg);
  },
};

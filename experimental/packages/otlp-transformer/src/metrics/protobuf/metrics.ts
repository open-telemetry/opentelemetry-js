/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as root from '../../generated/root';
import { ISerializer } from '../../i-serializer';
import { IExportMetricsServiceRequest } from '../internal-types';
import { ExportType } from '../../common/protobuf/protobuf-export-type';
import { createExportMetricsServiceRequest } from '../internal';
import { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import { IExportMetricsServiceResponse } from '../export-response';

const metricsResponseType = root.opentelemetry.proto.collector.metrics.v1
  .ExportMetricsServiceResponse as ExportType<IExportMetricsServiceResponse>;

const metricsRequestType = root.opentelemetry.proto.collector.metrics.v1
  .ExportMetricsServiceRequest as ExportType<IExportMetricsServiceRequest>;

export const ProtobufMetricsSerializer: ISerializer<
  ResourceMetrics,
  IExportMetricsServiceResponse
> = {
  serializeRequest: (arg: ResourceMetrics) => {
    const request = createExportMetricsServiceRequest([arg]);
    return metricsRequestType.encode(request).finish();
  },
  deserializeResponse: (arg: Uint8Array) => {
    return metricsResponseType.decode(arg);
  },
};

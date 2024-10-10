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

import {
  OTLPMetricExporterBase,
  OTLPMetricExporterOptions,
} from '@opentelemetry/exporter-metrics-otlp-http';
import { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import {
  OTLPGRPCExporterConfigNode,
  OTLPGRPCExporterNodeBase,
} from '@opentelemetry/otlp-grpc-exporter-base';
import {
  IExportMetricsServiceResponse,
  ProtobufMetricsSerializer,
} from '@opentelemetry/otlp-transformer';

class OTLPMetricExporterProxy extends OTLPGRPCExporterNodeBase<
  ResourceMetrics,
  IExportMetricsServiceResponse
> {
  constructor(config?: OTLPGRPCExporterConfigNode & OTLPMetricExporterOptions) {
    super(
      config,
      ProtobufMetricsSerializer,
      'MetricsExportService',
      '/opentelemetry.proto.collector.metrics.v1.MetricsService/Export',
      'METRICS'
    );
  }
}

/**
 * OTLP-gRPC metric exporter
 */
export class OTLPMetricExporter extends OTLPMetricExporterBase<OTLPMetricExporterProxy> {
  constructor(config?: OTLPGRPCExporterConfigNode & OTLPMetricExporterOptions) {
    super(new OTLPMetricExporterProxy(config), config);
  }
}

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
import {
  convertLegacyOtlpGrpcOptions,
  createOtlpGrpcExportDelegate,
  OTLPGRPCExporterConfigNode,
} from '@opentelemetry/otlp-grpc-exporter-base';
import { ProtobufMetricsSerializer } from '@opentelemetry/otlp-transformer';

/**
 * OTLP-gRPC metric exporter
 */
export class OTLPMetricExporter extends OTLPMetricExporterBase {
  constructor(config?: OTLPGRPCExporterConfigNode & OTLPMetricExporterOptions) {
    super(
      createOtlpGrpcExportDelegate(
        convertLegacyOtlpGrpcOptions(config ?? {}, 'METRICS'),
        ProtobufMetricsSerializer,
        'MetricsExportService',
        '/opentelemetry.proto.collector.metrics.v1.MetricsService/Export'
      ),
      config
    );
  }
}

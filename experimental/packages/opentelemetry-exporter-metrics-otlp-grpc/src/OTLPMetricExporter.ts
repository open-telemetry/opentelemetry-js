/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
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

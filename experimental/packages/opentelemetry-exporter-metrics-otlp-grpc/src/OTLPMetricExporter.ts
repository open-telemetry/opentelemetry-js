/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { OTLPMetricExporterOptions } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPMetricExporterBase } from '@opentelemetry/exporter-metrics-otlp-http';
import type { OTLPGRPCExporterConfigNode } from '@opentelemetry/otlp-grpc-exporter-base';
import {
  convertLegacyOtlpGrpcOptions,
  createOtlpGrpcExportDelegate,
} from '@opentelemetry/otlp-grpc-exporter-base';
import {
  MetricsSignal,
  ProtobufMetricsSerializer,
} from '@opentelemetry/otlp-transformer';
import { OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_METRIC_EXPORTER } from './semconv';

/**
 * OTLP-gRPC metric exporter
 */
export class OTLPMetricExporter extends OTLPMetricExporterBase {
  constructor(config?: OTLPGRPCExporterConfigNode & OTLPMetricExporterOptions) {
    super(
      createOtlpGrpcExportDelegate(
        convertLegacyOtlpGrpcOptions(config ?? {}, 'METRICS'),
        ProtobufMetricsSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_METRIC_EXPORTER,
        MetricsSignal,
        config?.meterProvider,
        'MetricsExportService',
        '/opentelemetry.proto.collector.metrics.v1.MetricsService/Export'
      ),
      config
    );
  }
}

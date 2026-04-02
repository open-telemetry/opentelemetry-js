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
  createOtlpGrpcExporterMetrics,
} from '@opentelemetry/otlp-grpc-exporter-base';
import {
  MetricsExporterMetricsHelper,
  ProtobufMetricsSerializer,
} from '@opentelemetry/otlp-transformer';
import { OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_METRIC_EXPORTER } from './semconv';
import type { MeterProvider } from '@opentelemetry/api';

/**
 * OTLP-gRPC metric exporter
 */
export class OTLPMetricExporter extends OTLPMetricExporterBase {
  private readonly _url: string | undefined;
  constructor(config?: OTLPGRPCExporterConfigNode & OTLPMetricExporterOptions) {
    super(
      createOtlpGrpcExportDelegate(
        convertLegacyOtlpGrpcOptions(config ?? {}, 'METRICS'),
        ProtobufMetricsSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_METRIC_EXPORTER,
        MetricsExporterMetricsHelper,
        config?.meterProvider,
        'MetricsExportService',
        '/opentelemetry.proto.collector.metrics.v1.MetricsService/Export'
      ),
      config
    );
    this._url = config?.url;
  }

  /**
   * Sets the meter provider to use to collect metrics for this exporter.
   * @experimental This method is experimental and is subject to breaking changes in minor releases.
   */
  setMeterProvider(meterProvider: MeterProvider) {
    this.setMetrics(
      createOtlpGrpcExporterMetrics(
        OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_METRIC_EXPORTER,
        MetricsExporterMetricsHelper,
        this._url,
        meterProvider
      )
    );
  }
}

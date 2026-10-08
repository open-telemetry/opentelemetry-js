/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { OTLPMetricExporterOptions } from '@opentelemetry/exporter-metrics-otlp-http';
import {
  AggregationTemporalityPreference,
  OTLPMetricExporterBase,
} from '@opentelemetry/exporter-metrics-otlp-http';
import type { PushMetricExporter } from '@opentelemetry/sdk-metrics';
import type { OTLPGRPCExporterConfigNode } from '@opentelemetry/otlp-grpc-exporter-base';
import {
  convertLegacyOtlpGrpcOptions,
  convertLegacyOtlpGrpcOptionsWithoutEnv,
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
        config?.selfObsMeterProvider,
        'MetricsExportService',
        '/opentelemetry.proto.collector.metrics.v1.MetricsService/Export'
      ),
      config
    );
    this._url = config?.url;
  }

  /**
   * Sets the meter provider to use to collect metrics for the exporter itself.
   * @experimental This method is experimental and is subject to breaking changes in minor releases.
   */
  setSelfObsMeterProvider(meterProvider: MeterProvider) {
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

/**
 * Creates a metric exporter that sends data over OTLP/gRPC.
 *
 * Unlike the {@link OTLPMetricExporter} class, the created exporter does not
 * use `OTEL_EXPORTER_OTLP_*` environment variables for configuration: options
 * that are not provided in `config` fall back to the defaults defined by the
 * OTLP exporter specification (in particular, cumulative aggregation
 * temporality is used when `temporalityPreference` is not set, instead of the
 * `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` environment variable).
 * Reading configuration from the environment is the caller's responsibility.
 */
export function createOtlpGrpcMetricExporter(
  config?: OTLPGRPCExporterConfigNode & OTLPMetricExporterOptions
): PushMetricExporter {
  return new OTLPMetricExporterBase(
    createOtlpGrpcExportDelegate(
      convertLegacyOtlpGrpcOptionsWithoutEnv(config ?? {}),
      ProtobufMetricsSerializer,
      OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_METRIC_EXPORTER,
      MetricsExporterMetricsHelper,
      config?.selfObsMeterProvider,
      'MetricsExportService',
      '/opentelemetry.proto.collector.metrics.v1.MetricsService/Export'
    ),
    {
      ...config,
      // default from the specification instead of reading the environment
      temporalityPreference:
        config?.temporalityPreference ??
        AggregationTemporalityPreference.CUMULATIVE,
    }
  );
}

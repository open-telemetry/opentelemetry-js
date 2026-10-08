/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { type MeterProvider } from '@opentelemetry/api';
import type { PushMetricExporter } from '@opentelemetry/sdk-metrics';
import type { OTLPMetricExporterOptions } from '@opentelemetry/exporter-metrics-otlp-http';
import {
  AggregationTemporalityPreference,
  OTLPMetricExporterBase,
} from '@opentelemetry/exporter-metrics-otlp-http';
import type { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import {
  MetricsExporterMetricsHelper,
  ProtobufMetricsSerializer,
} from '@opentelemetry/otlp-transformer';
import {
  createLegacyOtlpBrowserExportDelegate,
  createLegacyOtlpBrowserExporterMetrics,
} from '@opentelemetry/otlp-exporter-base/browser-http';

import { OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER } from '../../semconv';

export class OTLPMetricExporter extends OTLPMetricExporterBase {
  private readonly _url: string | undefined;
  constructor(
    config: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions = {}
  ) {
    super(
      createLegacyOtlpBrowserExportDelegate(
        config,
        ProtobufMetricsSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER,
        MetricsExporterMetricsHelper,
        config?.selfObsMeterProvider,
        'v1/metrics',
        { 'Content-Type': 'application/x-protobuf' }
      ),
      config
    );
    this._url = config.url;
  }

  /**
   * Sets the meter provider to use to collect metrics for the exporter itself.
   * @experimental This method is experimental and is subject to breaking changes in minor releases.
   */
  setSelfObsMeterProvider(meterProvider: MeterProvider) {
    this.setMetrics(
      createLegacyOtlpBrowserExporterMetrics(
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER,
        MetricsExporterMetricsHelper,
        this._url,
        meterProvider
      )
    );
  }
}

/**
 * Creates a metric exporter that sends data over OTLP/HTTP with protobuf
 * encoding.
 *
 * The created exporter does not use `OTEL_EXPORTER_OTLP_*` environment
 * variables for configuration: options that are not provided in `config` fall
 * back to the defaults defined by the OTLP exporter specification (in
 * particular, cumulative aggregation temporality is used when
 * `temporalityPreference` is not set). Reading configuration from the
 * environment is the caller's responsibility.
 */
export function createOtlpProtoMetricExporter(
  config: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions = {}
): PushMetricExporter {
  return new OTLPMetricExporterBase(
    createLegacyOtlpBrowserExportDelegate(
      config,
      ProtobufMetricsSerializer,
      OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER,
      MetricsExporterMetricsHelper,
      config?.selfObsMeterProvider,
      'v1/metrics',
      { 'Content-Type': 'application/x-protobuf' }
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

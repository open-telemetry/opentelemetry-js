/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { type MeterProvider } from '@opentelemetry/api';
import type { OTLPMetricExporterOptions } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPMetricExporterBase } from '@opentelemetry/exporter-metrics-otlp-http';
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
        config?.meterProvider,
        'v1/metrics',
        { 'Content-Type': 'application/x-protobuf' }
      ),
      config
    );
    this._url = config.url;
  }

  /**
   * Sets the meter provider to use to collect metrics for this exporter.
   * @experimental This method is experimental and is subject to breaking changes in minor releases.
   */
  setMeterProvider(meterProvider: MeterProvider) {
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

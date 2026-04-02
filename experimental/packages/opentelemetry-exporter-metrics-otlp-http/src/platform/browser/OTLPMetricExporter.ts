/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { type MeterProvider } from '@opentelemetry/api';
import type { OTLPMetricExporterOptions } from '../../OTLPMetricExporterOptions';
import { OTLPMetricExporterBase } from '../../OTLPMetricExporterBase';
import type { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import {
  JsonMetricsSerializer,
  MetricsExporterMetricsHelper,
} from '@opentelemetry/otlp-transformer';
import {
  createLegacyOtlpBrowserExportDelegate,
  createLegacyOtlpBrowserExporterMetrics,
} from '@opentelemetry/otlp-exporter-base/browser-http';

import { OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER } from '../../semconv';

/**
 * Collector Metric Exporter for Web
 */
export class OTLPMetricExporter extends OTLPMetricExporterBase {
  private readonly _url: string | undefined;
  constructor(config?: OTLPExporterConfigBase & OTLPMetricExporterOptions) {
    super(
      createLegacyOtlpBrowserExportDelegate(
        config ?? {},
        JsonMetricsSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER,
        MetricsExporterMetricsHelper,
        config?.meterProvider,
        'v1/metrics',
        { 'Content-Type': 'application/json' }
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
      createLegacyOtlpBrowserExporterMetrics(
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER,
        MetricsExporterMetricsHelper,
        this._url,
        meterProvider
      )
    );
  }
}

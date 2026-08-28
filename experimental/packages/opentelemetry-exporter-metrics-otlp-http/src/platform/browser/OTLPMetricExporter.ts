/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { type MeterProvider } from '@opentelemetry/api';
import type { PushMetricExporter } from '@opentelemetry/sdk-metrics';
import type { OTLPMetricExporterOptions } from '../../OTLPMetricExporterOptions';
import { AggregationTemporalityPreference } from '../../OTLPMetricExporterOptions';
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
        config?.selfObsMeterProvider,
        'v1/metrics',
        { 'Content-Type': 'application/json' }
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
 * Creates a metric exporter that sends data over OTLP/HTTP with JSON encoding.
 *
 * The created exporter does not use `OTEL_EXPORTER_OTLP_*` environment
 * variables for configuration: options that are not provided in `config` fall
 * back to the defaults defined by the OTLP exporter specification (in
 * particular, cumulative aggregation temporality is used when
 * `temporalityPreference` is not set). Reading configuration from the
 * environment is the caller's responsibility.
 */
export function createOtlpHttpMetricExporter(
  config?: OTLPExporterConfigBase & OTLPMetricExporterOptions
): PushMetricExporter {
  return new OTLPMetricExporterBase(
    createLegacyOtlpBrowserExportDelegate(
      config ?? {},
      JsonMetricsSerializer,
      OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER,
      MetricsExporterMetricsHelper,
      config?.selfObsMeterProvider,
      'v1/metrics',
      { 'Content-Type': 'application/json' }
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

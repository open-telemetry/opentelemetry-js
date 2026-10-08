/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { type MeterProvider } from '@opentelemetry/api';
import type { PushMetricExporter } from '@opentelemetry/sdk-metrics';
import type { OTLPMetricExporterOptions } from '../../OTLPMetricExporterOptions';
import { AggregationTemporalityPreference } from '../../OTLPMetricExporterOptions';
import { OTLPMetricExporterBase } from '../../OTLPMetricExporterBase';
import type { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import {
  JsonMetricsSerializer,
  MetricsExporterMetricsHelper,
} from '@opentelemetry/otlp-transformer';
import {
  convertLegacyHttpOptions,
  convertLegacyHttpOptionsWithoutEnv,
  createOtlpHttpExportDelegate,
  createOtlpHttpExporterMetrics,
} from '@opentelemetry/otlp-exporter-base/node-http';

import { OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER } from '../../semconv';

/**
 * OTLP Metric Exporter for Node.js
 */
export class OTLPMetricExporter extends OTLPMetricExporterBase {
  private readonly _url: string | undefined;
  constructor(config?: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions) {
    super(
      createOtlpHttpExportDelegate(
        convertLegacyHttpOptions(config ?? {}, 'METRICS', 'v1/metrics', {
          'Content-Type': 'application/json',
        }),
        JsonMetricsSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER,
        MetricsExporterMetricsHelper,
        config?.selfObsMeterProvider
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
      createOtlpHttpExporterMetrics(
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
 * Unlike the {@link OTLPMetricExporter} class, the created exporter does not
 * use `OTEL_EXPORTER_OTLP_*` environment variables for configuration: options
 * that are not provided in `config` fall back to the defaults defined by the
 * OTLP exporter specification (in particular, cumulative aggregation
 * temporality is used when `temporalityPreference` is not set, instead of the
 * `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE` environment variable).
 * Reading configuration from the environment is the caller's responsibility.
 */
export function createOtlpHttpMetricExporter(
  config?: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions
): PushMetricExporter {
  return new OTLPMetricExporterBase(
    createOtlpHttpExportDelegate(
      convertLegacyHttpOptionsWithoutEnv(config ?? {}, 'v1/metrics', {
        'Content-Type': 'application/json',
      }),
      JsonMetricsSerializer,
      OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER,
      MetricsExporterMetricsHelper,
      config?.selfObsMeterProvider
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

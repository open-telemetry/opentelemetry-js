/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { OTLPMetricExporterOptions } from '../../OTLPMetricExporterOptions';
import { OTLPMetricExporterBase } from '../../OTLPMetricExporterBase';
import type { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import {
  JsonMetricsSerializer,
  MetricsSignal,
} from '@opentelemetry/otlp-transformer';
import { createLegacyOtlpBrowserExportDelegate } from '@opentelemetry/otlp-exporter-base/browser-http';

import { OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER } from '../../semconv';

/**
 * Collector Metric Exporter for Web
 */
export class OTLPMetricExporter extends OTLPMetricExporterBase {
  constructor(config?: OTLPExporterConfigBase & OTLPMetricExporterOptions) {
    super(
      createLegacyOtlpBrowserExportDelegate(
        config ?? {},
        JsonMetricsSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER,
        MetricsSignal,
        config?.meterProvider,
        'v1/metrics',
        { 'Content-Type': 'application/json' }
      ),
      config
    );
  }
}

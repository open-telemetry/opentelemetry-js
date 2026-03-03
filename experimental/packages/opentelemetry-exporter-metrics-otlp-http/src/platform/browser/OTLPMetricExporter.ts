/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OTLPMetricExporterOptions } from '../../OTLPMetricExporterOptions';
import { OTLPMetricExporterBase } from '../../OTLPMetricExporterBase';
import { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import { JsonMetricsSerializer } from '@opentelemetry/otlp-transformer';
import { createLegacyOtlpBrowserExportDelegate } from '@opentelemetry/otlp-exporter-base/browser-http';

/**
 * Collector Metric Exporter for Web
 */
export class OTLPMetricExporter extends OTLPMetricExporterBase {
  constructor(config?: OTLPExporterConfigBase & OTLPMetricExporterOptions) {
    super(
      createLegacyOtlpBrowserExportDelegate(
        config ?? {},
        JsonMetricsSerializer,
        'v1/metrics',
        { 'Content-Type': 'application/json' }
      ),
      config
    );
  }
}

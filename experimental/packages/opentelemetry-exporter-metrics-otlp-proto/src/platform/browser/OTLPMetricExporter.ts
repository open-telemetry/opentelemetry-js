/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { OTLPMetricExporterOptions } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPMetricExporterBase } from '@opentelemetry/exporter-metrics-otlp-http';
import type { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import { ProtobufMetricsSerializer } from '@opentelemetry/otlp-transformer/protobuf';
import { createLegacyOtlpBrowserExportDelegate } from '@opentelemetry/otlp-exporter-base/browser-http';

export class OTLPMetricExporter extends OTLPMetricExporterBase {
  constructor(
    config: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions = {}
  ) {
    super(
      createLegacyOtlpBrowserExportDelegate(
        config,
        ProtobufMetricsSerializer,
        'v1/metrics',
        { 'Content-Type': 'application/x-protobuf' }
      ),
      config
    );
  }
}

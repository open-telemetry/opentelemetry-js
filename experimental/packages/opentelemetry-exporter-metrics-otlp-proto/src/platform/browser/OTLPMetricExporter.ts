/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { OTLPMetricExporterOptions } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPMetricExporterBase } from '@opentelemetry/exporter-metrics-otlp-http';
import type { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import {
  MetricsSignal,
  ProtobufMetricsSerializer,
} from '@opentelemetry/otlp-transformer';
import { createLegacyOtlpBrowserExportDelegate } from '@opentelemetry/otlp-exporter-base/browser-http';

import { OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER } from '../../semconv';

export class OTLPMetricExporter extends OTLPMetricExporterBase {
  constructor(
    config: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions = {}
  ) {
    super(
      createLegacyOtlpBrowserExportDelegate(
        config,
        ProtobufMetricsSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER,
        MetricsSignal,
        config?.meterProvider,
        'v1/metrics',
        { 'Content-Type': 'application/x-protobuf' }
      ),
      config
    );
  }
}

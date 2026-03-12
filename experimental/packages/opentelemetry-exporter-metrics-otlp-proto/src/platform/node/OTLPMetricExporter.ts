/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { type MeterProvider } from '@opentelemetry/api';
import type { OTLPMetricExporterOptions } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPMetricExporterBase } from '@opentelemetry/exporter-metrics-otlp-http';
import type { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import {
  MetricsSignal,
  ProtobufMetricsSerializer,
} from '@opentelemetry/otlp-transformer';
import {
  convertLegacyHttpOptions,
  createOtlpHttpExportDelegate,
  createOtlpHttpExporterMetrics,
} from '@opentelemetry/otlp-exporter-base/node-http';

import { OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER } from '../../semconv';

export class OTLPMetricExporter extends OTLPMetricExporterBase {
  private readonly _url: string | undefined;
  constructor(config?: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions) {
    super(
      createOtlpHttpExportDelegate(
        convertLegacyHttpOptions(config ?? {}, 'METRICS', 'v1/metrics', {
          'Content-Type': 'application/x-protobuf',
        }),
        ProtobufMetricsSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER,
        MetricsSignal,
        config?.meterProvider
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
      createOtlpHttpExporterMetrics(
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_METRIC_EXPORTER,
        MetricsSignal,
        this._url,
        meterProvider
      )
    );
  }
}

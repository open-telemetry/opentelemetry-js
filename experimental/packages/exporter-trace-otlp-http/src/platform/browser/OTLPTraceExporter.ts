/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import type { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';
import {
  JsonTraceSerializer,
  TraceExporterMetricsHelper,
} from '@opentelemetry/otlp-transformer';
import { createLegacyOtlpBrowserExportDelegate } from '@opentelemetry/otlp-exporter-base/browser-http';

import { OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_SPAN_EXPORTER } from '../../semconv';

/**
 * Collector Trace Exporter for Web
 */
export class OTLPTraceExporter
  extends OTLPExporterBase<ReadableSpan[]>
  implements SpanExporter
{
  constructor(config: OTLPExporterConfigBase = {}) {
    super(
      createLegacyOtlpBrowserExportDelegate(
        config,
        JsonTraceSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_SPAN_EXPORTER,
        TraceExporterMetricsHelper,
        config.meterProvider,
        'v1/traces',
        { 'Content-Type': 'application/json' }
      )
    );
  }
}

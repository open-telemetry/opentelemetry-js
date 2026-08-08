/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace';
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
        config.selfObsMeterProvider,
        'v1/traces',
        { 'Content-Type': 'application/json' }
      )
    );
  }
}

/**
 * Creates a span exporter that sends data over OTLP/HTTP with JSON encoding.
 *
 * The created exporter does not use `OTEL_EXPORTER_OTLP_*` environment
 * variables for configuration: options that are not provided in `config` fall
 * back to the defaults defined by the OTLP exporter specification. Reading
 * configuration from the environment is the caller's responsibility.
 */
export function createOtlpHttpSpanExporter(
  config: OTLPExporterConfigBase = {}
): SpanExporter {
  return new OTLPExporterBase(
    createLegacyOtlpBrowserExportDelegate(
      config,
      JsonTraceSerializer,
      OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_SPAN_EXPORTER,
      TraceExporterMetricsHelper,
      config.selfObsMeterProvider,
      'v1/traces',
      { 'Content-Type': 'application/json' }
    )
  );
}

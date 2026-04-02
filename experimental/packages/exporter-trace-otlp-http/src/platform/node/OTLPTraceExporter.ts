/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import type { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';
import {
  JsonTraceSerializer,
  TraceExporterMetricsHelper,
} from '@opentelemetry/otlp-transformer';
import {
  convertLegacyHttpOptions,
  createOtlpHttpExportDelegate,
} from '@opentelemetry/otlp-exporter-base/node-http';
import { OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_SPAN_EXPORTER } from '../../semconv';

/**
 * Collector Trace Exporter for Node
 */
export class OTLPTraceExporter
  extends OTLPExporterBase<ReadableSpan[]>
  implements SpanExporter
{
  constructor(config: OTLPExporterNodeConfigBase = {}) {
    super(
      createOtlpHttpExportDelegate(
        convertLegacyHttpOptions(config, 'TRACES', 'v1/traces', {
          'Content-Type': 'application/json',
        }),
        JsonTraceSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_SPAN_EXPORTER,
        TraceExporterMetricsHelper,
        config.meterProvider
      )
    );
  }
}

/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace';
import type { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';
import {
  ProtobufTraceSerializer,
  TraceExporterMetricsHelper,
} from '@opentelemetry/otlp-transformer';
import {
  createOtlpHttpExportDelegate,
  convertLegacyHttpOptions,
  convertLegacyHttpOptionsWithoutEnv,
} from '@opentelemetry/otlp-exporter-base/node-http';
import { OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_SPAN_EXPORTER } from '../../semconv';

/**
 * Collector Trace Exporter for Node with protobuf
 */
export class OTLPTraceExporter
  extends OTLPExporterBase<ReadableSpan[]>
  implements SpanExporter
{
  constructor(config: OTLPExporterNodeConfigBase = {}) {
    super(
      createOtlpHttpExportDelegate(
        convertLegacyHttpOptions(config, 'TRACES', 'v1/traces', {
          'Content-Type': 'application/x-protobuf',
        }),
        ProtobufTraceSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_SPAN_EXPORTER,
        TraceExporterMetricsHelper,
        config.selfObsMeterProvider
      )
    );
  }
}

/**
 * Creates a span exporter that sends data over OTLP/HTTP with protobuf
 * encoding.
 *
 * Unlike the {@link OTLPTraceExporter} class, the created exporter does not
 * use `OTEL_EXPORTER_OTLP_*` environment variables for configuration: options
 * that are not provided in `config` fall back to the defaults defined by the
 * OTLP exporter specification. Reading configuration from the environment is
 * the caller's responsibility.
 */
export function createOtlpProtoSpanExporter(
  config: OTLPExporterNodeConfigBase = {}
): SpanExporter {
  return new OTLPExporterBase(
    createOtlpHttpExportDelegate(
      convertLegacyHttpOptionsWithoutEnv(config, 'v1/traces', {
        'Content-Type': 'application/x-protobuf',
      }),
      ProtobufTraceSerializer,
      OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_SPAN_EXPORTER,
      TraceExporterMetricsHelper,
      config.selfObsMeterProvider
    )
  );
}

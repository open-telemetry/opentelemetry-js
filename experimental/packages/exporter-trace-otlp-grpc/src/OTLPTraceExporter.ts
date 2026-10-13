/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace';
import type { OTLPGRPCExporterConfigNode } from '@opentelemetry/otlp-grpc-exporter-base';
import {
  convertLegacyOtlpGrpcOptions,
  convertLegacyOtlpGrpcOptionsWithoutEnv,
  createOtlpGrpcExportDelegate,
} from '@opentelemetry/otlp-grpc-exporter-base';
import {
  ProtobufTraceSerializer,
  TraceExporterMetricsHelper,
} from '@opentelemetry/otlp-transformer';
import { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';

import { OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_SPAN_EXPORTER } from './semconv';

/**
 * OTLP Trace Exporter for Node
 */
export class OTLPTraceExporter
  extends OTLPExporterBase<ReadableSpan[]>
  implements SpanExporter
{
  constructor(config: OTLPGRPCExporterConfigNode = {}) {
    super(
      createOtlpGrpcExportDelegate(
        convertLegacyOtlpGrpcOptions(config, 'TRACES'),
        ProtobufTraceSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_SPAN_EXPORTER,
        TraceExporterMetricsHelper,
        config.selfObsMeterProvider,
        'TraceExportService',
        '/opentelemetry.proto.collector.trace.v1.TraceService/Export'
      )
    );
  }
}

/**
 * Creates a span exporter that sends data over OTLP/gRPC.
 *
 * Unlike the {@link OTLPTraceExporter} class, the created exporter does not
 * use `OTEL_EXPORTER_OTLP_*` environment variables for configuration: options
 * that are not provided in `config` fall back to the defaults defined by the
 * OTLP exporter specification. Reading configuration from the environment is
 * the caller's responsibility.
 */
export function createOtlpGrpcSpanExporter(
  config: OTLPGRPCExporterConfigNode = {}
): SpanExporter {
  return new OTLPExporterBase(
    createOtlpGrpcExportDelegate(
      convertLegacyOtlpGrpcOptionsWithoutEnv(config),
      ProtobufTraceSerializer,
      OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_SPAN_EXPORTER,
      TraceExporterMetricsHelper,
      config.selfObsMeterProvider,
      'TraceExportService',
      '/opentelemetry.proto.collector.trace.v1.TraceService/Export'
    )
  );
}

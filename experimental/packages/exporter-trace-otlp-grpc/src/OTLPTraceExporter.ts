/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import type { OTLPGRPCExporterConfigNode } from '@opentelemetry/otlp-grpc-exporter-base';
import {
  convertLegacyOtlpGrpcOptions,
  createOtlpGrpcExportDelegate,
} from '@opentelemetry/otlp-grpc-exporter-base';
import {
  ProtobufTraceSerializer,
  TraceSignal,
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
        TraceSignal,
        config.meterProvider,
        'TraceExportService',
        '/opentelemetry.proto.collector.trace.v1.TraceService/Export'
      )
    );
  }
}

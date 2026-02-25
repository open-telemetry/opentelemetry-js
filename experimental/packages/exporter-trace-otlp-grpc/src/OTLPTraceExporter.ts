/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import {
  convertLegacyOtlpGrpcOptions,
  createOtlpGrpcExportDelegate,
  OTLPGRPCExporterConfigNode,
} from '@opentelemetry/otlp-grpc-exporter-base';
import { ProtobufTraceSerializer } from '@opentelemetry/otlp-transformer';
import { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';

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
        'TraceExportService',
        '/opentelemetry.proto.collector.trace.v1.TraceService/Export'
      )
    );
  }
}

/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  LogRecordExporter,
  ReadableLogRecord,
} from '@opentelemetry/sdk-logs';
import type { OTLPGRPCExporterConfigNode } from '@opentelemetry/otlp-grpc-exporter-base';
import {
  convertLegacyOtlpGrpcOptions,
  createOtlpGrpcExportDelegate,
} from '@opentelemetry/otlp-grpc-exporter-base';
import {
  LogsSignal,
  ProtobufLogsSerializer,
} from '@opentelemetry/otlp-transformer';
import { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';
import { OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_LOG_EXPORTER } from './semconv';

/**
 * OTLP Logs Exporter for Node
 */
export class OTLPLogExporter
  extends OTLPExporterBase<ReadableLogRecord[]>
  implements LogRecordExporter
{
  constructor(config: OTLPGRPCExporterConfigNode = {}) {
    super(
      createOtlpGrpcExportDelegate(
        convertLegacyOtlpGrpcOptions(config, 'LOGS'),
        ProtobufLogsSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_LOG_EXPORTER,
        LogsSignal,
        config.meterProvider,
        'LogsExportService',
        '/opentelemetry.proto.collector.logs.v1.LogsService/Export'
      )
    );
  }
}

/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import {
  convertLegacyOtlpGrpcOptions,
  createOtlpGrpcExportDelegate,
  OTLPGRPCExporterConfigNode,
} from '@opentelemetry/otlp-grpc-exporter-base';
import { ProtobufLogsSerializer } from '@opentelemetry/otlp-transformer';
import { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';

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
        'LogsExportService',
        '/opentelemetry.proto.collector.logs.v1.LogsService/Export'
      )
    );
  }
}

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
  convertLegacyOtlpGrpcOptionsWithoutEnv,
  createOtlpGrpcExportDelegate,
} from '@opentelemetry/otlp-grpc-exporter-base';
import {
  LogsExporterMetricsHelper,
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
        LogsExporterMetricsHelper,
        config.selfObsMeterProvider,
        'LogsExportService',
        '/opentelemetry.proto.collector.logs.v1.LogsService/Export'
      )
    );
  }
}

/**
 * Creates a log record exporter that sends data over OTLP/gRPC.
 *
 * Unlike the {@link OTLPLogExporter} class, the created exporter does not use
 * `OTEL_EXPORTER_OTLP_*` environment variables for configuration: options that
 * are not provided in `config` fall back to the defaults defined by the OTLP
 * exporter specification. Reading configuration from the environment is the
 * caller's responsibility.
 */
export function createOtlpGrpcLogExporter(
  config: OTLPGRPCExporterConfigNode = {}
): LogRecordExporter {
  return new OTLPExporterBase(
    createOtlpGrpcExportDelegate(
      convertLegacyOtlpGrpcOptionsWithoutEnv(config),
      ProtobufLogsSerializer,
      OTEL_COMPONENT_TYPE_VALUE_OTLP_GRPC_LOG_EXPORTER,
      LogsExporterMetricsHelper,
      config.selfObsMeterProvider,
      'LogsExportService',
      '/opentelemetry.proto.collector.logs.v1.LogsService/Export'
    )
  );
}

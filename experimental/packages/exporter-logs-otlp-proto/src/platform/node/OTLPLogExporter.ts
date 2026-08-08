/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';
import {
  LogsExporterMetricsHelper,
  ProtobufLogsSerializer,
} from '@opentelemetry/otlp-transformer';
import {
  convertLegacyHttpOptions,
  convertLegacyHttpOptionsWithoutEnv,
  createOtlpHttpExportDelegate,
} from '@opentelemetry/otlp-exporter-base/node-http';
import type {
  ReadableLogRecord,
  LogRecordExporter,
} from '@opentelemetry/sdk-logs';

import { OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_LOG_EXPORTER } from '../../semconv';

/**
 * OTLP Log Protobuf Exporter for Node.js
 */
export class OTLPLogExporter
  extends OTLPExporterBase<ReadableLogRecord[]>
  implements LogRecordExporter
{
  constructor(config: OTLPExporterNodeConfigBase = {}) {
    super(
      createOtlpHttpExportDelegate(
        convertLegacyHttpOptions(config, 'LOGS', 'v1/logs', {
          'Content-Type': 'application/x-protobuf',
        }),
        ProtobufLogsSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_LOG_EXPORTER,
        LogsExporterMetricsHelper,
        config.selfObsMeterProvider
      )
    );
  }
}

/**
 * Creates a log record exporter that sends data over OTLP/HTTP with protobuf
 * encoding.
 *
 * Unlike the {@link OTLPLogExporter} class, the created exporter does not use
 * `OTEL_EXPORTER_OTLP_*` environment variables for configuration: options that
 * are not provided in `config` fall back to the defaults defined by the OTLP
 * exporter specification. Reading configuration from the environment is the
 * caller's responsibility.
 */
export function createOtlpProtoLogExporter(
  config: OTLPExporterNodeConfigBase = {}
): LogRecordExporter {
  return new OTLPExporterBase(
    createOtlpHttpExportDelegate(
      convertLegacyHttpOptionsWithoutEnv(config, 'v1/logs', {
        'Content-Type': 'application/x-protobuf',
      }),
      ProtobufLogsSerializer,
      OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_LOG_EXPORTER,
      LogsExporterMetricsHelper,
      config.selfObsMeterProvider
    )
  );
}

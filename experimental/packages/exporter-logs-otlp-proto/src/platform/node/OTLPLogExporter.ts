/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OTLPExporterBase,
  OTLPExporterNodeConfigBase,
} from '@opentelemetry/otlp-exporter-base';
import { ProtobufLogsSerializer } from '@opentelemetry/otlp-transformer';
import {
  convertLegacyHttpOptions,
  createOtlpHttpExportDelegate,
} from '@opentelemetry/otlp-exporter-base/node-http';
import { ReadableLogRecord, LogRecordExporter } from '@opentelemetry/sdk-logs';

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
        ProtobufLogsSerializer
      )
    );
  }
}

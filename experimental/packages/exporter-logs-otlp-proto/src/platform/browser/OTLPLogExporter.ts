/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OTLPExporterConfigBase,
  OTLPExporterBase,
} from '@opentelemetry/otlp-exporter-base';
import { ProtobufLogsSerializer } from '@opentelemetry/otlp-transformer';

import { ReadableLogRecord, LogRecordExporter } from '@opentelemetry/sdk-logs';
import { createLegacyOtlpBrowserExportDelegate } from '@opentelemetry/otlp-exporter-base/browser-http';

/**
 * Collector Trace Exporter for Web
 */
export class OTLPLogExporter
  extends OTLPExporterBase<ReadableLogRecord[]>
  implements LogRecordExporter
{
  constructor(config: OTLPExporterConfigBase = {}) {
    super(
      createLegacyOtlpBrowserExportDelegate(
        config,
        ProtobufLogsSerializer,
        'v1/logs',
        { 'Content-Type': 'application/x-protobuf' }
      )
    );
  }
}

/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';
import {
  LogsSignal,
  ProtobufLogsSerializer,
} from '@opentelemetry/otlp-transformer';

import type {
  ReadableLogRecord,
  LogRecordExporter,
} from '@opentelemetry/sdk-logs';
import { createLegacyOtlpBrowserExportDelegate } from '@opentelemetry/otlp-exporter-base/browser-http';

import { OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_LOG_EXPORTER } from '../../semconv';

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
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_LOG_EXPORTER,
        LogsSignal,
        config.meterProvider,
        'v1/logs',
        { 'Content-Type': 'application/x-protobuf' }
      )
    );
  }
}

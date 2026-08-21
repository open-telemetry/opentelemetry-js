/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ReadableLogRecord,
  LogRecordExporter,
} from '@opentelemetry/sdk-logs';
import type { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import { OTLPExporterBase } from '@opentelemetry/otlp-exporter-base';
import {
  JsonLogsSerializer,
  LogsExporterMetricsHelper,
} from '@opentelemetry/otlp-transformer';
import { createLegacyOtlpBrowserExportDelegate } from '@opentelemetry/otlp-exporter-base/browser-http';

import { OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_LOG_EXPORTER } from '../../semconv';

/**
 * Collector Logs Exporter for Web
 */
export class OTLPLogExporter
  extends OTLPExporterBase<ReadableLogRecord[]>
  implements LogRecordExporter
{
  constructor(config: OTLPExporterConfigBase = {}) {
    super(
      createLegacyOtlpBrowserExportDelegate(
        config,
        JsonLogsSerializer,
        OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_LOG_EXPORTER,
        LogsExporterMetricsHelper,
        config.selfObsMeterProvider,
        'v1/logs',
        { 'Content-Type': 'application/json' }
      )
    );
  }
}

/**
 * Creates a log record exporter that sends data over OTLP/HTTP with JSON
 * encoding.
 *
 * The created exporter does not use `OTEL_EXPORTER_OTLP_*` environment
 * variables for configuration: options that are not provided in `config` fall
 * back to the defaults defined by the OTLP exporter specification. Reading
 * configuration from the environment is the caller's responsibility.
 */
export function createOtlpHttpLogExporter(
  config: OTLPExporterConfigBase = {}
): LogRecordExporter {
  return new OTLPExporterBase(
    createLegacyOtlpBrowserExportDelegate(
      config,
      JsonLogsSerializer,
      OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_LOG_EXPORTER,
      LogsExporterMetricsHelper,
      config.selfObsMeterProvider,
      'v1/logs',
      { 'Content-Type': 'application/json' }
    )
  );
}

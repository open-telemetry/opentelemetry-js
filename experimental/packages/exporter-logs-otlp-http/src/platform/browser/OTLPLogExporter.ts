/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {
  ReadableLogRecord,
  LogRecordExporter,
} from '@opentelemetry/sdk-logs';
import type { OTLPExporterConfigBase } from '@opentelemetry/otlp-exporter-base';
import type { IExportLogsServiceResponse } from '@opentelemetry/otlp-transformer';
import { OTLPExporterBrowserBase } from '@opentelemetry/otlp-exporter-base';
import { baggageUtils, getEnv } from '@opentelemetry/core';
import { JsonLogsSerializer } from '@opentelemetry/otlp-transformer';

import { getDefaultUrl } from '../config';

/**
 * Collector Logs Exporter for Web
 */
export class OTLPLogExporter
  extends OTLPExporterBrowserBase<ReadableLogRecord, IExportLogsServiceResponse>
  implements LogRecordExporter
{
  constructor(config: OTLPExporterConfigBase = {}) {
    // load  OTEL_EXPORTER_OTLP_LOGS_TIMEOUT env var
    super(
      {
        timeoutMillis: getEnv().OTEL_EXPORTER_OTLP_LOGS_TIMEOUT,
        ...config,
      },
      JsonLogsSerializer,
      'application/json'
    );
    this._headers = {
      ...this._headers,
      ...baggageUtils.parseKeyPairsIntoRecord(
        getEnv().OTEL_EXPORTER_OTLP_LOGS_HEADERS
      ),
    };
  }

  getDefaultUrl(config: OTLPExporterConfigBase): string {
    return getDefaultUrl(config);
  }
}

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
import type { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import type { IExportLogsServiceResponse } from '@opentelemetry/otlp-transformer';
import { OTLPExporterNodeBase } from '@opentelemetry/otlp-exporter-base';
import { JsonLogsSerializer } from '@opentelemetry/otlp-transformer';

import { VERSION } from '../../version';

const USER_AGENT = {
  'User-Agent': `OTel-OTLP-Exporter-JavaScript/${VERSION}`,
};

/**
 * Collector Logs Exporter for Node
 */
export class OTLPLogExporter
  extends OTLPExporterNodeBase<ReadableLogRecord, IExportLogsServiceResponse>
  implements LogRecordExporter
{
  constructor(config: OTLPExporterNodeConfigBase = {}) {
    super(
      {
        ...config,
      },
      JsonLogsSerializer,
      {
        ...USER_AGENT,
        'Content-Type': 'application/json',
      },
      'LOGS',
      'v1/logs'
    );
  }
}

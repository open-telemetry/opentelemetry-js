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

import {
  OTLPExporterConfigBase,
  OTLPExporterBrowserBase,
} from '@opentelemetry/otlp-exporter-base';
import {
  IExportLogsServiceResponse,
  ProtobufLogsSerializer,
} from '@opentelemetry/otlp-transformer';

import { ReadableLogRecord, LogRecordExporter } from '@opentelemetry/sdk-logs';

/**
 * Collector Trace Exporter for Web
 */
export class OTLPLogExporter
  extends OTLPExporterBrowserBase<ReadableLogRecord, IExportLogsServiceResponse>
  implements LogRecordExporter
{
  constructor(config: OTLPExporterConfigBase = {}) {
    super(
      config,
      ProtobufLogsSerializer,
      { 'Content-Type': 'application/x-protobuf' },
      'v1/logs'
    );
  }
}

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

import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import {
  OTLPGRPCExporterConfigNode,
  OTLPGRPCExporterNodeBase,
} from '@opentelemetry/otlp-grpc-exporter-base';
import {
  IExportLogsServiceResponse,
  ProtobufLogsSerializer,
} from '@opentelemetry/otlp-transformer';

/**
 * OTLP Logs Exporter for Node
 */
export class OTLPLogExporter
  extends OTLPGRPCExporterNodeBase<
    ReadableLogRecord,
    IExportLogsServiceResponse
  >
  implements LogRecordExporter
{
  constructor(config: OTLPGRPCExporterConfigNode = {}) {
    super(
      config,
      ProtobufLogsSerializer,
      'LogsExportService',
      '/opentelemetry.proto.collector.logs.v1.LogsService/Export',
      'LOGS'
    );
  }
}

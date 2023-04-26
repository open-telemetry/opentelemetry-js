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
import { baggageUtils, getEnv } from '@opentelemetry/core';
import { Metadata } from '@grpc/grpc-js';
import {
  OTLPGRPCExporterConfigNode,
  OTLPGRPCExporterNodeBase,
  ServiceClientType,
  validateAndNormalizeUrl,
  DEFAULT_COLLECTOR_URL,
} from '@opentelemetry/otlp-grpc-exporter-base';
import {
  createExportLogsServiceRequest,
  IExportLogsServiceRequest,
} from '@opentelemetry/otlp-transformer';

/**
 * OTLP Logs Exporter for Node
 */
export class OTLPLogsExporter
  extends OTLPGRPCExporterNodeBase<ReadableLogRecord, IExportLogsServiceRequest>
  implements LogRecordExporter
{
  constructor(config: OTLPGRPCExporterConfigNode = {}) {
    super(config);
    const headers = baggageUtils.parseKeyPairsIntoRecord(
      getEnv().OTEL_EXPORTER_OTLP_LOGS_HEADERS
    );
    this.metadata ||= new Metadata();
    for (const [k, v] of Object.entries(headers)) {
      this.metadata.set(k, v);
    }
  }

  convert(logRecords: ReadableLogRecord[]): IExportLogsServiceRequest {
    return createExportLogsServiceRequest(logRecords);
  }

  getDefaultUrl(config: OTLPGRPCExporterConfigNode) {
    return validateAndNormalizeUrl(this.getUrlFromConfig(config));
  }

  getServiceClientType() {
    return ServiceClientType.LOGS;
  }

  getServiceProtoPath(): string {
    return 'opentelemetry/proto/collector/logs/v1/logs_service.proto';
  }

  getUrlFromConfig(config: OTLPGRPCExporterConfigNode): string {
    if (typeof config.url === 'string') {
      return config.url;
    }

    return (
      getEnv().OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ||
      getEnv().OTEL_EXPORTER_OTLP_ENDPOINT ||
      DEFAULT_COLLECTOR_URL
    );
  }
}

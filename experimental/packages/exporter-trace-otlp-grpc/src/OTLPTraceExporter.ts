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

import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { baggageUtils, getEnv } from '@opentelemetry/core';
import { Metadata } from '@grpc/grpc-js';
import {
  OTLPGRPCExporterConfigNode,
  OTLPGRPCExporterNodeBase,
  ServiceClientType,
  validateAndNormalizeUrl,
  DEFAULT_COLLECTOR_URL
} from '@opentelemetry/otlp-grpc-exporter-base';
import { createExportTraceServiceRequest, IExportTraceServiceRequest } from '@opentelemetry/otlp-transformer';

/**
 * OTLP Trace Exporter for Node
 */
export class OTLPTraceExporter
  extends OTLPGRPCExporterNodeBase<ReadableSpan,
    IExportTraceServiceRequest>
  implements SpanExporter {

  constructor(config: OTLPGRPCExporterConfigNode = {}) {
    super(config);
    const headers = baggageUtils.parseKeyPairsIntoRecord(getEnv().OTEL_EXPORTER_OTLP_TRACES_HEADERS);
    this.metadata ||= new Metadata();
    for (const [k, v] of Object.entries(headers)) {
      this.metadata.set(k, v);
    }
  }

  convert(spans: ReadableSpan[]): IExportTraceServiceRequest {
    return createExportTraceServiceRequest(spans);
  }

  getDefaultUrl(config: OTLPGRPCExporterConfigNode) {
    return validateAndNormalizeUrl(this.getUrlFromConfig(config));
  }

  getServiceClientType() {
    return ServiceClientType.SPANS;
  }

  getServiceProtoPath(): string {
    return 'opentelemetry/proto/collector/trace/v1/trace_service.proto';
  }

  getUrlFromConfig(config: OTLPGRPCExporterConfigNode): string {
    if (typeof config.url === 'string') {
      return config.url;
    }

    return getEnv().OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
      getEnv().OTEL_EXPORTER_OTLP_ENDPOINT ||
      DEFAULT_COLLECTOR_URL;
  }
}

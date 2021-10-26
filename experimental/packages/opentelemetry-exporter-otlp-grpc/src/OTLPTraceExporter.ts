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
import { OTLPExporterNodeBase } from './OTLPExporterNodeBase';
import {
  otlpTypes,
  toOTLPExportTraceServiceRequest,
} from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPExporterConfigNode, ServiceClientType } from './types';
import { baggageUtils, getEnv } from '@opentelemetry/core';
import { validateAndNormalizeUrl } from './util';
import { Metadata } from '@grpc/grpc-js';

const DEFAULT_COLLECTOR_URL = 'localhost:4317';

/**
 * OTLP Trace Exporter for Node
 */
export class OTLPTraceExporter
  extends OTLPExporterNodeBase<
    ReadableSpan,
    otlpTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest
  >
  implements SpanExporter {

  constructor(config: OTLPExporterConfigNode = {}) {
    super(config);
    const headers = baggageUtils.parseKeyPairsIntoRecord(getEnv().OTEL_EXPORTER_OTLP_TRACES_HEADERS);
    this.metadata ||= new Metadata();
    for (const [k, v] of Object.entries(headers)) {
      this.metadata.set(k, v)
    }
  }

  convert(
    spans: ReadableSpan[]
  ): otlpTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest {
    return toOTLPExportTraceServiceRequest(spans, this);
  }

  getDefaultUrl(config: OTLPExporterConfigNode) {
    return typeof config.url === 'string'
      ? validateAndNormalizeUrl(config.url)
      : getEnv().OTEL_EXPORTER_OTLP_TRACES_ENDPOINT.length > 0
      ? validateAndNormalizeUrl(getEnv().OTEL_EXPORTER_OTLP_TRACES_ENDPOINT)
      : getEnv().OTEL_EXPORTER_OTLP_ENDPOINT.length > 0
      ? validateAndNormalizeUrl(getEnv().OTEL_EXPORTER_OTLP_ENDPOINT)
      : DEFAULT_COLLECTOR_URL;
  }

  getServiceClientType() {
    return ServiceClientType.SPANS;
  }

  getServiceProtoPath(): string {
    return 'opentelemetry/proto/collector/trace/v1/trace_service.proto';
  }
}

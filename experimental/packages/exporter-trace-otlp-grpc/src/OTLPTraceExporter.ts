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
import {
  OTLPGRPCExporterConfigNode,
  OTLPGRPCExporterNodeBase,
  validateAndNormalizeUrl,
  DEFAULT_COLLECTOR_URL,
  TraceSerializer,
} from '@opentelemetry/otlp-grpc-exporter-base';
import {
  createExportTraceServiceRequest,
  IExportTraceServiceRequest,
  IExportTraceServiceResponse,
} from '@opentelemetry/otlp-transformer';
import { VERSION } from './version';

const USER_AGENT = {
  'User-Agent': `OTel-OTLP-Exporter-JavaScript/${VERSION}`,
};

/**
 * OTLP Trace Exporter for Node
 */
export class OTLPTraceExporter
  extends OTLPGRPCExporterNodeBase<
    ReadableSpan,
    IExportTraceServiceRequest,
    IExportTraceServiceResponse
  >
  implements SpanExporter
{
  constructor(config: OTLPGRPCExporterConfigNode = {}) {
    const signalSpecificMetadata = {
      ...USER_AGENT,
      ...baggageUtils.parseKeyPairsIntoRecord(
        getEnv().OTEL_EXPORTER_OTLP_TRACES_HEADERS
      ),
    };
    super(
      config,
      signalSpecificMetadata,
      'TraceExportService',
      '/opentelemetry.proto.collector.trace.v1.TraceService/Export',
      TraceSerializer
    );
  }

  convert(spans: ReadableSpan[]): IExportTraceServiceRequest {
    return createExportTraceServiceRequest(spans);
  }

  getDefaultUrl(config: OTLPGRPCExporterConfigNode) {
    return validateAndNormalizeUrl(this.getUrlFromConfig(config));
  }

  getUrlFromConfig(config: OTLPGRPCExporterConfigNode): string {
    if (typeof config.url === 'string') {
      return config.url;
    }

    return (
      getEnv().OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
      getEnv().OTEL_EXPORTER_OTLP_ENDPOINT ||
      DEFAULT_COLLECTOR_URL
    );
  }
}

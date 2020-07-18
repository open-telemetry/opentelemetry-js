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

import { ReadableSpan, SpanExporter } from '@opentelemetry/tracing';
import { CollectorExporterNodeBase } from './CollectorExporterNodeBase';
import * as collectorTypes from '../../types';
import { CollectorProtocolNode } from '../../enums';
import { CollectorExporterConfigNode, ServiceClient } from './types';
import { toCollectorExportTraceServiceRequest } from '../../transform';
import { DEFAULT_COLLECTOR_URL_GRPC } from './utilWithGrpc';

const DEFAULT_SERVICE_NAME = 'collector-trace-exporter';
const DEFAULT_COLLECTOR_URL_JSON = 'http://localhost:55680/v1/trace';

/**
 * Collector Trace Exporter for Node
 */
export class CollectorTraceExporter
  extends CollectorExporterNodeBase<
    ReadableSpan,
    collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest
  >
  implements SpanExporter {
  convert(
    spans: ReadableSpan[]
  ): collectorTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest {
    return toCollectorExportTraceServiceRequest(spans, this);
  }

  getDefaultUrl(config: CollectorExporterConfigNode): string {
    if (!config.url) {
      return config.protocolNode === CollectorProtocolNode.HTTP_JSON
        ? DEFAULT_COLLECTOR_URL_JSON
        : DEFAULT_COLLECTOR_URL_GRPC;
    }
    return config.url;
  }

  getDefaultServiceName(config: CollectorExporterConfigNode): string {
    return config.serviceName || DEFAULT_SERVICE_NAME;
  }

  getServiceClient(packageObject: any, serverAddress: string): ServiceClient {
    return new packageObject.opentelemetry.proto.collector.trace.v1.TraceService(
      serverAddress,
      this.credentials
    );
  }

  getServiceProtoPath(): string {
    return 'opentelemetry/proto/collector/trace/v1/trace_service.proto';
  }
}

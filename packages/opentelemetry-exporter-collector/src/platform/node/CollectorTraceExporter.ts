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
import { CollectorExporterConfigBase } from '../../types';
import { CollectorExporterNodeBase } from './CollectorExporterNodeBase';
import * as collectorTypes from '../../types';
import { toCollectorExportTraceServiceRequest } from '../../transform';

const DEFAULT_SERVICE_NAME = 'collector-trace-exporter';
const DEFAULT_COLLECTOR_URL = 'http://localhost:55681/v1/trace';

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

  getDefaultUrl(config: CollectorExporterConfigBase): string {
    if (!config.url) {
      return DEFAULT_COLLECTOR_URL;
    }
    return config.url;
  }

  getDefaultServiceName(config: CollectorExporterConfigBase): string {
    return config.serviceName || DEFAULT_SERVICE_NAME;
  }
}

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

import { OTLPExporterConfigBase } from '../../types';
import { OTLPExporterBrowserBase } from './OTLPExporterBrowserBase';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { toOTLPExportTraceServiceRequest } from '../../transform';
import * as otlpTypes from '../../types';
import { getEnv, baggageUtils } from '@opentelemetry/core';
import { appendResourcePathToUrlIfNotPresent } from '../../util';

const DEFAULT_COLLECTOR_RESOURCE_PATH = '/v1/traces';
const DEFAULT_COLLECTOR_URL=`http://localhost:55681${DEFAULT_COLLECTOR_RESOURCE_PATH}`;

/**
 * Collector Trace Exporter for Web
 */
export class OTLPTraceExporter
  extends OTLPExporterBrowserBase<
    ReadableSpan,
    otlpTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest
  >
  implements SpanExporter {
  constructor(config: OTLPExporterConfigBase = {}) {
    super(config);
    this._headers = Object.assign(
      this._headers,
      baggageUtils.parseKeyPairsIntoRecord(
        getEnv().OTEL_EXPORTER_OTLP_TRACES_HEADERS
      )
    );
  }
  convert(
    spans: ReadableSpan[]
  ): otlpTypes.opentelemetryProto.collector.trace.v1.ExportTraceServiceRequest {
    return toOTLPExportTraceServiceRequest(spans, this, true);
  }

  getDefaultUrl(config: OTLPExporterConfigBase): string {
    return typeof config.url === 'string'
      ? config.url
      : getEnv().OTEL_EXPORTER_OTLP_TRACES_ENDPOINT.length > 0
      ? getEnv().OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
      : getEnv().OTEL_EXPORTER_OTLP_ENDPOINT.length > 0
      ? appendResourcePathToUrlIfNotPresent(getEnv().OTEL_EXPORTER_OTLP_ENDPOINT, DEFAULT_COLLECTOR_RESOURCE_PATH)
      : DEFAULT_COLLECTOR_URL;
  }
}

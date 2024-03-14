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
import { getEnv, baggageUtils } from '@opentelemetry/core';
import {
  OTLPExporterNodeBase,
  parseHeaders,
} from '@opentelemetry/otlp-exporter-base';
import {
  OTLPExporterNodeConfigBase,
  appendResourcePathToUrl,
  appendRootPathToUrlIfNeeded,
} from '@opentelemetry/otlp-exporter-base';
import {
  IExportTraceServiceRequest,
  IExportTraceServiceResponse,
} from '@opentelemetry/otlp-transformer';
import { VERSION } from '../../version';
import { JsonTraceSerializer } from '@opentelemetry/otlp-transformer';

const DEFAULT_COLLECTOR_RESOURCE_PATH = 'v1/traces';
const DEFAULT_COLLECTOR_URL = `http://localhost:4318/${DEFAULT_COLLECTOR_RESOURCE_PATH}`;
const USER_AGENT = {
  'User-Agent': `OTel-OTLP-Exporter-JavaScript/${VERSION}`,
};

/**
 * Collector Trace Exporter for Node
 */
export class OTLPTraceExporter
  extends OTLPExporterNodeBase<
    ReadableSpan,
    IExportTraceServiceRequest,
    IExportTraceServiceResponse
  >
  implements SpanExporter
{
  constructor(config: OTLPExporterNodeConfigBase = {}) {
    super(config, JsonTraceSerializer, 'application/json');
    this.headers = {
      ...this.headers,
      ...USER_AGENT,
      ...baggageUtils.parseKeyPairsIntoRecord(
        getEnv().OTEL_EXPORTER_OTLP_TRACES_HEADERS
      ),
      ...parseHeaders(config?.headers),
    };
  }

  getDefaultUrl(config: OTLPExporterNodeConfigBase): string {
    return typeof config.url === 'string'
      ? config.url
      : getEnv().OTEL_EXPORTER_OTLP_TRACES_ENDPOINT.length > 0
      ? appendRootPathToUrlIfNeeded(getEnv().OTEL_EXPORTER_OTLP_TRACES_ENDPOINT)
      : getEnv().OTEL_EXPORTER_OTLP_ENDPOINT.length > 0
      ? appendResourcePathToUrl(
          getEnv().OTEL_EXPORTER_OTLP_ENDPOINT,
          DEFAULT_COLLECTOR_RESOURCE_PATH
        )
      : DEFAULT_COLLECTOR_URL;
  }
}

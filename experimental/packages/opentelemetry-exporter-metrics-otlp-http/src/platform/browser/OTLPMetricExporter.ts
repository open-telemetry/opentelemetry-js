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

import { ResourceMetrics } from '@opentelemetry/sdk-metrics-base';
import { baggageUtils, getEnv } from '@opentelemetry/core';
import { defaultOptions, OTLPMetricExporterOptions } from '../../OTLPMetricExporterOptions';
import { OTLPMetricExporterBase } from '../../OTLPMetricExporterBase';
import {
  OTLPExporterBrowserBase,
  OTLPExporterConfigBase,
  appendResourcePathToUrl,
  appendRootPathToUrlIfNeeded
} from '@opentelemetry/otlp-exporter-base';
import { createExportMetricsServiceRequest, IExportMetricsServiceRequest } from '@opentelemetry/otlp-transformer';

const DEFAULT_COLLECTOR_RESOURCE_PATH = 'v1/metrics';
const DEFAULT_COLLECTOR_URL = `http://localhost:4318/${DEFAULT_COLLECTOR_RESOURCE_PATH}`;

class OTLPExporterBrowserProxy extends OTLPExporterBrowserBase<ResourceMetrics, IExportMetricsServiceRequest> {

  constructor(config: OTLPMetricExporterOptions & OTLPExporterConfigBase = defaultOptions) {
    super(config);
    this._headers = Object.assign(
      this._headers,
      baggageUtils.parseKeyPairsIntoRecord(
        getEnv().OTEL_EXPORTER_OTLP_METRICS_HEADERS
      )
    );
  }

  getDefaultUrl(config: OTLPExporterConfigBase): string {
    return typeof config.url === 'string'
      ? config.url
      : getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT.length > 0
        ? appendRootPathToUrlIfNeeded(getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT, DEFAULT_COLLECTOR_RESOURCE_PATH)
        : getEnv().OTEL_EXPORTER_OTLP_ENDPOINT.length > 0
          ? appendResourcePathToUrl(getEnv().OTEL_EXPORTER_OTLP_ENDPOINT, DEFAULT_COLLECTOR_RESOURCE_PATH)
          : DEFAULT_COLLECTOR_URL;
  }

  convert(metrics: ResourceMetrics[]): IExportMetricsServiceRequest {
    return createExportMetricsServiceRequest(metrics);
  }
}

/**
 * Collector Metric Exporter for Web
 */
export class OTLPMetricExporter extends OTLPMetricExporterBase<OTLPExporterBrowserProxy> {
  constructor(config: OTLPExporterConfigBase & OTLPMetricExporterOptions = defaultOptions) {
    super(new OTLPExporterBrowserProxy(config), config);
  }
}

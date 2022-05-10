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

import {
  defaultOptions,
  OTLPMetricExporterOptions
} from '@opentelemetry/exporter-metrics-otlp-http';
import { ServiceClientType, OTLPProtoExporterNodeBase } from '@opentelemetry/otlp-proto-exporter-base';
import { getEnv, baggageUtils} from '@opentelemetry/core';
import { ResourceMetrics} from '@opentelemetry/sdk-metrics-base';
import { OTLPMetricExporterBase } from '@opentelemetry/exporter-metrics-otlp-http';
import {
  OTLPExporterNodeConfigBase,
  appendResourcePathToUrl,
  appendRootPathToUrlIfNeeded
} from '@opentelemetry/otlp-exporter-base';
import { createExportMetricsServiceRequest, IExportMetricsServiceRequest } from '@opentelemetry/otlp-transformer';

const DEFAULT_COLLECTOR_RESOURCE_PATH = 'v1/metrics';
const DEFAULT_COLLECTOR_URL = `http://localhost:4318/${DEFAULT_COLLECTOR_RESOURCE_PATH}`;

class OTLPMetricExporterNodeProxy extends OTLPProtoExporterNodeBase<ResourceMetrics, IExportMetricsServiceRequest> {

  constructor(config: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions = defaultOptions) {
    super(config);
    this.headers = Object.assign(
      this.headers,
      baggageUtils.parseKeyPairsIntoRecord(
        getEnv().OTEL_EXPORTER_OTLP_METRICS_HEADERS
      )
    );
  }

  convert(metrics: ResourceMetrics[]): IExportMetricsServiceRequest {
    return createExportMetricsServiceRequest(metrics);
  }

  getDefaultUrl(config: OTLPExporterNodeConfigBase) {
    return typeof config.url === 'string'
      ? config.url
      : getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT.length > 0
        ? appendRootPathToUrlIfNeeded(getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT, DEFAULT_COLLECTOR_RESOURCE_PATH)
        : getEnv().OTEL_EXPORTER_OTLP_ENDPOINT.length > 0
          ? appendResourcePathToUrl(getEnv().OTEL_EXPORTER_OTLP_ENDPOINT, DEFAULT_COLLECTOR_RESOURCE_PATH)
          : DEFAULT_COLLECTOR_URL;
  }

  getServiceClientType() {
    return ServiceClientType.METRICS;
  }
}

export class OTLPMetricExporter extends OTLPMetricExporterBase<OTLPMetricExporterNodeProxy> {
  constructor(config: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions = defaultOptions) {
    super(new OTLPMetricExporterNodeProxy(config), config);
  }
}

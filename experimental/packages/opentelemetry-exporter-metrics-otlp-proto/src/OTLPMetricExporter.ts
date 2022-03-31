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
  otlpTypes,
  OTLPExporterNodeConfigBase,
  appendResourcePathToUrlIfNotPresent,
} from '@opentelemetry/exporter-trace-otlp-http';
import {
  defaultExporterTemporality,
  defaultOptions,
  OTLPMetricExporterOptions,
  toOTLPExportMetricServiceRequest
} from '@opentelemetry/exporter-metrics-otlp-http';
import { ServiceClientType, OTLPExporterNodeBase } from '@opentelemetry/exporter-trace-otlp-proto';
import { getEnv, baggageUtils} from '@opentelemetry/core';
import { AggregationTemporality, ResourceMetrics} from '@opentelemetry/sdk-metrics-base';
import { OTLPMetricExporterBase } from '@opentelemetry/exporter-metrics-otlp-http';

const DEFAULT_COLLECTOR_RESOURCE_PATH = '/v1/metrics';
const DEFAULT_COLLECTOR_URL = `http://localhost:4318${DEFAULT_COLLECTOR_RESOURCE_PATH}`;


class OTLPMetricExporterNodeProxy extends OTLPExporterNodeBase<ResourceMetrics,
  otlpTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest> {
  protected readonly _aggregationTemporality: AggregationTemporality;

  constructor(config: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions = defaultOptions) {
    super(config);
    this.headers = Object.assign(
      this.headers,
      baggageUtils.parseKeyPairsIntoRecord(
        getEnv().OTEL_EXPORTER_OTLP_METRICS_HEADERS
      )
    );
    this._aggregationTemporality = config.aggregationTemporality ?? defaultExporterTemporality;
  }

  convert(
    metrics: ResourceMetrics[]
  ): otlpTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest {
    return toOTLPExportMetricServiceRequest(
      metrics[0],
      this._aggregationTemporality,
      this
    );
  }

  getDefaultUrl(config: OTLPExporterNodeConfigBase) {
    return typeof config.url === 'string'
      ? config.url
      : getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT.length > 0
        ? getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
        : getEnv().OTEL_EXPORTER_OTLP_ENDPOINT.length > 0
          ? appendResourcePathToUrlIfNotPresent(getEnv().OTEL_EXPORTER_OTLP_ENDPOINT, DEFAULT_COLLECTOR_RESOURCE_PATH)
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

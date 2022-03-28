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

import { ResourceMetrics, PushMetricExporter, AggregationTemporality } from '@opentelemetry/sdk-metrics-base-wip';
import {
  OTLPExporterNodeBase,
  OTLPExporterNodeConfigBase,
  otlpTypes,
  appendResourcePathToUrlIfNotPresent
} from '@opentelemetry/exporter-trace-otlp-http';
import { toOTLPExportMetricServiceRequest } from '../../transformMetrics';
import { getEnv, baggageUtils, ExportResult } from '@opentelemetry/core';
import { OTLPExporterOptions } from '../../OTLPExporterOptions';

const DEFAULT_COLLECTOR_RESOURCE_PATH = '/v1/metrics';
const DEFAULT_COLLECTOR_URL = `http://localhost:4318${DEFAULT_COLLECTOR_RESOURCE_PATH}`;

export class OTLPExporterNodeProxy extends OTLPExporterNodeBase<ResourceMetrics,
  otlpTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest> {
  // Converts time to nanoseconds
  protected readonly _startTime = new Date().getTime() * 1000000;

  constructor(config: OTLPExporterNodeConfigBase = {}) {
    super(config);
    this.headers = Object.assign(
      this.headers,
      baggageUtils.parseKeyPairsIntoRecord(
        getEnv().OTEL_EXPORTER_OTLP_METRICS_HEADERS
      )
    );
  }

  convert(
    metrics: ResourceMetrics[]
  ): otlpTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest {
    return toOTLPExportMetricServiceRequest(
      metrics,
      this._startTime,
      this
    );
  }

  getDefaultUrl(config: OTLPExporterNodeConfigBase): string {
    return typeof config.url === 'string'
      ? config.url
      : getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT.length > 0
        ? getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
        : getEnv().OTEL_EXPORTER_OTLP_ENDPOINT.length > 0
          ? appendResourcePathToUrlIfNotPresent(getEnv().OTEL_EXPORTER_OTLP_ENDPOINT, DEFAULT_COLLECTOR_RESOURCE_PATH)
          : DEFAULT_COLLECTOR_URL;
  }
}

/**
 * Collector Metric Exporter for Node
 */
export class OTLPMetricExporter
  implements PushMetricExporter {
  protected _otlpExporter: OTLPExporterNodeProxy;
  protected _preferredAggregationTemporality: AggregationTemporality;

  constructor(config: OTLPExporterOptions = {aggregationTemporality: AggregationTemporality.CUMULATIVE}) {
    this._otlpExporter = new OTLPExporterNodeProxy(config);
    this._preferredAggregationTemporality = config.aggregationTemporality;
  }

  export(metrics: ResourceMetrics, resultCallback: (result: ExportResult) => void): void {
    this._otlpExporter.export([metrics], resultCallback);
  }

  async shutdown(): Promise<void> {
    await this._otlpExporter.shutdown();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  getPreferredAggregationTemporality(): AggregationTemporality {
    return this._preferredAggregationTemporality;
  }

}

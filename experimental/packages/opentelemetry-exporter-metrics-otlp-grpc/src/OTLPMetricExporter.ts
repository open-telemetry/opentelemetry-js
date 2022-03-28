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

import { otlpTypes } from '@opentelemetry/exporter-trace-otlp-http';
import { toOTLPExportMetricServiceRequest } from '@opentelemetry/exporter-metrics-otlp-http';
import { AggregationTemporality, PushMetricExporter, ResourceMetrics } from '@opentelemetry/sdk-metrics-base-wip';
import {
  OTLPExporterConfigNode,
  OTLPExporterNodeBase,
  ServiceClientType,
  validateAndNormalizeUrl
} from '@opentelemetry/exporter-trace-otlp-grpc';
import { baggageUtils, ExportResult, getEnv } from '@opentelemetry/core';
import { Metadata } from '@grpc/grpc-js';

const DEFAULT_COLLECTOR_URL = 'localhost:4317';

export interface OTLPMetricExporterOptions extends OTLPExporterConfigNode {
  aggregationTemporality: AggregationTemporality
}

class OTLPMetricExporterProxy extends OTLPExporterNodeBase<ResourceMetrics,
  otlpTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest> {
  private readonly _startTime = new Date().getTime() * 1000000;

  constructor(config: OTLPExporterConfigNode) {
    super(config);
    this.metadata ||= new Metadata();
    const headers = baggageUtils.parseKeyPairsIntoRecord(getEnv().OTEL_EXPORTER_OTLP_METRICS_HEADERS);
    for (const [k, v] of Object.entries(headers)) {
      this.metadata.set(k, v);
    }
  }

  getServiceProtoPath(): string {
    return 'opentelemetry/proto/collector/metrics/v1/metrics_service.proto';
  }

  getServiceClientType(): ServiceClientType {
    return ServiceClientType.METRICS;
  }

  getDefaultUrl(config: OTLPExporterConfigNode): string {
    return typeof config.url === 'string'
      ? validateAndNormalizeUrl(config.url)
      : getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT.length > 0
        ? validateAndNormalizeUrl(getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT)
        : getEnv().OTEL_EXPORTER_OTLP_ENDPOINT.length > 0
          ? validateAndNormalizeUrl(getEnv().OTEL_EXPORTER_OTLP_ENDPOINT)
          : DEFAULT_COLLECTOR_URL;
  }

  convert(metrics: ResourceMetrics[]): otlpTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest {
    throw new Error('Method not implemented.');
    return toOTLPExportMetricServiceRequest(
      metrics,
      this._startTime,
      this
    );
  }
}

/**
 * OTLP Metric Exporter for Node
 */
export class OTLPMetricExporter
  implements PushMetricExporter {
  // Converts time to nanoseconds
  protected readonly _startTime = new Date().getTime() * 1000000;
  protected readonly _preferredAggregationTemporality;
  protected _otlpExporter;

  constructor(config: OTLPMetricExporterOptions = { aggregationTemporality: AggregationTemporality.CUMULATIVE }) {
    this._otlpExporter = new OTLPMetricExporterProxy(config);
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

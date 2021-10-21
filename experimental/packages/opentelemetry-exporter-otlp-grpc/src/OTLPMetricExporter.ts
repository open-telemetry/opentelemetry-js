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
  toOTLPExportMetricServiceRequest,
} from '@opentelemetry/exporter-otlp-http';
import { MetricRecord, MetricExporter } from '@opentelemetry/sdk-metrics-base';
import { OTLPExporterConfigNode, ServiceClientType } from './types';
import { OTLPExporterNodeBase } from './OTLPExporterNodeBase';
import { baggageUtils, getEnv } from '@opentelemetry/core';
import { validateAndNormalizeUrl } from './util';
import { Metadata } from '@grpc/grpc-js';

const DEFAULT_COLLECTOR_URL = 'localhost:4317';

/**
 * OTLP Metric Exporter for Node
 */
export class OTLPMetricExporter
  extends OTLPExporterNodeBase<
    MetricRecord,
    otlpTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest
  >
  implements MetricExporter {
  // Converts time to nanoseconds
  protected readonly _startTime = new Date().getTime() * 1000000;

  constructor(config: OTLPExporterConfigNode = {}) {
    super(config);
    const headers = baggageUtils.parseKeyPairsIntoRecord(getEnv().OTEL_EXPORTER_OTLP_METRICS_HEADERS);
    this.metadata ||= new Metadata();
    for (const [k, v] of Object.entries(headers)) {
      this.metadata.set(k, v)
    }
  }

  convert(
    metrics: MetricRecord[]
  ): otlpTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest {
    return toOTLPExportMetricServiceRequest(
      metrics,
      this._startTime,
      this
    );
  }

  getDefaultUrl(config: OTLPExporterConfigNode) {
    return typeof config.url === 'string'
      ? validateAndNormalizeUrl(config.url)
      : getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT.length > 0
      ? validateAndNormalizeUrl(getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT)
      : getEnv().OTEL_EXPORTER_OTLP_ENDPOINT.length > 0
      ? validateAndNormalizeUrl(getEnv().OTEL_EXPORTER_OTLP_ENDPOINT)
      : DEFAULT_COLLECTOR_URL;
  }

  getServiceClientType() {
    return ServiceClientType.METRICS;
  }

  getServiceProtoPath(): string {
    return 'opentelemetry/proto/collector/metrics/v1/metrics_service.proto';
  }
}

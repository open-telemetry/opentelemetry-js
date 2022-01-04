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

import { baggageUtils, getEnv } from '@opentelemetry/core';
import { createTraceClient } from '@opentelemetry/proto';
import { toOTLPExportMetricServiceRequest } from '@opentelemetry/exporter-metrics-otlp-http';
import {
  appendResourcePathToUrlIfNotPresent, OTLPExporterNodeConfigBase, otlpTypes
} from '@opentelemetry/exporter-trace-otlp-http';
import { ServiceClientType } from '@opentelemetry/exporter-trace-otlp-proto';
import { MetricExporter, MetricRecord } from '@opentelemetry/sdk-metrics-base';
import { RPCImpl } from 'protobufjs';

const DEFAULT_COLLECTOR_RESOURCE_PATH = '/v1/metrics';
const DEFAULT_COLLECTOR_URL=`http://localhost:55681${DEFAULT_COLLECTOR_RESOURCE_PATH}`;

/**
 * OTLP Metric Exporter for Node with protobuf
 */
export class OTLPMetricExporter implements MetricExporter {
  // Converts time to nanoseconds
  protected readonly _startTime = new Date().getTime() * 1000000;
  // private _service: TraceService;

  constructor(config: OTLPExporterNodeConfigBase = {}) {
    this._service = createTraceClient(this._rpcImpl);
    this.headers = Object.assign(
      this.headers,
      baggageUtils.parseKeyPairsIntoRecord(
        getEnv().OTEL_EXPORTER_OTLP_METRICS_HEADERS
      )
    );
  }


  private _rpcImpl: RPCImpl = (method, data, callback) => {
  };

  shutdown(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  export(metrics: MetricRecord[]) {

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

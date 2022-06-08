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
  OTLPMetricExporterBase,
  OTLPMetricExporterOptions
} from '@opentelemetry/exporter-metrics-otlp-http';
import { ResourceMetrics } from '@opentelemetry/sdk-metrics-base';
import {
  OTLPGRPCExporterConfigNode,
  OTLPGRPCExporterNodeBase,
  ServiceClientType,
  validateAndNormalizeUrl,
  DEFAULT_COLLECTOR_URL
} from '@opentelemetry/otlp-grpc-exporter-base';
import { baggageUtils, getEnv } from '@opentelemetry/core';
import { Metadata } from '@grpc/grpc-js';
import { createExportMetricsServiceRequest, IExportMetricsServiceRequest } from '@opentelemetry/otlp-transformer';

class OTLPMetricExporterProxy extends OTLPGRPCExporterNodeBase<ResourceMetrics, IExportMetricsServiceRequest> {

  constructor(config: OTLPGRPCExporterConfigNode & OTLPMetricExporterOptions= defaultOptions) {
    super(config);
    const headers = baggageUtils.parseKeyPairsIntoRecord(getEnv().OTEL_EXPORTER_OTLP_METRICS_HEADERS);
    this.metadata ||= new Metadata();
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

  getDefaultUrl(config: OTLPGRPCExporterConfigNode): string {
    return validateAndNormalizeUrl(this.getUrlFromConfig(config));
  }

  convert(metrics: ResourceMetrics[]): IExportMetricsServiceRequest {
    return createExportMetricsServiceRequest(metrics);
  }

  getUrlFromConfig(config: OTLPGRPCExporterConfigNode): string {
    if (typeof config.url === 'string') {
      return config.url;
    }

    return getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
      getEnv().OTEL_EXPORTER_OTLP_ENDPOINT ||
      DEFAULT_COLLECTOR_URL;
  }
}

/**
 * OTLP-gRPC metric exporter
 */
export class OTLPMetricExporter extends OTLPMetricExporterBase<OTLPMetricExporterProxy>{
  constructor(config: OTLPGRPCExporterConfigNode & OTLPMetricExporterOptions = defaultOptions) {
    super(new OTLPMetricExporterProxy(config), config);
  }
}

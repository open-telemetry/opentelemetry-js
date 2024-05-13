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
  OTLPMetricExporterBase,
  OTLPMetricExporterOptions,
} from '@opentelemetry/exporter-metrics-otlp-http';
import { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import {
  OTLPGRPCExporterConfigNode,
  OTLPGRPCExporterNodeBase,
  validateAndNormalizeUrl,
  DEFAULT_COLLECTOR_URL,
} from '@opentelemetry/otlp-grpc-exporter-base';
import { baggageUtils, getEnv } from '@opentelemetry/core';
import {
  IExportMetricsServiceResponse,
  ProtobufMetricsSerializer,
} from '@opentelemetry/otlp-transformer';
import { VERSION } from './version';
import { parseHeaders } from '@opentelemetry/otlp-exporter-base';

const USER_AGENT = {
  'User-Agent': `OTel-OTLP-Exporter-JavaScript/${VERSION}`,
};

class OTLPMetricExporterProxy extends OTLPGRPCExporterNodeBase<
  ResourceMetrics,
  IExportMetricsServiceResponse
> {
  constructor(config?: OTLPGRPCExporterConfigNode & OTLPMetricExporterOptions) {
    const signalSpecificMetadata = {
      ...USER_AGENT,
      ...baggageUtils.parseKeyPairsIntoRecord(
        getEnv().OTEL_EXPORTER_OTLP_METRICS_HEADERS
      ),
      ...parseHeaders(config?.headers),
    };
    super(
      config,
      signalSpecificMetadata,
      'MetricsExportService',
      '/opentelemetry.proto.collector.metrics.v1.MetricsService/Export',
      ProtobufMetricsSerializer
    );
  }

  getDefaultUrl(config: OTLPGRPCExporterConfigNode): string {
    return validateAndNormalizeUrl(this.getUrlFromConfig(config));
  }

  getUrlFromConfig(config: OTLPGRPCExporterConfigNode): string {
    if (typeof config.url === 'string') {
      return config.url;
    }

    return (
      getEnv().OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
      getEnv().OTEL_EXPORTER_OTLP_ENDPOINT ||
      DEFAULT_COLLECTOR_URL
    );
  }
}

/**
 * OTLP-gRPC metric exporter
 */
export class OTLPMetricExporter extends OTLPMetricExporterBase<OTLPMetricExporterProxy> {
  constructor(config?: OTLPGRPCExporterConfigNode & OTLPMetricExporterOptions) {
    super(new OTLPMetricExporterProxy(config), config);
  }
}

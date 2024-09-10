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

import { OTLPMetricExporterOptions } from '@opentelemetry/exporter-metrics-otlp-http';
import { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporterBase } from '@opentelemetry/exporter-metrics-otlp-http';
import {
  OTLPExporterNodeConfigBase,
  OTLPExporterNodeBase,
} from '@opentelemetry/otlp-exporter-base';
import {
  IExportMetricsServiceResponse,
  ProtobufMetricsSerializer,
} from '@opentelemetry/otlp-transformer';
import { VERSION } from './version';

const USER_AGENT = {
  'User-Agent': `OTel-OTLP-Exporter-JavaScript/${VERSION}`,
};

class OTLPMetricExporterNodeProxy extends OTLPExporterNodeBase<
  ResourceMetrics,
  IExportMetricsServiceResponse
> {
  constructor(config?: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions) {
    super(
      config,
      ProtobufMetricsSerializer,
      {
        ...USER_AGENT,
        'Content-Type': 'application/x-protobuf',
      },
      'METRICS',
      'v1/metrics'
    );
  }
}

export class OTLPMetricExporter extends OTLPMetricExporterBase<OTLPMetricExporterNodeProxy> {
  constructor(config?: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions) {
    super(new OTLPMetricExporterNodeProxy(config), config);
  }
}

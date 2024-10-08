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

import { ResourceMetrics } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporterOptions } from '../../OTLPMetricExporterOptions';
import { OTLPMetricExporterBase } from '../../OTLPMetricExporterBase';
import {
  OTLPExporterNodeBase,
  OTLPExporterNodeConfigBase,
} from '@opentelemetry/otlp-exporter-base';
import {
  IExportMetricsServiceResponse,
  JsonMetricsSerializer,
} from '@opentelemetry/otlp-transformer';
import { VERSION } from '../../version';

const USER_AGENT = {
  'User-Agent': `OTel-OTLP-Exporter-JavaScript/${VERSION}`,
};

class OTLPExporterNodeProxy extends OTLPExporterNodeBase<
  ResourceMetrics,
  IExportMetricsServiceResponse
> {
  constructor(config?: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions) {
    super(
      config,
      JsonMetricsSerializer,
      {
        ...USER_AGENT,
        'Content-Type': 'application/json',
      },
      'METRICS',
      'v1/metrics'
    );
  }
}

/**
 * Collector Metric Exporter for Node
 */
export class OTLPMetricExporter extends OTLPMetricExporterBase<OTLPExporterNodeProxy> {
  constructor(config?: OTLPExporterNodeConfigBase & OTLPMetricExporterOptions) {
    super(new OTLPExporterNodeProxy(config), config);
  }
}

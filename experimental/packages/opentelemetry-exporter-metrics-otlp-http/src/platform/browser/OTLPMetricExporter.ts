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
  OTLPExporterBrowserBase,
  OTLPExporterConfigBase,
} from '@opentelemetry/otlp-exporter-base';
import {
  IExportMetricsServiceResponse,
  JsonMetricsSerializer,
} from '@opentelemetry/otlp-transformer';

const DEFAULT_COLLECTOR_RESOURCE_PATH = 'v1/metrics';

class OTLPExporterBrowserProxy extends OTLPExporterBrowserBase<
  ResourceMetrics,
  IExportMetricsServiceResponse
> {
  constructor(config?: OTLPMetricExporterOptions & OTLPExporterConfigBase) {
    super(
      config,
      JsonMetricsSerializer,
      { 'Content-Type': 'application/json' },
      DEFAULT_COLLECTOR_RESOURCE_PATH
    );
  }
}

/**
 * Collector Metric Exporter for Web
 */
export class OTLPMetricExporter extends OTLPMetricExporterBase<OTLPExporterBrowserProxy> {
  constructor(config?: OTLPExporterConfigBase & OTLPMetricExporterOptions) {
    super(new OTLPExporterBrowserProxy(config), config);
  }
}

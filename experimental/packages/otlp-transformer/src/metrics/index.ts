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
import type { ResourceMetrics } from '@opentelemetry/sdk-metrics-base';
import { toAttributes } from '../common/internal';
import { toMetric } from './internal';
import type { IExportMetricsServiceRequest } from './types';

export function createExportMetricsServiceRequest(resourceMetrics: ResourceMetrics): IExportMetricsServiceRequest | null {
  return {
    resourceMetrics: [{
      resource: {
        attributes: toAttributes(resourceMetrics.resource.attributes),
        droppedAttributesCount: 0
      },
      schemaUrl: undefined, // TODO: Schema Url does not exist yet in the SDK.
      instrumentationLibraryMetrics: Array.from(resourceMetrics.instrumentationLibraryMetrics.map(metrics => {
        return {
          instrumentationLibrary: {
            name: metrics.instrumentationLibrary.name,
            version: metrics.instrumentationLibrary.version,
          },
          metrics: metrics.metrics.map(metricData => toMetric(metricData)),
          schemaUrl: metrics.instrumentationLibrary.schemaUrl
        };
      }))
    }]
  };
}

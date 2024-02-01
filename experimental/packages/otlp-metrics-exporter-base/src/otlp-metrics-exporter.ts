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
  AggregationTemporalitySelector,
  PushMetricExporter,
  ResourceMetrics,
} from '@opentelemetry/sdk-metrics';
import { IOLTPExportDelegate } from '@opentelemetry/otlp-exporter-base';
import { ExportResult } from '@opentelemetry/core';
import { InstrumentType } from '@opentelemetry/sdk-metrics/build/src/InstrumentDescriptor';

export function createOtlpMetricsExporter(
  delegate: IOLTPExportDelegate<ResourceMetrics>,
  temporalitySelector: AggregationTemporalitySelector
): PushMetricExporter {
  return {
    export: (
      metrics: ResourceMetrics,
      resultCallback: (result: ExportResult) => void
    ) => delegate.export(metrics, resultCallback),
    selectAggregationTemporality: (instrumentType: InstrumentType) =>
      temporalitySelector(instrumentType),
    forceFlush: () => delegate.forceFlush(),
    shutdown: () => delegate.shutdown(),
  };
}

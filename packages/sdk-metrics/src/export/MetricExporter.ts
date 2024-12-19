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

import { ExportResult } from '@opentelemetry/core';
import { AggregationTemporality } from './AggregationTemporality';
import { InstrumentType, ResourceMetrics } from './MetricData';
import { AggregationOption } from '../view/AggregationOption';

/**
 * An interface that allows different metric services to export recorded data
 * in their own format.
 *
 * To export data this MUST be registered to the Metrics SDK with a MetricReader.
 */
export interface PushMetricExporter {
  /**
   * Called to export sampled {@link ResourceMetrics}.
   * @param metrics the metric data to be exported.
   * @param resultCallback callback for when the export has completed
   */
  export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void
  ): void;

  /**
   * Ensure that the export of any metrics the exporter has received is
   * completed before the returned promise is settled.
   */
  forceFlush(): Promise<void>;

  /**
   * Select the {@link AggregationTemporality} for the given
   * {@link InstrumentType} for this exporter.
   */
  selectAggregationTemporality?(
    instrumentType: InstrumentType
  ): AggregationTemporality;

  /**
   * Select the {@link Aggregation} for the given
   * {@link InstrumentType} for this exporter.
   */
  selectAggregation?(instrumentType: InstrumentType): AggregationOption;

  /**
   * Returns a promise which resolves when the last exportation is completed.
   * Further calls to {@link PushMetricExporter.export} may not export the
   * data.
   */
  shutdown(): Promise<void>;
}

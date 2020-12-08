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

import { Processor } from './Processor';
import * as aggregators from './aggregators';
import {
  MetricRecord,
  MetricKind,
  Aggregator,
  MetricDescriptor,
  AggregationTemporality,
} from './types';
import { mergeAggregator } from '../Utils';

/**
 * Processor which retains all dimensions/labels. It accepts all records and
 * passes them for exporting.
 */
export class BasicProcessor extends Processor {
  aggregatorFor(metricDescriptor: MetricDescriptor): Aggregator {
    switch (metricDescriptor.metricKind) {
      case MetricKind.COUNTER:
      case MetricKind.UP_DOWN_COUNTER:
        return new aggregators.SumAggregator();

      case MetricKind.SUM_OBSERVER:
      case MetricKind.UP_DOWN_SUM_OBSERVER:
      case MetricKind.VALUE_OBSERVER:
        return new aggregators.LastValueAggregator();

      case MetricKind.VALUE_RECORDER:
        return new aggregators.HistogramAggregator(
          metricDescriptor.boundaries || [Infinity]
        );

      default:
        return new aggregators.LastValueAggregator();
    }
  }

  aggregationTemporalityFor(
    _metricDescriptor: MetricDescriptor
  ): AggregationTemporality {
    return AggregationTemporality.CUMULATIVE;
  }

  start() {
    /** Nothing to do with BasicProcessor on start */
  }

  process(record: MetricRecord): void {
    const labels = Object.keys(record.labels)
      .map(k => `${k}=${record.labels[k]}`)
      .join(',');

    const key = record.descriptor.name + labels;
    const cumulation = this._batchMap.get(key);

    if (
      cumulation &&
      this.aggregationTemporalityFor(record.descriptor) ===
        AggregationTemporality.CUMULATIVE
    ) {
      mergeAggregator(record.aggregator, cumulation.aggregator);
    }
    this._batchMap.set(key, record);
  }

  finish() {
    for (const [key, record] of this._batchMap.entries()) {
      if (
        this.aggregationTemporalityFor(record.descriptor) ===
        AggregationTemporality.DELTA
      ) {
        this._batchMap.delete(key);
      }
    }
  }
}

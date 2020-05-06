/*!
 * Copyright 2020, OpenTelemetry Authors
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
  CounterSumAggregator,
  MeasureExactAggregator,
  ObserverAggregator,
} from './aggregators';
import {
  MetricRecord,
  MetricKind,
  Aggregator,
  MetricDescriptor,
} from './types';

/**
 * Base class for all batcher types.
 *
 * The batcher is responsible for storing the aggregators and aggregated
 * values received from updates from metrics in the meter. The stored values
 * will be sent to an exporter for exporting.
 */
export abstract class Batcher {
  protected readonly _batchMap = new Map<string, MetricRecord>();

  /** Returns an aggregator based off metric descriptor. */
  abstract aggregatorFor(metricKind: MetricDescriptor): Aggregator;

  /** Stores record information to be ready for exporting. */
  abstract process(record: MetricRecord): void;

  checkPointSet(): MetricRecord[] {
    return Array.from(this._batchMap.values());
  }
}

/**
 * Batcher which retains all dimensions/labels. It accepts all records and
 * passes them for exporting.
 */
export class UngroupedBatcher extends Batcher {
  aggregatorFor(metricDescriptor: MetricDescriptor): Aggregator {
    switch (metricDescriptor.metricKind) {
      case MetricKind.COUNTER:
        return new CounterSumAggregator();
      case MetricKind.OBSERVER:
        return new ObserverAggregator();
      default:
        return new MeasureExactAggregator();
    }
  }

  process(record: MetricRecord): void {
    const labels = record.descriptor.labelKeys
      .map(k => `${k}=${record.labels[k]}`)
      .join(',');
    this._batchMap.set(record.descriptor.name + labels, record);
  }
}

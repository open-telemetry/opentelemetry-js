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

import { Sum, AggregatorKind, Aggregator, Accumulation, AccumulationRecord } from './types';
import { HrTime } from '@opentelemetry/api';
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { PointDataType, SingularMetricData } from '../export/MetricData';
import { AggregationTemporality } from '../export/AggregationTemporality';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { Maybe } from '../utils';

export class SumAccumulation implements Accumulation {
  constructor(private _current: number = 0) {}

  record(value: number): void {
    this._current += value;
  }

  toPoint(): Sum {
    return this._current;
  }
}

/** Basic aggregator which calculates a Sum from individual measurements. */
export class SumAggregator implements Aggregator<SumAccumulation> {
  public kind: AggregatorKind.SUM = AggregatorKind.SUM;

  createAccumulation() {
    return new SumAccumulation();
  }

  /**
   * Returns the result of the merge of the given accumulations.
   */
  merge(previous: SumAccumulation, delta: SumAccumulation): SumAccumulation {
    return new SumAccumulation(previous.toPoint() + delta.toPoint());
  }

  /**
   * Returns a new DELTA aggregation by comparing two cumulative measurements.
   */
  diff(previous: SumAccumulation, current: SumAccumulation): SumAccumulation {
    return new SumAccumulation(current.toPoint() - previous.toPoint());
  }

  toMetricData(
    resource: Resource,
    instrumentationLibrary: InstrumentationLibrary,
    instrumentDescriptor: InstrumentDescriptor,
    accumulationByAttributes: AccumulationRecord<SumAccumulation>[],
    temporality: AggregationTemporality,
    sdkStartTime: HrTime,
    lastCollectionTime: HrTime,
    collectionTime: HrTime): Maybe<SingularMetricData> {
    return {
      resource,
      instrumentationLibrary,
      instrumentDescriptor,
      pointDataType: PointDataType.SINGULAR,
      pointData: accumulationByAttributes.map(([attributes, accumulation]) => {
        return {
          attributes,
          startTime: temporality === AggregationTemporality.CUMULATIVE ? sdkStartTime : lastCollectionTime,
          endTime: collectionTime,
          point: accumulation.toPoint(),
        }
      })
    }
  }
}

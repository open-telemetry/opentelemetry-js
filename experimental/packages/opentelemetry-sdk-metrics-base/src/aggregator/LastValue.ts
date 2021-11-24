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
import { AggregationTemporality } from '../export/AggregationTemporality';
import { PointDataType, SingularMetricData } from '../export/MetricData';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { Maybe } from '../utils';

export class LastValueAccumulation implements Accumulation {
  constructor(private _current: number = 0) {}

  record(value: number): void {
    this._current = value;
  }

  toPoint(): Sum {
    return this._current;
  }
}

/** Basic aggregator which calculates a Sum from individual measurements. */
export class LastValueAggregator implements Aggregator<LastValueAccumulation> {
  public kind: AggregatorKind.LAST_VALUE = AggregatorKind.LAST_VALUE;

  createAccumulation() {
    return new LastValueAccumulation();
  }

  /**
   * Returns the result of the merge of the given accumulations.
   *
   * Return the newly captured (delta) accumulation for LastValueAggregator.
   */
  merge(_previous: LastValueAccumulation, delta: LastValueAccumulation): LastValueAccumulation {
    return new LastValueAccumulation(delta.toPoint());
  }

  /**
   * Returns a new DELTA aggregation by comparing two cumulative measurements.
   *
   * A delta aggregation is not meaningful to LastValueAggregator, just return
   * a new LastValueAccumulation with the current value.
   */
  diff(_previous: LastValueAccumulation, current: LastValueAccumulation): LastValueAccumulation {
    return new LastValueAccumulation(current.toPoint());
  }

  toMetricData(
    resource: Resource,
    instrumentationLibrary: InstrumentationLibrary,
    instrumentDescriptor: InstrumentDescriptor,
    accumulationByAttributes: AccumulationRecord<LastValueAccumulation>[],
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

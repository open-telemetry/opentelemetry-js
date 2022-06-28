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
import { DataPointType, SingularMetricData } from '../export/MetricData';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { Maybe } from '../utils';
import { AggregationTemporality } from '../export/AggregationTemporality';

export class SumAccumulation implements Accumulation {
  constructor(public startTime: HrTime, public monotonic: boolean, private _current: number = 0, public reset = false) {}

  record(value: number): void {
    if (this.monotonic && value < 0) {
      return;
    }
    this._current += value;
  }

  setStartTime(startTime: HrTime): void {
    this.startTime = startTime;
  }

  toPointValue(): Sum {
    return this._current;
  }
}

/** Basic aggregator which calculates a Sum from individual measurements. */
export class SumAggregator implements Aggregator<SumAccumulation> {
  public kind: AggregatorKind.SUM = AggregatorKind.SUM;

  constructor (public monotonic: boolean) {}

  createAccumulation(startTime: HrTime) {
    return new SumAccumulation(startTime, this.monotonic);
  }

  /**
   * Returns the result of the merge of the given accumulations.
   */
  merge(previous: SumAccumulation, delta: SumAccumulation): SumAccumulation {
    const prevPv = previous.toPointValue();
    const deltaPv = delta.toPointValue();
    if (delta.reset) {
      return new SumAccumulation(delta.startTime, this.monotonic, deltaPv, delta.reset);
    }
    return new SumAccumulation(previous.startTime, this.monotonic, prevPv + deltaPv);
  }

  /**
   * Returns a new DELTA aggregation by comparing two cumulative measurements.
   */
  diff(previous: SumAccumulation, current: SumAccumulation): SumAccumulation {
    const prevPv = previous.toPointValue();
    const currPv = current.toPointValue();
    /**
     * If the SumAggregator is a monotonic one and the previous point value is
     * greater than the current one, a reset is deemed to be happened.
     * Return the current point value to prevent the value from been reset.
     */
    if (this.monotonic && (prevPv > currPv)) {
      return new SumAccumulation(current.startTime, this.monotonic, currPv, true);
    }
    return new SumAccumulation(current.startTime, this.monotonic, currPv - prevPv);
  }

  toMetricData(
    descriptor: InstrumentDescriptor,
    aggregationTemporality: AggregationTemporality,
    accumulationByAttributes: AccumulationRecord<SumAccumulation>[],
    endTime: HrTime): Maybe<SingularMetricData> {
    return {
      descriptor,
      aggregationTemporality,
      dataPointType: DataPointType.SINGULAR,
      dataPoints: accumulationByAttributes.map(([attributes, accumulation]) => {
        return {
          attributes,
          startTime: accumulation.startTime,
          endTime,
          value: accumulation.toPointValue(),
        };
      })
    };
  }
}

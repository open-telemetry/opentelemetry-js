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
  Sum,
  AggregatorKind,
  Aggregator,
  Accumulation,
  AccumulationRecord,
} from './types';
import { DataPointType, SumMetricData } from '../export/MetricData';
import { Maybe } from '../utils';
import { AggregationTemporality } from '../export/AggregationTemporality';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { nanosToHrTime } from '@opentelemetry/core';

export class SumAccumulation implements Accumulation {
  constructor(
    public startTimeUnixNano: bigint,
    public monotonic: boolean,
    private _current: number = 0,
    public reset = false
  ) {}

  record(value: number): void {
    if (this.monotonic && value < 0) {
      return;
    }
    this._current += value;
  }

  setStartTime(startTimeUnixNano: bigint): void {
    this.startTimeUnixNano = startTimeUnixNano;
  }

  toPointValue(): Sum {
    return this._current;
  }
}

/** Basic aggregator which calculates a Sum from individual measurements. */
export class SumAggregator implements Aggregator<SumAccumulation> {
  public kind: AggregatorKind.SUM = AggregatorKind.SUM;

  constructor(public monotonic: boolean) {}

  createAccumulation(startTimeUnixNano: bigint) {
    return new SumAccumulation(startTimeUnixNano, this.monotonic);
  }

  /**
   * Returns the result of the merge of the given accumulations.
   */
  merge(previous: SumAccumulation, delta: SumAccumulation): SumAccumulation {
    const prevPv = previous.toPointValue();
    const deltaPv = delta.toPointValue();
    if (delta.reset) {
      return new SumAccumulation(
        delta.startTimeUnixNano,
        this.monotonic,
        deltaPv,
        delta.reset
      );
    }
    return new SumAccumulation(
      previous.startTimeUnixNano,
      this.monotonic,
      prevPv + deltaPv
    );
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
    if (this.monotonic && prevPv > currPv) {
      return new SumAccumulation(
        current.startTimeUnixNano,
        this.monotonic,
        currPv,
        true
      );
    }
    return new SumAccumulation(
      current.startTimeUnixNano,
      this.monotonic,
      currPv - prevPv
    );
  }

  toMetricData(
    descriptor: InstrumentDescriptor,
    aggregationTemporality: AggregationTemporality,
    accumulationByAttributes: AccumulationRecord<SumAccumulation>[],
    endTimeUnixNano: bigint
  ): Maybe<SumMetricData> {
    return {
      descriptor,
      aggregationTemporality,
      dataPointType: DataPointType.SUM,
      dataPoints: accumulationByAttributes.map(([attributes, accumulation]) => {
        return {
          attributes,
          startTimeUnixNano: accumulation.startTimeUnixNano,
          startTime: nanosToHrTime(accumulation.startTimeUnixNano),
          endTimeUnixNano,
          endTime: nanosToHrTime(endTimeUnixNano),
          value: accumulation.toPointValue(),
        };
      }),
      isMonotonic: this.monotonic,
    };
  }
}

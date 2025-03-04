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
  Accumulation,
  AccumulationRecord,
  Aggregator,
  AggregatorKind,
  LastValue,
} from './types';
import { DataPointType, GaugeMetricData } from '../export/MetricData';
import { Maybe } from '../utils';
import { AggregationTemporality } from '../export/AggregationTemporality';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { millisecondsToNanoseconds } from '@opentelemetry/core';

export class LastValueAccumulation implements Accumulation {
  constructor(
    public startTime: bigint,
    private _current: number = 0,
    public sampleTime: bigint = 0n
  ) {}

  record(value: number): void {
    this._current = value;
    this.sampleTime = millisecondsToNanoseconds(Date.now());
  }

  setStartTime(startTime: bigint): void {
    this.startTime = startTime;
  }

  toPointValue(): LastValue {
    return this._current;
  }
}

/** Basic aggregator which calculates a LastValue from individual measurements. */
export class LastValueAggregator implements Aggregator<LastValueAccumulation> {
  public kind: AggregatorKind.LAST_VALUE = AggregatorKind.LAST_VALUE;

  createAccumulation(startTime: bigint) {
    return new LastValueAccumulation(startTime);
  }

  /**
   * Returns the result of the merge of the given accumulations.
   *
   * Return the newly captured (delta) accumulation for LastValueAggregator.
   */
  merge(
    previous: LastValueAccumulation,
    delta: LastValueAccumulation
  ): LastValueAccumulation {
    const latestAccumulation =
      delta.sampleTime >= previous.sampleTime ? delta : previous;
    return new LastValueAccumulation(
      previous.startTime,
      latestAccumulation.toPointValue(),
      latestAccumulation.sampleTime
    );
  }

  /**
   * Returns a new DELTA aggregation by comparing two cumulative measurements.
   *
   * A delta aggregation is not meaningful to LastValueAggregator, just return
   * the newly captured (delta) accumulation for LastValueAggregator.
   */
  diff(
    previous: LastValueAccumulation,
    current: LastValueAccumulation
  ): LastValueAccumulation {
    // nanoseconds may lose precisions.
    const latestAccumulation =
      current.sampleTime >= previous.sampleTime ? current : previous;
    return new LastValueAccumulation(
      current.startTime,
      latestAccumulation.toPointValue(),
      latestAccumulation.sampleTime
    );
  }

  toMetricData(
    descriptor: InstrumentDescriptor,
    aggregationTemporality: AggregationTemporality,
    accumulationByAttributes: AccumulationRecord<LastValueAccumulation>[],
    endTime: bigint
  ): Maybe<GaugeMetricData> {
    return {
      descriptor,
      aggregationTemporality,
      dataPointType: DataPointType.GAUGE,
      dataPoints: accumulationByAttributes.map(([attributes, accumulation]) => {
        return {
          attributes,
          startTime: accumulation.startTime,
          endTime,
          value: accumulation.toPointValue(),
        };
      }),
    };
  }
}

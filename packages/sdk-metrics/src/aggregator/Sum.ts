/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Sum,
  AggregatorKind,
  Aggregator,
  Accumulation,
  AccumulationRecord,
} from './types';
import { HrTime } from '@opentelemetry/api';
import { DataPointType, SumMetricData } from '../export/MetricData';
import { Maybe } from '../utils';
import { AggregationTemporality } from '../export/AggregationTemporality';
import { InstrumentDescriptor } from '../InstrumentDescriptor';

export class SumAccumulation implements Accumulation {
  public startTime;
  public monotonic;
  private _current;
  public reset;

  constructor(
    startTime: HrTime,
    monotonic: boolean,
    current = 0,
    reset = false
  ) {
    this.startTime = startTime;
    this.monotonic = monotonic;
    this._current = current;
    this.reset = reset;
  }

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
  public monotonic: boolean;

  constructor(monotonic: boolean) {
    this.monotonic = monotonic;
  }

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
      return new SumAccumulation(
        delta.startTime,
        this.monotonic,
        deltaPv,
        delta.reset
      );
    }
    return new SumAccumulation(
      previous.startTime,
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
        current.startTime,
        this.monotonic,
        currPv,
        true
      );
    }
    return new SumAccumulation(
      current.startTime,
      this.monotonic,
      currPv - prevPv
    );
  }

  toMetricData(
    descriptor: InstrumentDescriptor,
    aggregationTemporality: AggregationTemporality,
    accumulationByAttributes: AccumulationRecord<SumAccumulation>[],
    endTime: HrTime
  ): Maybe<SumMetricData> {
    return {
      descriptor,
      aggregationTemporality,
      dataPointType: DataPointType.SUM,
      dataPoints: accumulationByAttributes.map(([attributes, accumulation]) => {
        return {
          attributes,
          startTime: accumulation.startTime,
          endTime,
          value: accumulation.toPointValue(),
        };
      }),
      isMonotonic: this.monotonic,
    };
  }
}

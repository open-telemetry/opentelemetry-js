/*!
 * Copyright 2019, OpenTelemetry Authors
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

import * as types from '@opentelemetry/types';
import { TimeSeries } from './export/types';

/**
 * CounterHandle allows the SDK to observe/record a single metric event. The
 * value of single handle in the `Counter` associated with specified label
 * values.
 */
export class CounterHandle implements types.CounterHandle {
  private _data = 0;

  constructor(
    private readonly _disabled: boolean,
    private readonly _monotonic: boolean,
    private readonly _labelValues: string[],
    private readonly _logger: types.Logger
  ) {}

  add(value: number): void {
    if (this._disabled) return;

    if (this._monotonic && value < 0) {
      this._logger.error('Monotonic counter cannot descend.');
      return;
    }
    this._data = this._data + value;
  }

  /**
   * Returns the TimeSeries with one or more Point.
   *
   * @param timestamp The time at which the counter is recorded.
   * @returns The TimeSeries.
   */
  getTimeSeries(timestamp: types.HrTime): TimeSeries {
    return {
      labelValues: this._labelValues.map(value => ({ value })),
      points: [{ value: this._data, timestamp }],
    };
  }
}

/**
 * GaugeHandle allows the SDK to observe/record a single metric event. The
 * value of single handle in the `Gauge` associated with specified label values.
 */
export class GaugeHandle implements types.GaugeHandle {
  private _data = 0;

  constructor(
    private readonly _disabled: boolean,
    private readonly _monotonic: boolean,
    private readonly _labelValues: string[],
    private readonly _logger: types.Logger
  ) {}

  set(value: number): void {
    if (this._disabled) return;

    if (this._monotonic && value < this._data) {
      this._logger.error('Monotonic gauge cannot descend.');
      return;
    }
    this._data = value;
  }

  /**
   * Returns the TimeSeries with one or more Point.
   *
   * @param timestamp The time at which the gauge is recorded.
   * @returns The TimeSeries.
   */
  getTimeSeries(timestamp: types.HrTime): TimeSeries {
    return {
      labelValues: this._labelValues.map(value => ({ value })),
      points: [{ value: this._data, timestamp }],
    };
  }
}

/**
 * MeasureHandle is an implementation of the {@link MeasureHandle} interface.
 */
export class MeasureHandle implements types.MeasureHandle {
  record(
    value: number,
    distContext?: types.DistributedContext,
    spanContext?: types.SpanContext
  ): void {
    // @todo: implement this method.
    return;
  }
}

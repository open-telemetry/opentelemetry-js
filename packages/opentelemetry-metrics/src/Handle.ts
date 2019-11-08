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
 * This class represent the base to handle, which is responsible for generating
 * the TimeSeries.
 */
export class BaseHandle {
  protected _data = 0;
  protected _labelSet: types.LabelSet;

  constructor(labelSet: types.LabelSet) {
    this._labelSet = labelSet;
  }

  /**
   * Returns the TimeSeries with one or more Point.
   *
   * @param timestamp The time at which the handle is recorded.
   * @returns The TimeSeries.
   */
  getTimeSeries(timestamp: types.HrTime): TimeSeries {
    return {
      labelValues: Object.values(this._labelSet.labels).map(value => ({
        value,
      })),
      points: [{ value: this._data, timestamp }],
    };
  }
}

/**
 * CounterHandle allows the SDK to observe/record a single metric event. The
 * value of single handle in the `Counter` associated with specified LabelSet.
 */
export class CounterHandle extends BaseHandle implements types.CounterHandle {
  constructor(
    labelSet: types.LabelSet,
    private readonly _disabled: boolean,
    private readonly _monotonic: boolean,
    private readonly _valueType: types.ValueType,
    private readonly _logger: types.Logger,
    private readonly _onUpdate: Function
  ) {
    super(labelSet);
  }

  add(value: number): void {
    if (this._disabled) return;

    if (this._monotonic && value < 0) {
      this._logger.error(
        `Monotonic counter cannot descend for ${Object.values(
          this._labelSet.labels
        )}`
      );
      return;
    }
    if (this._valueType === types.ValueType.INT && !Number.isInteger(value)) {
      this._logger.warn(
        `INT counter cannot accept a floating-point value for ${Object.values(
          this._labelSet.labels
        )}, ignoring the fractional digits.`
      );
      value = Math.trunc(value);
    }
    this._data = this._data + value;
    this._onUpdate();
  }
}

/**
 * GaugeHandle allows the SDK to observe/record a single metric event. The
 * value of single handle in the `Gauge` associated with specified LabelSet.
 */
export class GaugeHandle extends BaseHandle implements types.GaugeHandle {
  constructor(
    labelSet: types.LabelSet,
    private readonly _disabled: boolean,
    private readonly _monotonic: boolean,
    private readonly _valueType: types.ValueType,
    private readonly _logger: types.Logger,
    private readonly _onUpdate: Function
  ) {
    super(labelSet);
  }

  set(value: number): void {
    if (this._disabled) return;

    if (this._monotonic && value < this._data) {
      this._logger.error(
        `Monotonic gauge cannot descend for ${Object.values(
          this._labelSet.labels
        )}`
      );
      return;
    }

    if (this._valueType === types.ValueType.INT && !Number.isInteger(value)) {
      this._logger.warn(
        `INT gauge cannot accept a floating-point value for ${Object.values(
          this._labelSet.labels
        )}, ignoring the fractional digits.`
      );
      value = Math.trunc(value);
    }
    this._data = value;
    this._onUpdate();
  }
}

/**
 * MeasureHandle is an implementation of the {@link MeasureHandle} interface.
 */
export class MeasureHandle extends BaseHandle implements types.MeasureHandle {
  record(
    value: number,
    distContext?: types.DistributedContext,
    spanContext?: types.SpanContext
  ): void {
    // @todo: implement this method.
    return;
  }
}

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

/**
 * CounterHandle allows the SDK to observe/record a single metric event. The
 * value of single handle in the `Counter` associated with specified label
 * values.
 */
export class CounterHandle implements types.CounterHandle {
  // @todo: remove below line once data is exported as a part of Metric.
  /* tslint:disable-next-line:no-unused-variable */
  private _data = 0;
  constructor(
    private readonly _disabled: boolean,
    private readonly _monotonic: boolean
  ) {}

  add(value: number): void {
    if (this._disabled) return;

    if (this._monotonic && value < 0) {
      // log: Monotonic counter cannot descend.
      return;
    }
    this._data = this._data + value;
  }
}

/**
 * GaugeHandle allows the SDK to observe/record a single metric event. The
 * value of single handle in the `Gauge` associated with specified label values.
 */
export class GaugeHandle implements types.GaugeHandle {
  // @todo: remove below line once data is exported as a part of Metric.
  /* tslint:disable-next-line:no-unused-variable */
  private _data = 0;
  constructor(
    private readonly _disabled: boolean,
    private readonly _monotonic: boolean
  ) {}

  set(value: number): void {
    if (this._disabled) return;

    if (this._monotonic && value < this._data) {
      // log: Monotonic gauge cannot descend.
      return;
    }
    this._data = value;
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

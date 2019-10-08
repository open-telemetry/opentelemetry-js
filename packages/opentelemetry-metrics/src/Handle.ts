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

export class BaseHandle {
  protected _data = 0;
  protected _disabled: boolean;
  protected _monotonic: boolean;

  constructor(disabled: boolean, monotonic: boolean) {
    this._disabled = disabled;
    this._monotonic = monotonic;
  }

  protected validateUpdate() {
    if (this._disabled) return false;
    return true;
  }
}

/**
 * CounterHandle is an implementation of the {@link CounterHandle} interface.
 */
export class CounterHandle extends BaseHandle implements types.CounterHandle {
  constructor(disabled: boolean, monotonic: boolean) {
    super(disabled, monotonic);
  }

  add(value: number): void {
    if (!this.validateUpdate()) return;

    if (this._monotonic && value < 0) {
      // log: Monotonic counter cannot descend.
      return;
    }
    this._data += value;
  }
}

/**
 * GaugeHandle is an implementation of the {@link GaugeHandle} interface.
 */
export class GaugeHandle extends BaseHandle implements types.GaugeHandle {
  constructor(disabled: boolean, monotonic: boolean) {
    super(disabled, monotonic);
  }

  set(value: number): void {
    return;
  }
}

/**
 * MeasureHandle is an implementation of the {@link MeasureHandle} interface.
 */
export class MeasureHandle extends BaseHandle implements types.MeasureHandle {
  constructor(disabled: boolean, monotonic: boolean) {
    super(disabled, monotonic);
  }

  record(
    value: number,
    distContext?: types.DistributedContext,
    spanContext?: types.SpanContext
  ): void {
    throw new Error('not implemented yet');
  }
}

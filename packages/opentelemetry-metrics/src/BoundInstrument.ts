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

import * as types from '@opentelemetry/api';
import { Aggregator } from './export/types';

/**
 * This class represent the base to BoundInstrument, which is responsible for generating
 * the TimeSeries.
 */
export class BaseBoundInstrument {
  protected _labelSet: types.LabelSet;
  protected _logger: types.Logger;
  protected _monotonic: boolean;

  constructor(
    labelSet: types.LabelSet,
    logger: types.Logger,
    monotonic: boolean,
    private readonly _disabled: boolean,
    private readonly _valueType: types.ValueType,
    private readonly _aggregator: Aggregator
  ) {
    this._labelSet = labelSet;
    this._logger = logger;
    this._monotonic = monotonic;
  }

  update(value: number): void {
    if (this._disabled) return;

    if (this._valueType === types.ValueType.INT && !Number.isInteger(value)) {
      this._logger.warn(
        `INT value type cannot accept a floating-point value for ${Object.values(
          this._labelSet.labels
        )}, ignoring the fractional digits.`
      );
      value = Math.trunc(value);
    }

    this._aggregator.update(value);
  }

  getLabelSet(): types.LabelSet {
    return this._labelSet;
  }

  getAggregator(): Aggregator {
    return this._aggregator;
  }
}

/**
 * BoundCounter allows the SDK to observe/record a single metric event. The
 * value of single instrument in the `Counter` associated with specified LabelSet.
 */
export class BoundCounter extends BaseBoundInstrument
  implements types.BoundCounter {
  constructor(
    labelSet: types.LabelSet,
    disabled: boolean,
    monotonic: boolean,
    valueType: types.ValueType,
    logger: types.Logger,
    aggregator: Aggregator
  ) {
    super(labelSet, logger, monotonic, disabled, valueType, aggregator);
  }

  add(value: number): void {
    if (this._monotonic && value < 0) {
      this._logger.error(
        `Monotonic counter cannot descend for ${Object.values(
          this._labelSet.labels
        )}`
      );
      return;
    }

    this.update(value);
  }
}

/**
 * BoundMeasure is an implementation of the {@link BoundMeasure} interface.
 */
export class BoundMeasure extends BaseBoundInstrument
  implements types.BoundMeasure {
  private readonly _absolute: boolean;

  constructor(
    labelSet: types.LabelSet,
    disabled: boolean,
    monotonic: boolean,
    absolute: boolean,
    valueType: types.ValueType,
    logger: types.Logger,
    aggregator: Aggregator
  ) {
    super(labelSet, logger, monotonic, disabled, valueType, aggregator);
    this._absolute = absolute;
  }

  record(
    value: number,
    distContext?: types.DistributedContext,
    spanContext?: types.SpanContext
  ): void {
    if (this._absolute && value < 0) {
      this._logger.error(
        `Absolute measure cannot contain negative values for ${Object.values(
          this._labelSet.labels
        )}}`
      );
      return;
    }

    this.update(value);
  }
}

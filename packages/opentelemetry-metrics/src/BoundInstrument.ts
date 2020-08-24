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

import * as api from '@opentelemetry/api';
import { Aggregator } from './export/types';

/**
 * This class represent the base to BoundInstrument, which is responsible for generating
 * the TimeSeries.
 */
export class BaseBoundInstrument {
  protected _labels: api.Labels;
  protected _logger: api.Logger;

  constructor(
    labels: api.Labels,
    logger: api.Logger,
    private readonly _disabled: boolean,
    private readonly _valueType: api.ValueType,
    private readonly _aggregator: Aggregator
  ) {
    this._labels = labels;
    this._logger = logger;
  }

  update(value: number): void {
    if (this._disabled) return;
    if (typeof value !== 'number') {
      this._logger.error(
        `Metric cannot accept a non-number value for ${Object.values(
          this._labels
        )}.`
      );
      return;
    }

    if (this._valueType === api.ValueType.INT && !Number.isInteger(value)) {
      this._logger.warn(
        `INT value type cannot accept a floating-point value for ${Object.values(
          this._labels
        )}, ignoring the fractional digits.`
      );
      value = Math.trunc(value);
    }

    this._aggregator.update(value);
  }

  getLabels(): api.Labels {
    return this._labels;
  }

  getAggregator(): Aggregator {
    return this._aggregator;
  }
}

/**
 * BoundCounter allows the SDK to observe/record a single metric event. The
 * value of single instrument in the `Counter` associated with specified Labels.
 */
export class BoundCounter
  extends BaseBoundInstrument
  implements api.BoundCounter {
  constructor(
    labels: api.Labels,
    disabled: boolean,
    valueType: api.ValueType,
    logger: api.Logger,
    aggregator: Aggregator
  ) {
    super(labels, logger, disabled, valueType, aggregator);
  }

  add(value: number): void {
    if (value < 0) {
      this._logger.error(
        `Counter cannot descend for ${Object.values(this._labels)}`
      );
      return;
    }

    this.update(value);
  }
}

/**
 * BoundUpDownCounter allows the SDK to observe/record a single metric event.
 * The value of single instrument in the `UpDownCounter` associated with
 * specified Labels.
 */
export class BoundUpDownCounter
  extends BaseBoundInstrument
  implements api.BoundCounter {
  constructor(
    labels: api.Labels,
    disabled: boolean,
    valueType: api.ValueType,
    logger: api.Logger,
    aggregator: Aggregator
  ) {
    super(labels, logger, disabled, valueType, aggregator);
  }

  add(value: number): void {
    this.update(value);
  }
}

/**
 * BoundMeasure is an implementation of the {@link BoundMeasure} interface.
 */
export class BoundValueRecorder
  extends BaseBoundInstrument
  implements api.BoundValueRecorder {
  private readonly _absolute: boolean;

  constructor(
    labels: api.Labels,
    disabled: boolean,
    absolute: boolean,
    valueType: api.ValueType,
    logger: api.Logger,
    aggregator: Aggregator
  ) {
    super(labels, logger, disabled, valueType, aggregator);
    this._absolute = absolute;
  }

  record(
    value: number,
    correlationContext?: api.CorrelationContext,
    spanContext?: api.SpanContext
  ): void {
    if (this._absolute && value < 0) {
      this._logger.error(
        `Absolute ValueRecorder cannot contain negative values for $${Object.values(
          this._labels
        )}`
      );
      return;
    }

    this.update(value);
  }
}

/**
 * BoundObserver is an implementation of the {@link BoundObserver} interface.
 */
export class BoundObserver extends BaseBoundInstrument {
  constructor(
    labels: api.Labels,
    disabled: boolean,
    valueType: api.ValueType,
    logger: api.Logger,
    aggregator: Aggregator
  ) {
    super(labels, logger, disabled, valueType, aggregator);
  }
}

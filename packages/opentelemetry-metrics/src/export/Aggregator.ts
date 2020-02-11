/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { Distribution, Sum, LastValue, Aggregator } from './types';
import { hrTime } from '@opentelemetry/core';
import * as types from '@opentelemetry/api';

/** Basic aggregator which calculates a Sum from individual measurements. */
export class CounterSumAggregator implements Aggregator {
  private _current: number = 0;

  update(value: number): void {
    this._current += value;
  }

  value(): Sum {
    return this._current;
  }
}

/** Basic aggregator which keeps the last recorded value and timestamp. */
export class GaugeAggregator implements Aggregator {
  private _current: number = 0;
  private _timestamp: types.HrTime = hrTime();

  update(value: number): void {
    this._current = value;
    this._timestamp = hrTime();
  }

  value(): LastValue {
    return {
      value: this._current,
      timestamp: this._timestamp,
    };
  }
}

/** Basic aggregator keeping all raw values (events, sum, max and min). */
export class MeasureExactAggregator implements Aggregator {
  private _distribution: Distribution;

  constructor() {
    this._distribution = {
      min: Infinity,
      max: -Infinity,
      sum: 0,
      count: 0,
    };
  }

  update(value: number): void {
    this._distribution.count++;
    this._distribution.sum += value;
    this._distribution.min = Math.min(this._distribution.min, value);
    this._distribution.max = Math.max(this._distribution.max, value);
  }

  value(): Distribution {
    return this._distribution;
  }
}

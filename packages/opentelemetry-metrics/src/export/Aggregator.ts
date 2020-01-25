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

import { DistributionData } from './types';
import { hrTime } from '@opentelemetry/core';
import * as types from '@opentelemetry/types';

/**
 * Base interface for aggregators. Aggregators are responsible for holding
 * aggregated values and taking a snapshot of these values upon export.
 */
export interface Aggregator {
  /** Updates the current with the new value. */
  update(value: number): void;
}

/** Basic aggregator which calculates a Sum from individual measurements. */
export class CounterSumAggregator implements Aggregator {
  current: number = 0;

  update(value: number): void {
    this.current += value;
  }
}

/** Basic aggregator which keeps the last recorded value and timestamp. */
export class GaugeAggregator implements Aggregator {
  current: number = 0;
  timestamp: types.HrTime = hrTime();

  update(value: number): void {
    this.current = value;
    this.timestamp = hrTime();
  }
}

/** Basic aggregator keeping all raw values (events, sum, max and min). */
export class MeasureExactAggregator implements Aggregator {
  distributionData: DistributionData;

  constructor() {
    this.distributionData = {
      min: Infinity,
      max: -Infinity,
      sum: 0,
      count: 0,
    };
  }

  update(value: number): void {
    this.distributionData.count++;
    this.distributionData.sum += value;
    this.distributionData.min = Math.min(this.distributionData.min, value);
    this.distributionData.max = Math.max(this.distributionData.max, value);
  }
}

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


import { Context, HrTime } from '@opentelemetry/api';
import { ValueType, Attributes } from '@opentelemetry/api-metrics';
import { FixedSizeExemplarReservoirBase } from './ExemplarReservoir';

/* eslint-disable @typescript-eslint/no-unused-vars */


/**
 * AlignedHistogramBucketExemplarReservoir takes the same boundaries
 * configuration of a Histogram. This alogorithm keeps the last seen measurement
 * that falls within a histogram bucket.
 * https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/sdk.md#exemplar-defaults
 */
export class AlignedHistogramBucketExemplarReservoir extends FixedSizeExemplarReservoirBase {
  private _boundaries: number[];
  constructor(boundaries: number[]) {
    super(boundaries.length+1);
    this._boundaries = boundaries;
  }

  findBucket(value: ValueType, timestamp: HrTime, attributes: Attributes, ctx: Context) {
    for(let i = 0; i < this._boundaries.length; i++) {
      if (value <= this._boundaries[i]) {
        return i;
      }
    }
    return this._boundaries.length;
  }
}

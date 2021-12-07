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
import { ValueType, Attributes } from '@opentelemetry/api-metrics-wip';
import { FixedSizeExemplarReservoirBase } from './ExemplarReservoir';

/**
 * Fixed size reservoir that uses equivalent of naive reservoir sampling
 * algorithm to accept measurements.
 * 
 */
export class SimpleFixedSizeExemplarReservoir extends FixedSizeExemplarReservoirBase {
  private num_measurements_seen: number;
  constructor(size: number) {
    super(size);
    this.num_measurements_seen = 0;
  }

  private getRandomInt(min: number, max: number) { //[min, max)
    return Math.floor(Math.random() * (max - min) + min); 
  }

  private findBucketIndex(_value: ValueType, _timestamp: HrTime, _attributes: Attributes, _ctx: Context) {
    const index = this.getRandomInt(0, ++this.num_measurements_seen);
    return index < this._size ? index: -1;
  }

  offer(value: ValueType, timestamp: HrTime, attributes: Attributes, ctx: Context): void {
    const index = this.findBucketIndex(value, timestamp, attributes, ctx);
    if (index !== -1) {
      this._reservoirStorage[index].offer(value, timestamp, attributes, ctx)
    }
  }

  override reset() {
    this.num_measurements_seen = 0;
  }
}

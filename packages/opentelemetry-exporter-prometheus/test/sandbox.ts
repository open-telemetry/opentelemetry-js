/*
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
import { Point, CounterSumAggregator } from '@opentelemetry/metrics';
import { HrTime } from '@opentelemetry/api';

export const mockedHrTime: HrTime = [1586347902211, 0];
export const mockedTimeMS = 1586347902211000;

let toPoint: () => Point;
before(() => {
  toPoint = CounterSumAggregator.prototype.toPoint;
  CounterSumAggregator.prototype.toPoint = function (): Point {
    const point = toPoint.apply(this);
    point.timestamp = mockedHrTime;
    return point;
  };
});
after(() => {
  CounterSumAggregator.prototype.toPoint = toPoint;
});

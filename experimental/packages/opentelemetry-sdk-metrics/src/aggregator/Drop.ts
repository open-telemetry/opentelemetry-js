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

import { HrTime } from '@opentelemetry/api';
import { AggregationTemporality } from '../export/AggregationTemporality';
import { MetricData } from '../export/MetricData';
import { InstrumentDescriptor } from '../InstrumentDescriptor';
import { Maybe } from '../utils';
import {
  AggregatorKind,
  Aggregator,
  AccumulationRecord,
} from './types';

/** Basic aggregator for None which keeps no recorded value. */
export class DropAggregator implements Aggregator<undefined> {
  kind: AggregatorKind.DROP = AggregatorKind.DROP;

  createAccumulation() {
    return undefined;
  }

  merge(_previous: undefined, _delta: undefined) {
    return undefined;
  }

  diff(_previous: undefined, _current: undefined) {
    return undefined;
  }

  toMetricData(
    _descriptor: InstrumentDescriptor,
    _aggregationTemporality: AggregationTemporality,
    _accumulationByAttributes: AccumulationRecord<undefined>[],
    _endTime: HrTime): Maybe<MetricData> {
    return undefined;
  }
}

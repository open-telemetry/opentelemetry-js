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
import * as assert from 'assert';
import { AggregationTemporality } from '../../src';
import { DropAggregator } from '../../src/aggregator';
import { defaultInstrumentDescriptor } from '../util';

describe('DropAggregator', () => {
  describe('createAccumulation', () => {
    it('no exceptions', () => {
      const aggregator = new DropAggregator();
      const accumulation = aggregator.createAccumulation();
      assert.strictEqual(accumulation, undefined);
    });
  });

  describe('merge', () => {
    it('no exceptions', () => {
      const aggregator = new DropAggregator();
      const prev = aggregator.createAccumulation();
      const delta = aggregator.createAccumulation();
      assert.strictEqual(aggregator.merge(prev, delta), undefined);
    });
  });

  describe('diff', () => {
    it('no exceptions', () => {
      const aggregator = new DropAggregator();
      const prev = aggregator.createAccumulation();
      const curr = aggregator.createAccumulation();
      assert.strictEqual(aggregator.diff(prev, curr), undefined);
    });
  });

  describe('toMetricData', () => {
    it('no exceptions', () => {
      const aggregator = new DropAggregator();

      const endTime: HrTime = [1, 1];

      assert.strictEqual(aggregator.toMetricData(
        defaultInstrumentDescriptor,
        AggregationTemporality.CUMULATIVE,
        [[{}, undefined]],
        endTime,
      ), undefined);
    });
  });
});

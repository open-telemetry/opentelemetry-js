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
import * as assert from 'assert';
import { DropAggregator, SumAggregator } from '../../src/aggregator';
import { DeltaMetricProcessor } from '../../src/state/DeltaMetricProcessor';
import { commonAttributes, commonValues } from '../util';

describe('DeltaMetricProcessor', () => {
  describe('record', () => {
    it('no exceptions on record with DropAggregator', () => {
      const metricStorage = new DeltaMetricProcessor(new DropAggregator());

      for (const value of commonValues) {
        for (const attributes of commonAttributes) {
          metricStorage.record(value, attributes, api.context.active());
        }
      }
    });

    it('no exceptions on record with no-drop aggregator', () => {
      const metricStorage = new DeltaMetricProcessor(new SumAggregator());

      for (const value of commonValues) {
        for (const attributes of commonAttributes) {
          metricStorage.record(value, attributes, api.context.active());
        }
      }
    });
  });

  describe('collect', () => {
    it('should export', () => {
      const metricStorage = new DeltaMetricProcessor(new SumAggregator());

      metricStorage.record(1, { attribute: '1' }, api.ROOT_CONTEXT);
      metricStorage.record(2, { attribute: '1' }, api.ROOT_CONTEXT);
      metricStorage.record(1, { attribute: '2' }, api.ROOT_CONTEXT);

      let accumulations = metricStorage.collect();
      assert.strictEqual(accumulations.size, 2);
      {
        const accumulation = accumulations.get({ attribute: '1' });
        assert.strictEqual(accumulation?.toPoint(), 3);
      }
      {
        const accumulation = accumulations.get({ attribute: '2' });
        assert.strictEqual(accumulation?.toPoint(), 1);
      }

      /** the accumulations shall be reset. */
      accumulations = metricStorage.collect();
      assert.strictEqual(accumulations.size, 0);
    });
  });
});

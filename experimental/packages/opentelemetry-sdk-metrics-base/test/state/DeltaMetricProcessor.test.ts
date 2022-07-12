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
import { AttributeHashMap } from '../../src/state/HashMap';
import { commonAttributes, commonValues } from '../util';

describe('DeltaMetricProcessor', () => {
  describe('record', () => {
    it('no exceptions on record with DropAggregator', () => {
      const metricProcessor = new DeltaMetricProcessor(new DropAggregator());

      for (const value of commonValues) {
        for (const attributes of commonAttributes) {
          metricProcessor.record(value, attributes, api.context.active(), [0, 0]);
        }
      }
    });

    it('no exceptions on record with no-drop aggregator', () => {
      const metricProcessor = new DeltaMetricProcessor(new SumAggregator(true));

      for (const value of commonValues) {
        for (const attributes of commonAttributes) {
          metricProcessor.record(value, attributes, api.context.active(), [0, 0]);
        }
      }
    });
  });

  describe('batchCumulate', () => {
    it('no exceptions on batchCumulate with DropAggregator', () => {
      const metricProcessor = new DeltaMetricProcessor(new DropAggregator());

      const measurements = new AttributeHashMap<number>();
      for (const value of commonValues) {
        for (const attributes of commonAttributes) {
          measurements.set(attributes, value);
        }
      }
      metricProcessor.batchCumulate(measurements, [0, 0]);
    });

    it('no exceptions on record with no-drop aggregator', () => {
      const metricProcessor = new DeltaMetricProcessor(new SumAggregator(true));

      const measurements = new AttributeHashMap<number>();
      for (const value of commonValues) {
        for (const attributes of commonAttributes) {
          measurements.set(attributes, value);
        }
      }
      metricProcessor.batchCumulate(measurements, [0, 0]);
    });

    it('should compute the diff of accumulations', () => {
      const metricProcessor = new DeltaMetricProcessor(new SumAggregator(true));

      {
        const measurements = new AttributeHashMap<number>();
        measurements.set({}, 10);
        metricProcessor.batchCumulate(measurements, [0, 0]);
        const accumulations = metricProcessor.collect();
        const accumulation = accumulations.get({});
        assert.strictEqual(accumulation?.toPointValue(), 10);
      }

      {
        const measurements = new AttributeHashMap<number>();
        measurements.set({}, 21);
        metricProcessor.batchCumulate(measurements, [0, 0]);
        const accumulations = metricProcessor.collect();
        const accumulation = accumulations.get({});
        assert.strictEqual(accumulation?.toPointValue(), 11);
      }
    });
  });

  describe('collect', () => {
    it('should export', () => {
      const metricProcessor = new DeltaMetricProcessor(new SumAggregator(true));

      metricProcessor.record(1, { attribute: '1' }, api.ROOT_CONTEXT, [0, 0]);
      metricProcessor.record(2, { attribute: '1' }, api.ROOT_CONTEXT, [1, 1]);
      metricProcessor.record(1, { attribute: '2' }, api.ROOT_CONTEXT, [2, 2]);

      let accumulations = metricProcessor.collect();
      assert.strictEqual(accumulations.size, 2);
      {
        const accumulation = accumulations.get({ attribute: '1' });
        assert.strictEqual(accumulation?.toPointValue(), 3);
      }
      {
        const accumulation = accumulations.get({ attribute: '2' });
        assert.strictEqual(accumulation?.toPointValue(), 1);
      }

      /** the accumulations shall be reset. */
      accumulations = metricProcessor.collect();
      assert.strictEqual(accumulations.size, 0);
    });
  });
});

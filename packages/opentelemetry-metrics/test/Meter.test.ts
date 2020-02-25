/*!
 * Copyright 2019, OpenTelemetry Authors
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

import * as assert from 'assert';
import {
  Meter,
  Metric,
  CounterMetric,
  MetricKind,
  Sum,
  MeterProvider,
  MeasureMetric,
  Distribution,
} from '../src';
import * as types from '@opentelemetry/api';
import { LabelSet } from '../src/LabelSet';
import { NoopLogger } from '@opentelemetry/core';
import { CounterSumAggregator } from '../src/export/Aggregator';
import { ValueType } from '@opentelemetry/api';

describe('Meter', () => {
  let meter: Meter;
  const keya = 'keya';
  const keyb = 'keyb';
  let labels: types.Labels = { [keyb]: 'value2', [keya]: 'value1' };
  let labelSet: types.LabelSet;

  beforeEach(() => {
    meter = new MeterProvider({
      logger: new NoopLogger(),
    }).getMeter('test-meter');
    labelSet = meter.labels(labels);
  });

  describe('#meter', () => {
    it('should re-order labels to a canonicalized set', () => {
      const orderedLabels: types.Labels = {
        [keya]: 'value1',
        [keyb]: 'value2',
      };
      const identifier = '|#keya:value1,keyb:value2';
      assert.deepEqual(labelSet, new LabelSet(identifier, orderedLabels));
    });
  });

  describe('#counter', () => {
    it('should create a counter', () => {
      const counter = meter.createCounter('name');
      assert.ok(counter instanceof Metric);
    });

    it('should create a counter with options', () => {
      const counter = meter.createCounter('name', {
        description: 'desc',
        unit: '1',
        disabled: false,
        monotonic: false,
      });
      assert.ok(counter instanceof Metric);
    });

    it('should be able to call add() directly on counter', () => {
      const counter = meter.createCounter('name') as CounterMetric;
      counter.add(10, labelSet);
      meter.collect();
      const [record1] = meter.getBatcher().checkPointSet();

      assert.strictEqual(record1.aggregator.value(), 10);
      counter.add(10, labelSet);
      assert.strictEqual(record1.aggregator.value(), 20);
    });

    describe('.bind()', () => {
      it('should create a counter instrument', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const boundCounter = counter.bind(labelSet);
        boundCounter.add(10);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();

        assert.strictEqual(record1.aggregator.value(), 10);
        boundCounter.add(10);
        assert.strictEqual(record1.aggregator.value(), 20);
      });

      it('should return the aggregator', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const boundCounter = counter.bind(labelSet);
        boundCounter.add(20);
        assert.ok(boundCounter.getAggregator() instanceof CounterSumAggregator);
        assert.strictEqual(boundCounter.getLabelSet(), labelSet);
      });

      it('should add positive values by default', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const boundCounter = counter.bind(labelSet);
        boundCounter.add(10);
        assert.strictEqual(meter.getBatcher().checkPointSet().length, 0);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();

        assert.strictEqual(record1.aggregator.value(), 10);
        boundCounter.add(-100);
        assert.strictEqual(record1.aggregator.value(), 10);
      });

      it('should not add the instrument data when disabled', () => {
        const counter = meter.createCounter('name', {
          disabled: true,
        }) as CounterMetric;
        const boundCounter = counter.bind(labelSet);
        boundCounter.add(10);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();
        assert.strictEqual(record1.aggregator.value(), 0);
      });

      it('should add negative value when monotonic is set to false', () => {
        const counter = meter.createCounter('name', {
          monotonic: false,
        }) as CounterMetric;
        const boundCounter = counter.bind(labelSet);
        boundCounter.add(-10);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();
        assert.strictEqual(record1.aggregator.value(), -10);
      });

      it('should return same instrument on same label values', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const boundCounter = counter.bind(labelSet);
        boundCounter.add(10);
        const boundCounter1 = counter.bind(labelSet);
        boundCounter1.add(10);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();

        assert.strictEqual(record1.aggregator.value(), 20);
        assert.strictEqual(boundCounter, boundCounter1);
      });
    });

    describe('.unbind()', () => {
      it('should remove a counter instrument', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const boundCounter = counter.bind(labelSet);
        assert.strictEqual(counter['_instruments'].size, 1);
        counter.unbind(labelSet);
        assert.strictEqual(counter['_instruments'].size, 0);
        const boundCounter1 = counter.bind(labelSet);
        assert.strictEqual(counter['_instruments'].size, 1);
        assert.notStrictEqual(boundCounter, boundCounter1);
      });

      it('should not fail when removing non existing instrument', () => {
        const counter = meter.createCounter('name');
        counter.unbind(new LabelSet('', {}));
      });

      it('should clear all instruments', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        counter.bind(labelSet);
        assert.strictEqual(counter['_instruments'].size, 1);
        counter.clear();
        assert.strictEqual(counter['_instruments'].size, 0);
      });
    });

    describe('.registerMetric()', () => {
      it('skip already registered Metric', () => {
        const counter1 = meter.createCounter('name1') as CounterMetric;
        counter1.bind(labelSet).add(10);

        // should skip below metric
        const counter2 = meter.createCounter('name1', {
          valueType: types.ValueType.INT,
        }) as CounterMetric;
        counter2.bind(labelSet).add(500);

        meter.collect();
        const record = meter.getBatcher().checkPointSet();

        assert.strictEqual(record.length, 1);
        assert.deepStrictEqual(record[0].descriptor, {
          description: '',
          labelKeys: [],
          metricKind: MetricKind.COUNTER,
          monotonic: true,
          name: 'name1',
          unit: '1',
          valueType: ValueType.DOUBLE,
        });
        assert.strictEqual(record[0].aggregator.value(), 10);
      });
    });

    describe('names', () => {
      it('should create counter with valid names', () => {
        const counter1 = meter.createCounter('name1');
        const counter2 = meter.createCounter(
          'Name_with-all.valid_CharacterClasses'
        );
        assert.ok(counter1 instanceof CounterMetric);
        assert.ok(counter2 instanceof CounterMetric);
      });

      it('should return no op metric if name is an empty string', () => {
        const counter = meter.createCounter('');
        assert.ok(counter instanceof types.NoopMetric);
      });

      it('should return no op metric if name does not start with a letter', () => {
        const counter1 = meter.createCounter('1name');
        const counter_ = meter.createCounter('_name');
        assert.ok(counter1 instanceof types.NoopMetric);
        assert.ok(counter_ instanceof types.NoopMetric);
      });

      it('should return no op metric if name is an empty string contain only letters, numbers, ".", "_", and "-"', () => {
        const counter = meter.createCounter('name with invalid characters^&*(');
        assert.ok(counter instanceof types.NoopMetric);
      });
    });
  });

  describe('#measure', () => {
    it('should create a measure', () => {
      const measure = meter.createMeasure('name');
      assert.ok(measure instanceof Metric);
    });

    it('should create a measure with options', () => {
      const measure = meter.createMeasure('name', {
        description: 'desc',
        unit: '1',
        disabled: false,
      });
      assert.ok(measure instanceof Metric);
    });

    it('should be absolute by default', () => {
      const measure = meter.createMeasure('name', {
        description: 'desc',
        unit: '1',
        disabled: false,
      });
      assert.strictEqual((measure as MeasureMetric)['_absolute'], true);
    });

    it('should be able to set absolute to false', () => {
      const measure = meter.createMeasure('name', {
        description: 'desc',
        unit: '1',
        disabled: false,
        absolute: false,
      });
      assert.strictEqual((measure as MeasureMetric)['_absolute'], false);
    });

    describe('names', () => {
      it('should return no op metric if name is an empty string', () => {
        const measure = meter.createMeasure('');
        assert.ok(measure instanceof types.NoopMetric);
      });

      it('should return no op metric if name does not start with a letter', () => {
        const measure1 = meter.createMeasure('1name');
        const measure_ = meter.createMeasure('_name');
        assert.ok(measure1 instanceof types.NoopMetric);
        assert.ok(measure_ instanceof types.NoopMetric);
      });

      it('should return no op metric if name is an empty string contain only letters, numbers, ".", "_", and "-"', () => {
        const measure = meter.createMeasure('name with invalid characters^&*(');
        assert.ok(measure instanceof types.NoopMetric);
      });
    });

    describe('.bind()', () => {
      it('should create a measure instrument', () => {
        const measure = meter.createMeasure('name') as MeasureMetric;
        const boundMeasure = measure.bind(labelSet);
        assert.doesNotThrow(() => boundMeasure.record(10));
      });

      it('should not accept negative values by default', () => {
        const measure = meter.createMeasure('name');
        const boundMeasure = measure.bind(labelSet);
        boundMeasure.record(-10);

        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();
        assert.deepStrictEqual(record1.aggregator.value() as Distribution, {
          count: 0,
          max: -Infinity,
          min: Infinity,
          sum: 0,
        });
      });

      it('should not set the instrument data when disabled', () => {
        const measure = meter.createMeasure('name', {
          disabled: true,
        }) as MeasureMetric;
        const boundMeasure = measure.bind(labelSet);
        boundMeasure.record(10);

        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();
        assert.deepStrictEqual(record1.aggregator.value() as Distribution, {
          count: 0,
          max: -Infinity,
          min: Infinity,
          sum: 0,
        });
      });

      it('should accept negative (and positive) values when absolute is set to false', () => {
        const measure = meter.createMeasure('name', {
          absolute: false,
        });
        const boundMeasure = measure.bind(labelSet);
        boundMeasure.record(-10);
        boundMeasure.record(50);

        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();
        assert.deepStrictEqual(record1.aggregator.value() as Distribution, {
          count: 2,
          max: 50,
          min: -10,
          sum: 40,
        });
      });

      it('should return same instrument on same label values', () => {
        const measure = meter.createMeasure('name') as MeasureMetric;
        const boundMeasure1 = measure.bind(labelSet);
        boundMeasure1.record(10);
        const boundMeasure2 = measure.bind(labelSet);
        boundMeasure2.record(100);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();
        assert.deepStrictEqual(record1.aggregator.value() as Distribution, {
          count: 2,
          max: 100,
          min: 10,
          sum: 110,
        });
        assert.strictEqual(boundMeasure1, boundMeasure2);
      });
    });

    describe('.unbind()', () => {
      it('should remove the measure instrument', () => {
        const measure = meter.createMeasure('name') as MeasureMetric;
        const boundMeasure = measure.bind(labelSet);
        assert.strictEqual(measure['_instruments'].size, 1);
        measure.unbind(labelSet);
        assert.strictEqual(measure['_instruments'].size, 0);
        const boundMeasure2 = measure.bind(labelSet);
        assert.strictEqual(measure['_instruments'].size, 1);
        assert.notStrictEqual(boundMeasure, boundMeasure2);
      });

      it('should not fail when removing non existing instrument', () => {
        const measure = meter.createMeasure('name');
        measure.unbind(new LabelSet('nonexistant', {}));
      });

      it('should clear all instruments', () => {
        const measure = meter.createMeasure('name') as MeasureMetric;
        measure.bind(labelSet);
        assert.strictEqual(measure['_instruments'].size, 1);
        measure.clear();
        assert.strictEqual(measure['_instruments'].size, 0);
      });
    });
  });

  describe('#getMetrics', () => {
    it('should create a DOUBLE counter', () => {
      const key = 'key';
      const counter = meter.createCounter('counter', {
        description: 'test',
        labelKeys: [key],
      });
      const labelSet = meter.labels({ [key]: 'counter-value' });
      const boundCounter = counter.bind(labelSet);
      boundCounter.add(10.45);

      meter.collect();
      const record = meter.getBatcher().checkPointSet();

      assert.strictEqual(record.length, 1);
      assert.deepStrictEqual(record[0].descriptor, {
        name: 'counter',
        description: 'test',
        metricKind: MetricKind.COUNTER,
        monotonic: true,
        unit: '1',
        valueType: ValueType.DOUBLE,
        labelKeys: ['key'],
      });
      assert.strictEqual(record[0].labels, labelSet);
      const value = record[0].aggregator.value() as Sum;
      assert.strictEqual(value, 10.45);
    });

    it('should create a INT counter', () => {
      const key = 'key';
      const counter = meter.createCounter('counter', {
        description: 'test',
        labelKeys: [key],
        valueType: types.ValueType.INT,
      });
      const labelSet = meter.labels({ [key]: 'counter-value' });
      const boundCounter = counter.bind(labelSet);
      boundCounter.add(10.45);

      meter.collect();
      const record = meter.getBatcher().checkPointSet();

      assert.strictEqual(record.length, 1);
      assert.deepStrictEqual(record[0].descriptor, {
        name: 'counter',
        description: 'test',
        metricKind: MetricKind.COUNTER,
        monotonic: true,
        unit: '1',
        valueType: ValueType.INT,
        labelKeys: ['key'],
      });
      assert.strictEqual(record[0].labels, labelSet);
      const value = record[0].aggregator.value() as Sum;
      assert.strictEqual(value, 10);
    });
  });
});

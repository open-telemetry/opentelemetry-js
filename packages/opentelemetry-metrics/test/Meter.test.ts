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
  ObserverMetric,
  MetricRecord,
  Aggregator,
  MetricObservable,
  MetricDescriptor,
} from '../src';
import * as api from '@opentelemetry/api';
import { NoopLogger, hrTime, hrTimeToNanoseconds } from '@opentelemetry/core';
import {
  CounterSumAggregator,
  ObserverAggregator,
} from '../src/export/aggregators';
import { ValueType } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { hashLabels } from '../src/Utils';
import { Batcher } from '../src/export/Batcher';

describe('Meter', () => {
  let meter: Meter;
  const keya = 'keya';
  const keyb = 'keyb';
  const labels: api.Labels = { [keyb]: 'value2', [keya]: 'value1' };

  beforeEach(() => {
    meter = new MeterProvider({
      logger: new NoopLogger(),
    }).getMeter('test-meter');
  });

  describe('#counter', () => {
    const performanceTimeOrigin = hrTime();

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
      counter.add(10, labels);
      meter.collect();
      const [record1] = meter.getBatcher().checkPointSet();

      assert.strictEqual(record1.aggregator.toPoint().value, 10);
      const lastTimestamp = record1.aggregator.toPoint().timestamp;
      assert.ok(
        hrTimeToNanoseconds(lastTimestamp) >
          hrTimeToNanoseconds(performanceTimeOrigin)
      );
      counter.add(10, labels);
      assert.strictEqual(record1.aggregator.toPoint().value, 20);

      assert.ok(
        hrTimeToNanoseconds(record1.aggregator.toPoint().timestamp) >
          hrTimeToNanoseconds(lastTimestamp)
      );
    });

    it('should return counter with resource', () => {
      const counter = meter.createCounter('name') as CounterMetric;
      assert.ok(counter.resource instanceof Resource);
    });

    describe('.bind()', () => {
      it('should create a counter instrument', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const boundCounter = counter.bind(labels);
        boundCounter.add(10);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();

        assert.strictEqual(record1.aggregator.toPoint().value, 10);
        boundCounter.add(10);
        assert.strictEqual(record1.aggregator.toPoint().value, 20);
      });

      it('should return the aggregator', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const boundCounter = counter.bind(labels);
        boundCounter.add(20);
        assert.ok(boundCounter.getAggregator() instanceof CounterSumAggregator);
        assert.strictEqual(boundCounter.getLabels(), labels);
      });

      it('should add positive values by default', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const boundCounter = counter.bind(labels);
        boundCounter.add(10);
        assert.strictEqual(meter.getBatcher().checkPointSet().length, 0);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();

        assert.strictEqual(record1.aggregator.toPoint().value, 10);
        boundCounter.add(-100);
        assert.strictEqual(record1.aggregator.toPoint().value, 10);
      });

      it('should not add the instrument data when disabled', () => {
        const counter = meter.createCounter('name', {
          disabled: true,
        }) as CounterMetric;
        const boundCounter = counter.bind(labels);
        boundCounter.add(10);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();
        assert.strictEqual(record1.aggregator.toPoint().value, 0);
      });

      it('should add negative value when monotonic is set to false', () => {
        const counter = meter.createCounter('name', {
          monotonic: false,
        }) as CounterMetric;
        const boundCounter = counter.bind(labels);
        boundCounter.add(-10);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();
        assert.strictEqual(record1.aggregator.toPoint().value, -10);
      });

      it('should return same instrument on same label values', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const boundCounter = counter.bind(labels);
        boundCounter.add(10);
        const boundCounter1 = counter.bind(labels);
        boundCounter1.add(10);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();

        assert.strictEqual(record1.aggregator.toPoint().value, 20);
        assert.strictEqual(boundCounter, boundCounter1);
      });
    });

    describe('.unbind()', () => {
      it('should remove a counter instrument', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const boundCounter = counter.bind(labels);
        assert.strictEqual(counter['_instruments'].size, 1);
        counter.unbind(labels);
        assert.strictEqual(counter['_instruments'].size, 0);
        const boundCounter1 = counter.bind(labels);
        assert.strictEqual(counter['_instruments'].size, 1);
        assert.notStrictEqual(boundCounter, boundCounter1);
      });

      it('should not fail when removing non existing instrument', () => {
        const counter = meter.createCounter('name');
        counter.unbind({});
      });

      it('should clear all instruments', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        counter.bind(labels);
        assert.strictEqual(counter['_instruments'].size, 1);
        counter.clear();
        assert.strictEqual(counter['_instruments'].size, 0);
      });
    });

    describe('.registerMetric()', () => {
      it('skip already registered Metric', () => {
        const counter1 = meter.createCounter('name1') as CounterMetric;
        counter1.bind(labels).add(10);

        // should skip below metric
        const counter2 = meter.createCounter('name1', {
          valueType: api.ValueType.INT,
        }) as CounterMetric;
        counter2.bind(labels).add(500);

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
        assert.strictEqual(record[0].aggregator.toPoint().value, 10);
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
        assert.ok(counter instanceof api.NoopMetric);
      });

      it('should return no op metric if name does not start with a letter', () => {
        const counter1 = meter.createCounter('1name');
        const counter_ = meter.createCounter('_name');
        assert.ok(counter1 instanceof api.NoopMetric);
        assert.ok(counter_ instanceof api.NoopMetric);
      });

      it('should return no op metric if name is an empty string contain only letters, numbers, ".", "_", and "-"', () => {
        const counter = meter.createCounter('name with invalid characters^&*(');
        assert.ok(counter instanceof api.NoopMetric);
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

    it('should return a measure with resource', () => {
      const measure = meter.createMeasure('name') as MeasureMetric;
      assert.ok(measure.resource instanceof Resource);
    });

    describe('names', () => {
      it('should return no op metric if name is an empty string', () => {
        const measure = meter.createMeasure('');
        assert.ok(measure instanceof api.NoopMetric);
      });

      it('should return no op metric if name does not start with a letter', () => {
        const measure1 = meter.createMeasure('1name');
        const measure_ = meter.createMeasure('_name');
        assert.ok(measure1 instanceof api.NoopMetric);
        assert.ok(measure_ instanceof api.NoopMetric);
      });

      it('should return no op metric if name is an empty string contain only letters, numbers, ".", "_", and "-"', () => {
        const measure = meter.createMeasure('name with invalid characters^&*(');
        assert.ok(measure instanceof api.NoopMetric);
      });
    });

    describe('.bind()', () => {
      const performanceTimeOrigin = hrTime();

      it('should create a measure instrument', () => {
        const measure = meter.createMeasure('name') as MeasureMetric;
        const boundMeasure = measure.bind(labels);
        assert.doesNotThrow(() => boundMeasure.record(10));
      });

      it('should not accept negative values by default', () => {
        const measure = meter.createMeasure('name');
        const boundMeasure = measure.bind(labels);
        boundMeasure.record(-10);

        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();
        assert.deepStrictEqual(
          record1.aggregator.toPoint().value as Distribution,
          {
            count: 0,
            max: -Infinity,
            min: Infinity,
            sum: 0,
          }
        );
      });

      it('should not set the instrument data when disabled', () => {
        const measure = meter.createMeasure('name', {
          disabled: true,
        }) as MeasureMetric;
        const boundMeasure = measure.bind(labels);
        boundMeasure.record(10);

        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();
        assert.deepStrictEqual(
          record1.aggregator.toPoint().value as Distribution,
          {
            count: 0,
            max: -Infinity,
            min: Infinity,
            sum: 0,
          }
        );
      });

      it('should accept negative (and positive) values when absolute is set to false', () => {
        const measure = meter.createMeasure('name', {
          absolute: false,
        });
        const boundMeasure = measure.bind(labels);
        boundMeasure.record(-10);
        boundMeasure.record(50);

        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();
        assert.deepStrictEqual(
          record1.aggregator.toPoint().value as Distribution,
          {
            count: 2,
            max: 50,
            min: -10,
            sum: 40,
          }
        );
        assert.ok(
          hrTimeToNanoseconds(record1.aggregator.toPoint().timestamp) >
            hrTimeToNanoseconds(performanceTimeOrigin)
        );
      });

      it('should return same instrument on same label values', () => {
        const measure = meter.createMeasure('name') as MeasureMetric;
        const boundMeasure1 = measure.bind(labels);
        boundMeasure1.record(10);
        const boundMeasure2 = measure.bind(labels);
        boundMeasure2.record(100);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();
        assert.deepStrictEqual(
          record1.aggregator.toPoint().value as Distribution,
          {
            count: 2,
            max: 100,
            min: 10,
            sum: 110,
          }
        );
        assert.strictEqual(boundMeasure1, boundMeasure2);
      });
    });

    describe('.unbind()', () => {
      it('should remove the measure instrument', () => {
        const measure = meter.createMeasure('name') as MeasureMetric;
        const boundMeasure = measure.bind(labels);
        assert.strictEqual(measure['_instruments'].size, 1);
        measure.unbind(labels);
        assert.strictEqual(measure['_instruments'].size, 0);
        const boundMeasure2 = measure.bind(labels);
        assert.strictEqual(measure['_instruments'].size, 1);
        assert.notStrictEqual(boundMeasure, boundMeasure2);
      });

      it('should not fail when removing non existing instrument', () => {
        const measure = meter.createMeasure('name');
        measure.unbind({});
      });

      it('should clear all instruments', () => {
        const measure = meter.createMeasure('name') as MeasureMetric;
        measure.bind(labels);
        assert.strictEqual(measure['_instruments'].size, 1);
        measure.clear();
        assert.strictEqual(measure['_instruments'].size, 0);
      });
    });
  });

  describe('#observer', () => {
    it('should create an observer', () => {
      const measure = meter.createObserver('name') as ObserverMetric;
      assert.ok(measure instanceof Metric);
    });

    it('should create observer with options', () => {
      const measure = meter.createObserver('name', {
        description: 'desc',
        unit: '1',
        disabled: false,
      }) as ObserverMetric;
      assert.ok(measure instanceof Metric);
    });

    it('should set callback and observe value ', () => {
      const measure = meter.createObserver('name', {
        description: 'desc',
        labelKeys: ['pid', 'core'],
      }) as ObserverMetric;

      function getCpuUsage() {
        return Math.random();
      }

      const metricObservable = new MetricObservable();

      measure.setCallback((observerResult: api.ObserverResult) => {
        observerResult.observe(getCpuUsage, { pid: '123', core: '1' });
        observerResult.observe(getCpuUsage, { pid: '123', core: '2' });
        observerResult.observe(getCpuUsage, { pid: '123', core: '3' });
        observerResult.observe(getCpuUsage, { pid: '123', core: '4' });
        observerResult.observe(metricObservable, { pid: '123', core: '5' });
      });

      metricObservable.next(0.123);

      const metricRecords: MetricRecord[] = measure.getMetricRecord();
      assert.strictEqual(metricRecords.length, 5);

      const metric5 = metricRecords[0];
      assert.strictEqual(hashLabels(metric5.labels), '|#core:5,pid:123');

      const metric1 = metricRecords[1];
      const metric2 = metricRecords[2];
      const metric3 = metricRecords[3];
      const metric4 = metricRecords[4];
      assert.strictEqual(hashLabels(metric1.labels), '|#core:1,pid:123');
      assert.strictEqual(hashLabels(metric2.labels), '|#core:2,pid:123');
      assert.strictEqual(hashLabels(metric3.labels), '|#core:3,pid:123');
      assert.strictEqual(hashLabels(metric4.labels), '|#core:4,pid:123');

      ensureMetric(metric1);
      ensureMetric(metric2);
      ensureMetric(metric3);
      ensureMetric(metric4);
      ensureMetric(metric5);
    });

    it('should return an observer with resource', () => {
      const observer = meter.createObserver('name') as ObserverMetric;
      assert.ok(observer.resource instanceof Resource);
    });
  });

  describe('#getMetrics', () => {
    it('should create a DOUBLE counter', () => {
      const key = 'key';
      const counter = meter.createCounter('counter', {
        description: 'test',
        labelKeys: [key],
      });
      const labels = { [key]: 'counter-value' };
      const boundCounter = counter.bind(labels);
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
      assert.strictEqual(record[0].labels, labels);
      const value = record[0].aggregator.toPoint().value as Sum;
      assert.strictEqual(value, 10.45);
    });

    it('should create a INT counter', () => {
      const key = 'key';
      const counter = meter.createCounter('counter', {
        description: 'test',
        labelKeys: [key],
        valueType: api.ValueType.INT,
      });
      const labels = { [key]: 'counter-value' };
      const boundCounter = counter.bind(labels);
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
      assert.strictEqual(record[0].labels, labels);
      const value = record[0].aggregator.toPoint().value as Sum;
      assert.strictEqual(value, 10);
    });
  });

  it('should allow custom batcher', () => {
    const customMeter = new MeterProvider().getMeter('custom-batcher', '*', {
      batcher: new CustomBatcher(),
    });
    assert.throws(() => {
      const measure = customMeter.createMeasure('myMeasure');
      measure.bind({}).record(1);
    }, /aggregatorFor method not implemented/);
  });
});

class CustomBatcher extends Batcher {
  process(record: MetricRecord): void {
    throw new Error('process method not implemented.');
  }
  aggregatorFor(metricKind: MetricDescriptor): Aggregator {
    throw new Error('aggregatorFor method not implemented.');
  }
}

function ensureMetric(metric: MetricRecord) {
  assert.ok(metric.aggregator instanceof ObserverAggregator);
  assert.ok(
    metric.aggregator.toPoint().value >= 0 &&
      metric.aggregator.toPoint().value <= 1
  );
  assert.ok(
    metric.aggregator.toPoint().value >= 0 &&
      metric.aggregator.toPoint().value <= 1
  );
  const descriptor = metric.descriptor;
  assert.strictEqual(descriptor.name, 'name');
  assert.strictEqual(descriptor.description, 'desc');
  assert.strictEqual(descriptor.unit, '1');
  assert.strictEqual(descriptor.metricKind, MetricKind.OBSERVER);
  assert.strictEqual(descriptor.valueType, ValueType.DOUBLE);
  assert.strictEqual(descriptor.monotonic, false);
}

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

import * as assert from 'assert';
import {
  Meter,
  Metric,
  CounterMetric,
  MetricKind,
  Sum,
  MeterProvider,
  ValueRecorderMetric,
  Distribution,
  ObserverMetric,
  MetricRecord,
  Aggregator,
  MetricObservable,
  MetricDescriptor,
  UpDownCounterMetric,
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

    it('should be able to call add with no labels', () => {
      const counter = meter.createCounter('name', {
        description: 'desc',
        unit: '1',
        disabled: false,
      });
      counter.add(1);
      meter.collect();
      const [record1] = meter.getBatcher().checkPointSet();
      assert.strictEqual(record1.aggregator.toPoint().value, 1);
    });

    it('should pipe through resource', () => {
      const counter = meter.createCounter('name') as CounterMetric;
      assert.ok(counter.resource instanceof Resource);

      counter.add(1, { foo: 'bar' });

      const [record] = counter.getMetricRecord();
      assert.ok(record.resource instanceof Resource);
    });

    it('should pipe through instrumentation library', () => {
      const counter = meter.createCounter('name') as CounterMetric;
      assert.ok(counter.instrumentationLibrary);

      counter.add(1, { foo: 'bar' });

      const [record] = counter.getMetricRecord();
      const { name, version } = record.instrumentationLibrary;
      assert.strictEqual(name, 'test-meter');
      assert.strictEqual(version, '*');
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

      it('should add positive values only', () => {
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
          metricKind: MetricKind.COUNTER,
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

  describe('#UpDownCounter', () => {
    const performanceTimeOrigin = hrTime();

    it('should create a UpDownCounter', () => {
      const upDownCounter = meter.createUpDownCounter('name');
      assert.ok(upDownCounter instanceof Metric);
    });

    it('should create a UpDownCounter with options', () => {
      const upDownCounter = meter.createUpDownCounter('name', {
        description: 'desc',
        unit: '1',
        disabled: false,
      });
      assert.ok(upDownCounter instanceof Metric);
    });

    it('should be able to call add() directly on UpDownCounter', () => {
      const upDownCounter = meter.createUpDownCounter('name');
      upDownCounter.add(10, labels);
      meter.collect();
      const [record1] = meter.getBatcher().checkPointSet();

      assert.strictEqual(record1.aggregator.toPoint().value, 10);
      const lastTimestamp = record1.aggregator.toPoint().timestamp;
      assert.ok(
        hrTimeToNanoseconds(lastTimestamp) >
          hrTimeToNanoseconds(performanceTimeOrigin)
      );
      upDownCounter.add(10, labels);
      assert.strictEqual(record1.aggregator.toPoint().value, 20);

      assert.ok(
        hrTimeToNanoseconds(record1.aggregator.toPoint().timestamp) >
          hrTimeToNanoseconds(lastTimestamp)
      );
    });

    it('should be able to call add with no labels', () => {
      const upDownCounter = meter.createUpDownCounter('name', {
        description: 'desc',
        unit: '1',
        disabled: false,
      });
      upDownCounter.add(1);
      meter.collect();
      const [record1] = meter.getBatcher().checkPointSet();
      assert.strictEqual(record1.aggregator.toPoint().value, 1);
    });

    it('should pipe through resource', () => {
      const upDownCounter = meter.createUpDownCounter(
        'name'
      ) as UpDownCounterMetric;
      assert.ok(upDownCounter.resource instanceof Resource);

      upDownCounter.add(1, { foo: 'bar' });

      const [record] = upDownCounter.getMetricRecord();
      assert.ok(record.resource instanceof Resource);
    });

    describe('.bind()', () => {
      it('should create a UpDownCounter instrument', () => {
        const upDownCounter = meter.createUpDownCounter('name');
        const boundCounter = upDownCounter.bind(labels);
        boundCounter.add(10);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();

        assert.strictEqual(record1.aggregator.toPoint().value, 10);
        boundCounter.add(-200);
        assert.strictEqual(record1.aggregator.toPoint().value, -190);
      });

      it('should return the aggregator', () => {
        const upDownCounter = meter.createUpDownCounter(
          'name'
        ) as UpDownCounterMetric;
        const boundCounter = upDownCounter.bind(labels);
        boundCounter.add(20);
        assert.ok(boundCounter.getAggregator() instanceof CounterSumAggregator);
        assert.strictEqual(boundCounter.getLabels(), labels);
      });

      it('should not add the instrument data when disabled', () => {
        const upDownCounter = meter.createUpDownCounter('name', {
          disabled: true,
        });
        const boundCounter = upDownCounter.bind(labels);
        boundCounter.add(10);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();
        assert.strictEqual(record1.aggregator.toPoint().value, 0);
      });

      it('should return same instrument on same label values', () => {
        const upDownCounter = meter.createUpDownCounter('name');
        const boundCounter = upDownCounter.bind(labels);
        boundCounter.add(10);
        const boundCounter1 = upDownCounter.bind(labels);
        boundCounter1.add(10);
        meter.collect();
        const [record1] = meter.getBatcher().checkPointSet();

        assert.strictEqual(record1.aggregator.toPoint().value, 20);
        assert.strictEqual(boundCounter, boundCounter1);
      });
    });

    describe('.unbind()', () => {
      it('should remove a UpDownCounter instrument', () => {
        const upDownCounter = meter.createUpDownCounter(
          'name'
        ) as UpDownCounterMetric;
        const boundCounter = upDownCounter.bind(labels);
        assert.strictEqual(upDownCounter['_instruments'].size, 1);
        upDownCounter.unbind(labels);
        assert.strictEqual(upDownCounter['_instruments'].size, 0);
        const boundCounter1 = upDownCounter.bind(labels);
        assert.strictEqual(upDownCounter['_instruments'].size, 1);
        assert.notStrictEqual(boundCounter, boundCounter1);
      });

      it('should not fail when removing non existing instrument', () => {
        const upDownCounter = meter.createUpDownCounter('name');
        upDownCounter.unbind({});
      });

      it('should clear all instruments', () => {
        const upDownCounter = meter.createUpDownCounter(
          'name'
        ) as CounterMetric;
        upDownCounter.bind(labels);
        assert.strictEqual(upDownCounter['_instruments'].size, 1);
        upDownCounter.clear();
        assert.strictEqual(upDownCounter['_instruments'].size, 0);
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
          metricKind: MetricKind.COUNTER,
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

  describe('#ValueRecorder', () => {
    it('should create a valueRecorder', () => {
      const valueRecorder = meter.createValueRecorder('name');
      assert.ok(valueRecorder instanceof Metric);
    });

    it('should create a valueRecorder with options', () => {
      const valueRecorder = meter.createValueRecorder('name', {
        description: 'desc',
        unit: '1',
        disabled: false,
      });
      assert.ok(valueRecorder instanceof Metric);
    });

    it('should be absolute by default', () => {
      const valueRecorder = meter.createValueRecorder('name', {
        description: 'desc',
        unit: '1',
        disabled: false,
      });
      assert.strictEqual(
        (valueRecorder as ValueRecorderMetric)['_absolute'],
        true
      );
    });

    it('should be able to set absolute to false', () => {
      const valueRecorder = meter.createValueRecorder('name', {
        description: 'desc',
        unit: '1',
        disabled: false,
        absolute: false,
      });
      assert.strictEqual(
        (valueRecorder as ValueRecorderMetric)['_absolute'],
        false
      );
    });

    it('should pipe through resource', () => {
      const valueRecorder = meter.createValueRecorder(
        'name'
      ) as ValueRecorderMetric;
      assert.ok(valueRecorder.resource instanceof Resource);

      valueRecorder.record(1, { foo: 'bar' });

      const [record] = valueRecorder.getMetricRecord();
      assert.ok(record.resource instanceof Resource);
    });

    it('should pipe through instrumentation library', () => {
      const valueRecorder = meter.createValueRecorder(
        'name'
      ) as ValueRecorderMetric;
      assert.ok(valueRecorder.instrumentationLibrary);

      valueRecorder.record(1, { foo: 'bar' });

      const [record] = valueRecorder.getMetricRecord();
      const { name, version } = record.instrumentationLibrary;
      assert.strictEqual(name, 'test-meter');
      assert.strictEqual(version, '*');
    });

    describe('names', () => {
      it('should return no op metric if name is an empty string', () => {
        const valueRecorder = meter.createValueRecorder('');
        assert.ok(valueRecorder instanceof api.NoopMetric);
      });

      it('should return no op metric if name does not start with a letter', () => {
        const valueRecorder1 = meter.createValueRecorder('1name');
        const valueRecorder_ = meter.createValueRecorder('_name');
        assert.ok(valueRecorder1 instanceof api.NoopMetric);
        assert.ok(valueRecorder_ instanceof api.NoopMetric);
      });

      it('should return no op metric if name is an empty string contain only letters, numbers, ".", "_", and "-"', () => {
        const valueRecorder = meter.createValueRecorder(
          'name with invalid characters^&*('
        );
        assert.ok(valueRecorder instanceof api.NoopMetric);
      });
    });

    describe('.bind()', () => {
      const performanceTimeOrigin = hrTime();

      it('should create a valueRecorder instrument', () => {
        const valueRecorder = meter.createValueRecorder(
          'name'
        ) as ValueRecorderMetric;
        const boundValueRecorder = valueRecorder.bind(labels);
        assert.doesNotThrow(() => boundValueRecorder.record(10));
      });

      it('should not accept negative values by default', () => {
        const valueRecorder = meter.createValueRecorder('name');
        const boundValueRecorder = valueRecorder.bind(labels);
        boundValueRecorder.record(-10);

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
        const valueRecorder = meter.createValueRecorder('name', {
          disabled: true,
        }) as ValueRecorderMetric;
        const boundValueRecorder = valueRecorder.bind(labels);
        boundValueRecorder.record(10);

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
        const valueRecorder = meter.createValueRecorder('name', {
          absolute: false,
        });
        const boundValueRecorder = valueRecorder.bind(labels);
        boundValueRecorder.record(-10);
        boundValueRecorder.record(50);

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
        const valueRecorder = meter.createValueRecorder(
          'name'
        ) as ValueRecorderMetric;
        const boundValueRecorder1 = valueRecorder.bind(labels);
        boundValueRecorder1.record(10);
        const boundValueRecorder2 = valueRecorder.bind(labels);
        boundValueRecorder2.record(100);
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
        assert.strictEqual(boundValueRecorder1, boundValueRecorder2);
      });
    });

    describe('.unbind()', () => {
      it('should remove the valueRecorder instrument', () => {
        const valueRecorder = meter.createValueRecorder(
          'name'
        ) as ValueRecorderMetric;
        const boundValueRecorder = valueRecorder.bind(labels);
        assert.strictEqual(valueRecorder['_instruments'].size, 1);
        valueRecorder.unbind(labels);
        assert.strictEqual(valueRecorder['_instruments'].size, 0);
        const boundValueRecorder2 = valueRecorder.bind(labels);
        assert.strictEqual(valueRecorder['_instruments'].size, 1);
        assert.notStrictEqual(boundValueRecorder, boundValueRecorder2);
      });

      it('should not fail when removing non existing instrument', () => {
        const valueRecorder = meter.createValueRecorder('name');
        valueRecorder.unbind({});
      });

      it('should clear all instruments', () => {
        const valueRecorder = meter.createValueRecorder(
          'name'
        ) as ValueRecorderMetric;
        valueRecorder.bind(labels);
        assert.strictEqual(valueRecorder['_instruments'].size, 1);
        valueRecorder.clear();
        assert.strictEqual(valueRecorder['_instruments'].size, 0);
      });
    });
  });

  describe('#observer', () => {
    it('should create an observer', () => {
      const valueRecorder = meter.createObserver('name') as ObserverMetric;
      assert.ok(valueRecorder instanceof Metric);
    });

    it('should create observer with options', () => {
      const valueRecorder = meter.createObserver('name', {
        description: 'desc',
        unit: '1',
        disabled: false,
      }) as ObserverMetric;
      assert.ok(valueRecorder instanceof Metric);
    });

    it('should set callback and observe value ', () => {
      const valueRecorder = meter.createObserver('name', {
        description: 'desc',
      }) as ObserverMetric;

      function getCpuUsage() {
        return Math.random();
      }

      const metricObservable = new MetricObservable();

      valueRecorder.setCallback((observerResult: api.ObserverResult) => {
        observerResult.observe(getCpuUsage, { pid: '123', core: '1' });
        observerResult.observe(getCpuUsage, { pid: '123', core: '2' });
        observerResult.observe(getCpuUsage, { pid: '123', core: '3' });
        observerResult.observe(getCpuUsage, { pid: '123', core: '4' });
        observerResult.observe(metricObservable, { pid: '123', core: '5' });
      });

      metricObservable.next(0.123);

      const metricRecords: MetricRecord[] = valueRecorder.getMetricRecord();
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

    it('should pipe through resource', () => {
      const observer = meter.createObserver('name') as ObserverMetric;
      assert.ok(observer.resource instanceof Resource);

      observer.setCallback(result => {
        result.observe(() => 42, { foo: 'bar' });
      });

      const [record] = observer.getMetricRecord();
      assert.ok(record.resource instanceof Resource);
    });

    it('should pipe through instrumentation library', () => {
      const observer = meter.createObserver('name') as ObserverMetric;
      assert.ok(observer.instrumentationLibrary);

      observer.setCallback(result => {
        result.observe(() => 42, { foo: 'bar' });
      });

      const [record] = observer.getMetricRecord();
      const { name, version } = record.instrumentationLibrary;
      assert.strictEqual(name, 'test-meter');
      assert.strictEqual(version, '*');
    });
  });

  describe('#getMetrics', () => {
    it('should create a DOUBLE counter', () => {
      const key = 'key';
      const counter = meter.createCounter('counter', {
        description: 'test',
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
        unit: '1',
        valueType: ValueType.DOUBLE,
      });
      assert.strictEqual(record[0].labels, labels);
      const value = record[0].aggregator.toPoint().value as Sum;
      assert.strictEqual(value, 10.45);
    });

    it('should create a INT counter', () => {
      const key = 'key';
      const counter = meter.createCounter('counter', {
        description: 'test',
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
        unit: '1',
        valueType: ValueType.INT,
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
      const valueRecorder = customMeter.createValueRecorder('myValueRecorder');
      valueRecorder.bind({}).record(1);
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
}

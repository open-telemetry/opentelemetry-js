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
  GaugeMetric,
  MetricDescriptorType,
} from '../src';
import * as types from '@opentelemetry/types';
import { LabelSet } from '../src/LabelSet';
import {
  NoopLogger,
  NoopMetric,
  hrTime,
  hrTimeToMilliseconds,
} from '@opentelemetry/core';
import { NoopExporter } from './mocks/Exporter';

const performanceTimeOrigin = hrTime();

describe('Meter', () => {
  let meter: Meter;
  const keya = 'keya';
  const keyb = 'keyb';
  let labels: types.Labels = { [keyb]: 'value2', [keya]: 'value1' };
  let labelSet: types.LabelSet;
  const hrTime: types.HrTime = [22, 400000000];

  beforeEach(() => {
    meter = new Meter({
      logger: new NoopLogger(),
    });
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

    describe('.getHandle()', () => {
      it('should create a counter handle', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const handle = counter.getHandle(labelSet);
        handle.add(10);
        assert.strictEqual(handle['_data'], 10);
        handle.add(10);
        assert.strictEqual(handle['_data'], 20);
      });

      it('should return the timeseries', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const handle = counter.getHandle(labelSet);
        handle.add(20);
        assert.deepStrictEqual(handle.getTimeSeries(hrTime), {
          labelValues: [{ value: 'value1' }, { value: 'value2' }],
          points: [{ value: 20, timestamp: hrTime }],
        });
      });

      it('should add positive values by default', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const handle = counter.getHandle(labelSet);
        handle.add(10);
        assert.strictEqual(handle['_data'], 10);
        handle.add(-100);
        assert.strictEqual(handle['_data'], 10);
      });

      it('should not add the handle data when disabled', () => {
        const counter = meter.createCounter('name', {
          disabled: true,
        }) as CounterMetric;
        const handle = counter.getHandle(labelSet);
        handle.add(10);
        assert.strictEqual(handle['_data'], 0);
      });

      it('should add negative value when monotonic is set to false', () => {
        const counter = meter.createCounter('name', {
          monotonic: false,
        }) as CounterMetric;
        const handle = counter.getHandle(labelSet);
        handle.add(-10);
        assert.strictEqual(handle['_data'], -10);
      });

      it('should return same handle on same label values', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const handle = counter.getHandle(labelSet);
        handle.add(10);
        const handle1 = counter.getHandle(labelSet);
        handle1.add(10);
        assert.strictEqual(handle['_data'], 20);
        assert.strictEqual(handle, handle1);
      });
    });

    describe('.removeHandle()', () => {
      it('should remove a counter handle', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        const handle = counter.getHandle(labelSet);
        assert.strictEqual(counter['_handles'].size, 1);
        counter.removeHandle(labelSet);
        assert.strictEqual(counter['_handles'].size, 0);
        const handle1 = counter.getHandle(labelSet);
        assert.strictEqual(counter['_handles'].size, 1);
        assert.notStrictEqual(handle, handle1);
      });

      it('should not fail when removing non existing handle', () => {
        const counter = meter.createCounter('name');
        counter.removeHandle(new LabelSet('', {}));
      });

      it('should clear all handles', () => {
        const counter = meter.createCounter('name') as CounterMetric;
        counter.getHandle(labelSet);
        assert.strictEqual(counter['_handles'].size, 1);
        counter.clear();
        assert.strictEqual(counter['_handles'].size, 0);
      });
    });

    describe('.registerMetric()', () => {
      it('skip already registered Metric', () => {
        const counter1 = meter.createCounter('name1') as CounterMetric;
        counter1.getHandle(labelSet).add(10);

        // should skip below metric
        const counter2 = meter.createCounter('name1', {
          valueType: types.ValueType.INT,
        }) as CounterMetric;
        counter2.getHandle(labelSet).add(500);

        assert.strictEqual(meter.getMetrics().length, 1);
        const [{ descriptor, timeseries }] = meter.getMetrics();
        assert.deepStrictEqual(descriptor.name, 'name1');
        assert.deepStrictEqual(
          descriptor.type,
          MetricDescriptorType.COUNTER_DOUBLE
        );
        assert.strictEqual(timeseries.length, 1);
        assert.strictEqual(timeseries[0].points.length, 1);
        assert.strictEqual(timeseries[0].points[0].value, 10);
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
        assert.ok(counter instanceof NoopMetric);
      });

      it('should return no op metric if name does not start with a letter', () => {
        const counter1 = meter.createCounter('1name');
        const counter_ = meter.createCounter('_name');
        assert.ok(counter1 instanceof NoopMetric);
        assert.ok(counter_ instanceof NoopMetric);
      });

      it('should return no op metric if name is an empty string contain only letters, numbers, ".", "_", and "-"', () => {
        const counter = meter.createCounter('name with invalid characters^&*(');
        assert.ok(counter instanceof NoopMetric);
      });
    });
  });

  describe('#gauge', () => {
    it('should create a gauge', () => {
      const gauge = meter.createGauge('name') as GaugeMetric;
      assert.ok(gauge instanceof Metric);
    });

    it('should create a gauge with options', () => {
      const gauge = meter.createGauge('name', {
        description: 'desc',
        unit: '1',
        disabled: false,
        monotonic: false,
      });
      assert.ok(gauge instanceof Metric);
    });

    describe('.getHandle()', () => {
      it('should create a gauge handle', () => {
        const gauge = meter.createGauge('name') as GaugeMetric;
        const handle = gauge.getHandle(labelSet);
        handle.set(10);
        assert.strictEqual(handle['_data'], 10);
        handle.set(250);
        assert.strictEqual(handle['_data'], 250);
      });

      it('should return the timeseries', () => {
        const gauge = meter.createGauge('name') as GaugeMetric;
        const k1 = 'k1';
        const k2 = 'k2';
        const labels = { [k1]: 'v1', [k2]: 'v2' };
        const LabelSet2 = new LabelSet('|#k1:v1,k2:v2', labels);
        const handle = gauge.getHandle(LabelSet2);
        handle.set(150);
        assert.deepStrictEqual(handle.getTimeSeries(hrTime), {
          labelValues: [{ value: 'v1' }, { value: 'v2' }],
          points: [{ value: 150, timestamp: hrTime }],
        });
      });

      it('should go up and down by default', () => {
        const gauge = meter.createGauge('name') as GaugeMetric;
        const handle = gauge.getHandle(labelSet);
        handle.set(10);
        assert.strictEqual(handle['_data'], 10);
        handle.set(-100);
        assert.strictEqual(handle['_data'], -100);
      });

      it('should not set the handle data when disabled', () => {
        const gauge = meter.createGauge('name', {
          disabled: true,
        }) as GaugeMetric;
        const handle = gauge.getHandle(labelSet);
        handle.set(10);
        assert.strictEqual(handle['_data'], 0);
      });

      it('should not set negative value when monotonic is set to true', () => {
        const gauge = meter.createGauge('name', {
          monotonic: true,
        }) as GaugeMetric;
        const handle = gauge.getHandle(labelSet);
        handle.set(-10);
        assert.strictEqual(handle['_data'], 0);
      });

      it('should return same handle on same label values', () => {
        const gauge = meter.createGauge('name') as GaugeMetric;
        const handle = gauge.getHandle(labelSet);
        handle.set(10);
        const handle1 = gauge.getHandle(labelSet);
        handle1.set(10);
        assert.strictEqual(handle['_data'], 10);
        assert.strictEqual(handle, handle1);
      });
    });

    describe('.removeHandle()', () => {
      it('should remove the gauge handle', () => {
        const gauge = meter.createGauge('name') as GaugeMetric;
        const handle = gauge.getHandle(labelSet);
        assert.strictEqual(gauge['_handles'].size, 1);
        gauge.removeHandle(labelSet);
        assert.strictEqual(gauge['_handles'].size, 0);
        const handle1 = gauge.getHandle(labelSet);
        assert.strictEqual(gauge['_handles'].size, 1);
        assert.notStrictEqual(handle, handle1);
      });

      it('should not fail when removing non existing handle', () => {
        const gauge = meter.createGauge('name');
        gauge.removeHandle(new LabelSet('', {}));
      });

      it('should clear all handles', () => {
        const gauge = meter.createGauge('name') as GaugeMetric;
        gauge.getHandle(labelSet);
        assert.strictEqual(gauge['_handles'].size, 1);
        gauge.clear();
        assert.strictEqual(gauge['_handles'].size, 0);
      });
    });

    describe('names', () => {
      it('should create gauges with valid names', () => {
        const gauge1 = meter.createGauge('name1');
        const gauge2 = meter.createGauge(
          'Name_with-all.valid_CharacterClasses'
        );
        assert.ok(gauge1 instanceof GaugeMetric);
        assert.ok(gauge2 instanceof GaugeMetric);
      });

      it('should return no op metric if name is an empty string', () => {
        const gauge = meter.createGauge('');
        assert.ok(gauge instanceof NoopMetric);
      });

      it('should return no op metric if name does not start with a letter', () => {
        const gauge1 = meter.createGauge('1name');
        const gauge_ = meter.createGauge('_name');
        assert.ok(gauge1 instanceof NoopMetric);
        assert.ok(gauge_ instanceof NoopMetric);
      });

      it('should return no op metric if name is an empty string contain only letters, numbers, ".", "_", and "-"', () => {
        const gauge = meter.createGauge('name with invalid characters^&*(');
        assert.ok(gauge instanceof NoopMetric);
      });
    });
  });

  describe('#measure', () => {
    describe('names', () => {
      it('should return no op metric if name is an empty string', () => {
        const gauge = meter.createMeasure('');
        assert.ok(gauge instanceof NoopMetric);
      });

      it('should return no op metric if name does not start with a letter', () => {
        const gauge1 = meter.createMeasure('1name');
        const gauge_ = meter.createMeasure('_name');
        assert.ok(gauge1 instanceof NoopMetric);
        assert.ok(gauge_ instanceof NoopMetric);
      });

      it('should return no op metric if name is an empty string contain only letters, numbers, ".", "_", and "-"', () => {
        const gauge = meter.createMeasure('name with invalid characters^&*(');
        assert.ok(gauge instanceof NoopMetric);
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
      const handle = counter.getHandle(labelSet);
      handle.add(10.45);

      assert.strictEqual(meter.getMetrics().length, 1);
      const [{ descriptor, timeseries }] = meter.getMetrics();
      assert.deepStrictEqual(descriptor, {
        name: 'counter',
        description: 'test',
        unit: '1',
        type: MetricDescriptorType.COUNTER_DOUBLE,
        labelKeys: ['key'],
      });
      assert.strictEqual(timeseries.length, 1);
      const [{ labelValues, points }] = timeseries;
      assert.deepStrictEqual(labelValues, [{ value: 'counter-value' }]);
      assert.strictEqual(points.length, 1);
      assert.strictEqual(points[0].value, 10.45);
      assert.ok(
        hrTimeToMilliseconds(points[0].timestamp) >
          hrTimeToMilliseconds(performanceTimeOrigin)
      );
    });

    it('should create a INT counter', () => {
      const key = 'key';
      const counter = meter.createCounter('counter', {
        description: 'test',
        labelKeys: [key],
        valueType: types.ValueType.INT,
      });
      const labelSet = meter.labels({ [key]: 'counter-value' });
      const handle = counter.getHandle(labelSet);
      handle.add(10.45);

      assert.strictEqual(meter.getMetrics().length, 1);
      const [{ descriptor, timeseries }] = meter.getMetrics();
      assert.deepStrictEqual(descriptor, {
        name: 'counter',
        description: 'test',
        unit: '1',
        type: MetricDescriptorType.COUNTER_INT64,
        labelKeys: ['key'],
      });
      assert.strictEqual(timeseries.length, 1);
      const [{ labelValues, points }] = timeseries;
      assert.deepStrictEqual(labelValues, [{ value: 'counter-value' }]);
      assert.strictEqual(points.length, 1);
      assert.strictEqual(points[0].value, 10);
      assert.ok(
        hrTimeToMilliseconds(points[0].timestamp) >
          hrTimeToMilliseconds(performanceTimeOrigin)
      );
    });

    it('should create a DOUBLE gauge', () => {
      const key = 'gauge-key';
      const gauge = meter.createGauge('gauge', {
        labelKeys: [key],
        unit: 'ms',
      });
      const labelSet1 = meter.labels({ [key]: 'gauge-value1' });
      const labelSet2 = meter.labels({ [key]: 'gauge-value2' });
      gauge.getHandle(labelSet1).set(200.34);
      gauge.getHandle(labelSet2).set(-10.67);

      assert.strictEqual(meter.getMetrics().length, 1);
      const [{ descriptor, timeseries }] = meter.getMetrics();
      assert.deepStrictEqual(descriptor, {
        name: 'gauge',
        description: '',
        unit: 'ms',
        type: MetricDescriptorType.GAUGE_DOUBLE,
        labelKeys: ['gauge-key'],
      });
      assert.strictEqual(timeseries.length, 2);
      const [
        { labelValues: labelValues1, points: points1 },
        { labelValues: labelValues2, points: points2 },
      ] = timeseries;
      assert.deepStrictEqual(labelValues1, [{ value: 'gauge-value1' }]);
      assert.strictEqual(points1.length, 1);
      assert.strictEqual(points1[0].value, 200.34);
      assert.ok(
        hrTimeToMilliseconds(points1[0].timestamp) >
          hrTimeToMilliseconds(performanceTimeOrigin)
      );
      assert.deepStrictEqual(labelValues2, [{ value: 'gauge-value2' }]);
      assert.strictEqual(points2.length, 1);
      assert.strictEqual(points2[0].value, -10.67);
      assert.ok(
        hrTimeToMilliseconds(points2[0].timestamp) >
          hrTimeToMilliseconds(performanceTimeOrigin)
      );
    });

    it('should create a INT gauge', () => {
      const key = 'gauge-key';
      const gauge = meter.createGauge('gauge', {
        labelKeys: [key],
        unit: 'ms',
        valueType: types.ValueType.INT,
      });
      const labelSet1 = meter.labels({ [key]: 'gauge-value1' });
      const labelSet2 = meter.labels({ [key]: 'gauge-value2' });
      gauge.getHandle(labelSet1).set(200.34);
      gauge.getHandle(labelSet2).set(-10.67);

      assert.strictEqual(meter.getMetrics().length, 1);
      const [{ descriptor, timeseries }] = meter.getMetrics();
      assert.deepStrictEqual(descriptor, {
        name: 'gauge',
        description: '',
        unit: 'ms',
        type: MetricDescriptorType.GAUGE_INT64,
        labelKeys: ['gauge-key'],
      });
      assert.strictEqual(timeseries.length, 2);
      const [
        { labelValues: labelValues1, points: points1 },
        { labelValues: labelValues2, points: points2 },
      ] = timeseries;
      assert.deepStrictEqual(labelValues1, [{ value: 'gauge-value1' }]);
      assert.strictEqual(points1.length, 1);
      assert.strictEqual(points1[0].value, 200);
      assert.ok(
        hrTimeToMilliseconds(points1[0].timestamp) >
          hrTimeToMilliseconds(performanceTimeOrigin)
      );
      assert.deepStrictEqual(labelValues2, [{ value: 'gauge-value2' }]);
      assert.strictEqual(points2.length, 1);
      assert.strictEqual(points2[0].value, -10);
      assert.ok(
        hrTimeToMilliseconds(points2[0].timestamp) >
          hrTimeToMilliseconds(performanceTimeOrigin)
      );
    });
  });

  describe('Exporters', () => {
    it('should register an exporter', () => {
      const exporter = new NoopExporter();
      meter.addExporter(exporter);
      assert.equal(meter['_exporters'].length, 1);
    });

    it('should export a gauge when it is updated', done => {
      const exporter = new NoopExporter();
      exporter.on('export', metrics => {
        assert.equal(metrics[0].descriptor.name, 'name');
        assert.equal(metrics[0].timeseries[0].points[0].value, 20);
        assert.deepEqual(metrics[0].timeseries[0].labelValues, [
          {
            value: 'value1',
          },
          {
            value: 'value2',
          },
        ]);
        done();
      });

      meter.addExporter(exporter);
      const gauge = meter.createGauge('name') as GaugeMetric;
      const labelSet = meter.labels({ value: 'value1', value2: 'value2' });
      gauge.getHandle(labelSet).set(20);
    });

    it('should export a counter when it is updated', done => {
      const counter = meter.createCounter('name') as CounterMetric;
      const exporter = new NoopExporter();
      exporter.on('export', metrics => {
        assert.equal(metrics[0].descriptor.name, 'name');
        assert.equal(metrics[0].timeseries[0].points[0].value, 20);
        assert.deepEqual(metrics[0].timeseries[0].labelValues, [
          {
            value: 'value1',
          },
          {
            value: 'value2',
          },
        ]);
        done();
      });

      meter.addExporter(exporter);
      const labelSet = meter.labels({ value: 'value1', value2: 'value2' });
      counter.getHandle(labelSet).add(20);
    });
  });
});

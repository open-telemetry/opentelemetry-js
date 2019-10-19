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
import { Meter, Metric } from '../src';
import * as types from '@opentelemetry/types';
import { NoopLogger } from '@opentelemetry/core';

describe('Meter', () => {
  let meter: Meter;
  const labelValues = ['value'];
  const hrTime: types.HrTime = [22, 400000000];

  beforeEach(() => {
    meter = new Meter({
      logger: new NoopLogger(),
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
        const counter = meter.createCounter('name');
        const handle = counter.getHandle(labelValues);
        handle.add(10);
        assert.strictEqual(handle['_data'], 10);
        handle.add(10);
        assert.strictEqual(handle['_data'], 20);
      });

      it('should return the timeseries', () => {
        const counter = meter.createCounter('name');
        const handle = counter.getHandle(['value1', 'value2']);
        handle.add(20);
        assert.deepStrictEqual(handle.getTimeSeries(hrTime), {
          labelValues: [{ value: 'value1' }, { value: 'value2' }],
          points: [{ value: 20, timestamp: hrTime }],
        });
      });

      it('should add positive values by default', () => {
        const counter = meter.createCounter('name');
        const handle = counter.getHandle(labelValues);
        handle.add(10);
        assert.strictEqual(handle['_data'], 10);
        handle.add(-100);
        assert.strictEqual(handle['_data'], 10);
      });

      it('should not add the handle data when disabled', () => {
        const counter = meter.createCounter('name', {
          disabled: true,
        });
        const handle = counter.getHandle(labelValues);
        handle.add(10);
        assert.strictEqual(handle['_data'], 0);
      });

      it('should add negative value when monotonic is set to false', () => {
        const counter = meter.createCounter('name', {
          monotonic: false,
        });
        const handle = counter.getHandle(labelValues);
        handle.add(-10);
        assert.strictEqual(handle['_data'], -10);
      });

      it('should return same handle on same label values', () => {
        const counter = meter.createCounter('name');
        const handle = counter.getHandle(labelValues);
        handle.add(10);
        const handle1 = counter.getHandle(labelValues);
        handle1.add(10);
        assert.strictEqual(handle['_data'], 20);
        assert.strictEqual(handle, handle1);
      });
    });

    describe('.removeHandle()', () => {
      it('should remove a counter handle', () => {
        const counter = meter.createCounter('name');
        const handle = counter.getHandle(labelValues);
        assert.strictEqual(counter['_handles'].size, 1);
        counter.removeHandle(labelValues);
        assert.strictEqual(counter['_handles'].size, 0);
        const handle1 = counter.getHandle(labelValues);
        assert.strictEqual(counter['_handles'].size, 1);
        assert.notStrictEqual(handle, handle1);
      });

      it('should not fail when removing non existing handle', () => {
        const counter = meter.createCounter('name');
        counter.removeHandle([]);
      });

      it('should clear all handles', () => {
        const counter = meter.createCounter('name');
        counter.getHandle(labelValues);
        assert.strictEqual(counter['_handles'].size, 1);
        counter.clear();
        assert.strictEqual(counter['_handles'].size, 0);
      });
    });
  });

  describe('#gauge', () => {
    it('should create a gauge', () => {
      const gauge = meter.createGauge('name');
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
        const gauge = meter.createGauge('name');
        const handle = gauge.getHandle(labelValues);
        handle.set(10);
        assert.strictEqual(handle['_data'], 10);
        handle.set(250);
        assert.strictEqual(handle['_data'], 250);
      });

      it('should return the timeseries', () => {
        const gauge = meter.createGauge('name');
        const handle = gauge.getHandle(['v1', 'v2']);
        handle.set(150);
        assert.deepStrictEqual(handle.getTimeSeries(hrTime), {
          labelValues: [{ value: 'v1' }, { value: 'v2' }],
          points: [{ value: 150, timestamp: hrTime }],
        });
      });

      it('should go up and down by default', () => {
        const gauge = meter.createGauge('name');
        const handle = gauge.getHandle(labelValues);
        handle.set(10);
        assert.strictEqual(handle['_data'], 10);
        handle.set(-100);
        assert.strictEqual(handle['_data'], -100);
      });

      it('should not set the handle data when disabled', () => {
        const gauge = meter.createGauge('name', {
          disabled: true,
        });
        const handle = gauge.getHandle(labelValues);
        handle.set(10);
        assert.strictEqual(handle['_data'], 0);
      });

      it('should not set negative value when monotonic is set to true', () => {
        const gauge = meter.createGauge('name', {
          monotonic: true,
        });
        const handle = gauge.getHandle(labelValues);
        handle.set(-10);
        assert.strictEqual(handle['_data'], 0);
      });

      it('should return same handle on same label values', () => {
        const gauge = meter.createGauge('name');
        const handle = gauge.getHandle(labelValues);
        handle.set(10);
        const handle1 = gauge.getHandle(labelValues);
        handle1.set(10);
        assert.strictEqual(handle['_data'], 10);
        assert.strictEqual(handle, handle1);
      });
    });

    describe('.removeHandle()', () => {
      it('should remove the gauge handle', () => {
        const gauge = meter.createGauge('name');
        const handle = gauge.getHandle(labelValues);
        assert.strictEqual(gauge['_handles'].size, 1);
        gauge.removeHandle(labelValues);
        assert.strictEqual(gauge['_handles'].size, 0);
        const handle1 = gauge.getHandle(labelValues);
        assert.strictEqual(gauge['_handles'].size, 1);
        assert.notStrictEqual(handle, handle1);
      });

      it('should not fail when removing non existing handle', () => {
        const gauge = meter.createGauge('name');
        gauge.removeHandle([]);
      });

      it('should clear all handles', () => {
        const gauge = meter.createGauge('name');
        gauge.getHandle(labelValues);
        assert.strictEqual(gauge['_handles'].size, 1);
        gauge.clear();
        assert.strictEqual(gauge['_handles'].size, 0);
      });
    });
  });
});

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

describe('Meter', () => {
  let meter: Meter;
  const labelValues = ['value'];

  beforeEach(() => {
    meter = new Meter();
  });

  describe('#counter', () => {
    it('should create a counter without options', () => {
      const counter = meter.createCounter('name');
      assert.ok(counter instanceof Metric);
    });

    it('should create a counter without options', () => {
      const counter = meter.createCounter('name', {
        description: 'desc',
        unit: '1',
        disabled: false,
        monotonic: false,
      });
      assert.ok(counter instanceof Metric);
    });

    describe('.getHandle()', () => {
      it('should create the counter handle', () => {
        const counter = meter.createCounter('name');
        const handle = counter.getHandle(labelValues);
        handle.add(10);
        assert.strictEqual(handle['_data'], 10);
        handle.add(10);
        assert.strictEqual(handle['_data'], 20);
      });

      it('should not update the handle when disabled = true', () => {
        const counter = meter.createCounter('name', {
          disabled: true,
        });
        const handle = counter.getHandle(labelValues);
        handle.add(10);
        assert.strictEqual(handle['_data'], 0);
      });

      it('should not add negative value when monotonic = true', () => {
        const counter = meter.createCounter('name', {
          monotonic: true,
        });
        const handle = counter.getHandle(labelValues);
        handle.add(10);
        assert.strictEqual(handle['_data'], 10);
        handle.add(-100);
        assert.strictEqual(handle['_data'], 10);
      });

      it('should add negative value when monotonic = false', () => {
        const counter = meter.createCounter('name');
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
      it('should remove the counter handle', () => {
        const counter = meter.createCounter('name');
        const handle = counter.getHandle(labelValues);
        counter.removeHandle(labelValues);
        const handle1 = counter.getHandle(labelValues);
        assert.notStrictEqual(handle, handle1);
      });

      it('should not fail when removing non existing handle', () => {
        const counter = meter.createCounter('name');
        counter.removeHandle([]);
      });
    });
  });
});

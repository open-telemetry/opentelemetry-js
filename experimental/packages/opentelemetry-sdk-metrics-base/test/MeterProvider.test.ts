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
import { NOOP_METER } from '@opentelemetry/api-metrics-wip';
import { Meter, MeterProvider, InstrumentType, PointDataType } from '../src';
import { assertMetricData, defaultResource } from './util';
import { TestMetricReader } from './export/TestMetricReader';

describe('MeterProvider', () => {
  describe('constructor', () => {
    it('should construct without exceptions', () => {
      const meterProvider = new MeterProvider();
      assert(meterProvider instanceof MeterProvider);
    });

    it('construct with resource', () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });
      assert(meterProvider instanceof MeterProvider);
    });
  });

  describe('getMeter', () => {
    it('should get a meter', () => {
      const meterProvider = new MeterProvider();
      const meter = meterProvider.getMeter('meter1', '1.0.0');
      assert(meter instanceof Meter);
    });

    it('get a noop meter on shutdown', () => {
      const meterProvider = new MeterProvider();
      meterProvider.shutdown();
      const meter = meterProvider.getMeter('meter1', '1.0.0');
      assert.strictEqual(meter, NOOP_METER);
    });
  });

  describe('getView', () => {
    it('with existing instrument should rename', async () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

      meterProvider.addView({
        name: 'renamed-instrument',
        instrument: {
          name: 'non-renamed-instrument',
        },
        stream: {
          description: 'my renamed instrument',
          attributeKeys: ['attrib1']
        }
      });

      const myMeter = meterProvider.getMeter('meter1', '1.0.0');
      const counter = myMeter.createCounter('non-renamed-instrument');
      counter.add(1, { attrib1: 'attrib_value1', attrib2: 'attrib_value2' });

      const result = await reader.collect();

      assert.strictEqual(result?.instrumentationLibraryMetrics.length, 1);
      assert.strictEqual(result?.instrumentationLibraryMetrics[0].instrumentationLibrary.name, 'meter1');

      assertMetricData(result?.instrumentationLibraryMetrics[0].metrics[0], PointDataType.SINGULAR, {
          name: 'renamed-instrument',
          type: InstrumentType.COUNTER
        });
    });

    it('with named view and instrument wildcard should throw', () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      assert.throws(() => meterProvider.addView({
        name: 'renamed-instrument',
        instrument: {
          name: '*'
        }
      }));

      assert.throws(() => meterProvider.addView({
        name: 'renamed-instrument',
        instrument: {
          name: 'other.instrument.*'
        }
      }));
    });

    it('with named view and instrument type selector should throw', () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      assert.throws(() => meterProvider.addView({
        name: 'renamed-instrument',
        instrument: {
          type: InstrumentType.COUNTER
        }
      }));
    });

    it('with no meter name should apply view to instruments of all meters', async () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

      meterProvider.addView({
        name: 'renamed-instrument',
        instrument: {
          name: 'test-counter'
        }
      });

      const meter1 = meterProvider.getMeter('meter1', 'v1.0.0');
      const meter2 = meterProvider.getMeter('meter2', 'v1.0.0');

      const counter1 = meter1.createCounter('test-counter', { unit: 'ms' });
      const counter2 = meter2.createCounter('test-counter', { unit: 'ms' });

      counter1.add(1);
      counter2.add(2);

      const result = await reader.collect();

      assert.strictEqual(result?.instrumentationLibraryMetrics.length, 2);

      assert.strictEqual(result?.instrumentationLibraryMetrics[0].instrumentationLibrary.name, 'meter1');
      assertMetricData(result?.instrumentationLibraryMetrics[0].metrics[0], PointDataType.SINGULAR, {
        name: 'renamed-instrument',
        type: InstrumentType.COUNTER,
      });

      assert.strictEqual(result?.instrumentationLibraryMetrics[1].instrumentationLibrary.name, 'meter2');
      assertMetricData(result?.instrumentationLibraryMetrics[1].metrics[0], PointDataType.SINGULAR, {
        name: 'renamed-instrument',
        type: InstrumentType.COUNTER
      });
    });

    it('with no meter name should apply view to only the selected meter', async () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

      meterProvider.addView({
        name: 'renamed-instrument',
        instrument: {
          name: 'test-counter'
        },
        meter: {
          name: 'meter1'
        }
      });

      const meter1 = meterProvider.getMeter('meter1', 'v1.0.0');
      const meter2 = meterProvider.getMeter('meter2', 'v1.0.0');

      const counter1 = meter1.createCounter('test-counter', { unit: 'ms' });
      const counter2 = meter2.createCounter('test-counter', { unit: 'ms' });

      counter1.add(1);
      counter2.add(2);

      const result = await reader.collect();

      assert.strictEqual(result?.instrumentationLibraryMetrics.length, 2);
      assert.strictEqual(result?.instrumentationLibraryMetrics[0].instrumentationLibrary.name, 'meter1');
      assertMetricData(result?.instrumentationLibraryMetrics[0].metrics[0], PointDataType.SINGULAR, {
          name: 'renamed-instrument',
          type: InstrumentType.COUNTER
        });

      assert.strictEqual(result?.instrumentationLibraryMetrics[1].instrumentationLibrary.name, 'meter2');
      assertMetricData(result?.instrumentationLibraryMetrics[1].metrics[0], PointDataType.SINGULAR, {
          name: 'test-counter',
          type: InstrumentType.COUNTER
        });
    });

    it('with different instrument types does not throw', async () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });
      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

      meterProvider.addView({
        name: 'renamed-instrument',
        instrument: {
          name: 'test-counter'
        },
        meter: {
          name: 'meter1'
        }
      });

      meterProvider.addView({
        name: 'renamed-instrument',
        instrument: {
          name: 'test-histogram'
        },
        meter: {
          name: 'meter1'
        }
      });

      const meter = meterProvider.getMeter('meter1', 'v1.0.0');

      const counter = meter.createCounter('test-counter', { unit: 'ms' });
      assert.doesNotThrow(() => meter.createHistogram('test-histogram', { unit: 'ms' }));

      counter.add(1);

      const result = await reader.collect();

      assert.strictEqual(result?.instrumentationLibraryMetrics.length, 1);
      assertMetricData(result?.instrumentationLibraryMetrics[0].metrics[0], PointDataType.SINGULAR, {
          name: 'renamed-instrument',
          type: InstrumentType.COUNTER
        });
      assertMetricData(result?.instrumentationLibraryMetrics[0].metrics[1], PointDataType.HISTOGRAM, {
        name: 'renamed-instrument',
        type: InstrumentType.HISTOGRAM
      });
    });
  });
});

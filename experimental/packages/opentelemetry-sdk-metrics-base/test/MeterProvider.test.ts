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
import { NOOP_METER } from '@opentelemetry/api-metrics';
import { Meter, MeterProvider, InstrumentType, DataPointType } from '../src';
import {
  assertInstrumentationLibraryMetrics,
  assertMetricData,
  assertPartialDeepStrictEqual,
  defaultResource
} from './util';
import { TestMetricReader } from './export/TestMetricReader';
import * as sinon from 'sinon';

describe('MeterProvider', () => {
  afterEach(() => {
    sinon.restore();
  });

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

    it('should get an identical meter on duplicated calls', () => {
      const meterProvider = new MeterProvider();
      const meter1 = meterProvider.getMeter('meter1', '1.0.0');
      const meter2 = meterProvider.getMeter('meter1', '1.0.0');
      assert.strictEqual(meter1, meter2);
    });

    it('get a noop meter on shutdown', () => {
      const meterProvider = new MeterProvider();
      meterProvider.shutdown();
      const meter = meterProvider.getMeter('meter1', '1.0.0');
      assert.strictEqual(meter, NOOP_METER);
    });

    it('get meter with same identity', async () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });
      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

      // Create meter and instrument.
      // name+version pair 1
      meterProvider.getMeter('meter1', 'v1.0.0');
      meterProvider.getMeter('meter1', 'v1.0.0');
      // name+version pair 2
      meterProvider.getMeter('meter2', 'v1.0.0');
      meterProvider.getMeter('meter2', 'v1.0.0');
      // name+version pair 3
      meterProvider.getMeter('meter1', 'v1.0.1');
      meterProvider.getMeter('meter1', 'v1.0.1');
      // name+version+schemaUrl pair 4
      meterProvider.getMeter('meter1', 'v1.0.1', { schemaUrl: 'https://opentelemetry.io/schemas/1.4.0' });
      meterProvider.getMeter('meter1', 'v1.0.1', { schemaUrl: 'https://opentelemetry.io/schemas/1.4.0' });

      // Perform collection.
      const result = await reader.collect();

      // Results came only from de-duplicated meters.
      assert.strictEqual(result?.instrumentationLibraryMetrics.length, 4);

      // InstrumentationLibrary matches from de-duplicated meters.
      assertInstrumentationLibraryMetrics(result?.instrumentationLibraryMetrics[0], {
        name: 'meter1',
        version: 'v1.0.0'
      });
      assertInstrumentationLibraryMetrics(result?.instrumentationLibraryMetrics[1], {
        name: 'meter2',
        version: 'v1.0.0'
      });
      assertInstrumentationLibraryMetrics(result?.instrumentationLibraryMetrics[2], {
        name: 'meter1',
        version: 'v1.0.1'
      });
      assertInstrumentationLibraryMetrics(result?.instrumentationLibraryMetrics[3], {
        name: 'meter1',
        version: 'v1.0.1',
        schemaUrl: 'https://opentelemetry.io/schemas/1.4.0',
      });
    });
  });

  describe('addView', () => {
    it('with named view and instrument wildcard should throw', () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      // Throws with wildcard character only.
      assert.throws(() => meterProvider.addView({
          name: 'renamed-instrument'
        },
        {
          instrument: {
            name: '*'
          }
        }));

      // Throws with wildcard character in instrument name.
      assert.throws(() => meterProvider.addView({
        name: 'renamed-instrument'
      }, {
        instrument: {
          name: 'other.instrument.*'
        }
      }));
    });

    it('with named view and instrument type selector should throw', () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      assert.throws(() => meterProvider.addView({
          name: 'renamed-instrument'
        },
        {
          instrument: {
            type: InstrumentType.COUNTER
          }
        }));
    });

    it('with named view and no instrument selector should throw', () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      assert.throws(() => meterProvider.addView({
        name: 'renamed-instrument'
      }));

      assert.throws(() => meterProvider.addView({
          name: 'renamed-instrument'
        },
        {}));
    });

    it('with no view parameters should throw', () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      assert.throws(() => meterProvider.addView({}));
    });

    it('with existing instrument should rename', async () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

      // Add view to rename 'non-renamed-instrument' to 'renamed-instrument'
      meterProvider.addView({
          name: 'renamed-instrument',
          description: 'my renamed instrument'
        },
        {
          instrument: {
            name: 'non-renamed-instrument',
          },
        });

      // Create meter and instrument.
      const myMeter = meterProvider.getMeter('meter1', 'v1.0.0');
      const counter = myMeter.createCounter('non-renamed-instrument');
      counter.add(1, { attrib1: 'attrib_value1', attrib2: 'attrib_value2' });

      // Perform collection.
      const result = await reader.collect();

      // Results came only from one Meter.
      assert.strictEqual(result?.instrumentationLibraryMetrics.length, 1);

      // InstrumentationLibrary matches the only created Meter.
      assertInstrumentationLibraryMetrics(result?.instrumentationLibraryMetrics[0], {
        name: 'meter1',
        version: 'v1.0.0'
      });

      // Collected only one Metric.
      assert.strictEqual(result?.instrumentationLibraryMetrics[0].metrics.length, 1);

      // View updated name and description.
      assertMetricData(result?.instrumentationLibraryMetrics[0].metrics[0], DataPointType.SINGULAR, {
        name: 'renamed-instrument',
        type: InstrumentType.COUNTER,
        description: 'my renamed instrument'
      });

      // Only one DataPoint added.
      assert.strictEqual(result?.instrumentationLibraryMetrics[0].metrics[0].dataPoints.length, 1);

      // DataPoint matches attributes and point.
      assertPartialDeepStrictEqual(result?.instrumentationLibraryMetrics[0].metrics[0].dataPoints[0], {
        // MetricAttributes are still there.
        attributes: {
          attrib1: 'attrib_value1',
          attrib2: 'attrib_value2'
        },
        // Value that has been added to the counter.
        value: 1
      });
    });

    it('with attributeKeys should drop non-listed attributes', async () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

      // Add view to drop all attributes except 'attrib1'
      meterProvider.addView({
          attributeKeys: ['attrib1']
        },
        {
          instrument: {
            name: 'non-renamed-instrument',
          }
        });

      // Create meter and instrument.
      const myMeter = meterProvider.getMeter('meter1', 'v1.0.0');
      const counter = myMeter.createCounter('non-renamed-instrument');
      counter.add(1, { attrib1: 'attrib_value1', attrib2: 'attrib_value2' });

      // Perform collection.
      const result = await reader.collect();

      // Results came only from one Meter.
      assert.strictEqual(result?.instrumentationLibraryMetrics.length, 1);

      // InstrumentationLibrary matches the only created Meter.
      assertInstrumentationLibraryMetrics(result?.instrumentationLibraryMetrics[0], {
        name: 'meter1',
        version: 'v1.0.0'
      });

      // Collected only one Metric.
      assert.strictEqual(result?.instrumentationLibraryMetrics[0].metrics.length, 1);

      // View updated name and description.
      assertMetricData(result?.instrumentationLibraryMetrics[0].metrics[0], DataPointType.SINGULAR, {
        name: 'non-renamed-instrument',
        type: InstrumentType.COUNTER,
      });

      // Only one DataPoint added.
      assert.strictEqual(result?.instrumentationLibraryMetrics[0].metrics[0].dataPoints.length, 1);

      // DataPoint matches attributes and point.
      assertPartialDeepStrictEqual(result?.instrumentationLibraryMetrics[0].metrics[0].dataPoints[0], {
        // 'attrib_1' is still here but 'attrib_2' is not.
        attributes: {
          attrib1: 'attrib_value1'
        },
        // Value that has been added to the counter.
        value: 1
      });
    });

    it('with no meter name should apply view to instruments of all meters', async () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

      // Add view that renames 'test-counter' to 'renamed-instrument'
      meterProvider.addView({
          name: 'renamed-instrument'
        },
        {
          instrument: {
            name: 'test-counter'
          }
        });

      // Create two meters.
      const meter1 = meterProvider.getMeter('meter1', 'v1.0.0');
      const meter2 = meterProvider.getMeter('meter2', 'v1.0.0');

      // Create identical counters on both meters.
      const counter1 = meter1.createCounter('test-counter', { unit: 'ms' });
      const counter2 = meter2.createCounter('test-counter', { unit: 'ms' });

      // Add values to counters.
      counter1.add(1);
      counter2.add(2);

      // Perform collection.
      const result = await reader.collect();

      // Results came from two Meters.
      assert.strictEqual(result?.instrumentationLibraryMetrics.length, 2);

      // First InstrumentationLibrary matches the first created Meter.
      assertInstrumentationLibraryMetrics(result?.instrumentationLibraryMetrics[0], {
        name: 'meter1',
        version: 'v1.0.0'
      });

      // Collected one Metric on 'meter1'
      assert.strictEqual(result?.instrumentationLibraryMetrics[0].metrics.length, 1);

      // View updated the name to 'renamed-instrument' and instrument is still a Counter
      assertMetricData(result?.instrumentationLibraryMetrics[0].metrics[0], DataPointType.SINGULAR, {
        name: 'renamed-instrument',
        type: InstrumentType.COUNTER,
      });

      // Second InstrumentationLibrary matches the second created Meter.
      assertInstrumentationLibraryMetrics(result?.instrumentationLibraryMetrics[1], {
        name: 'meter2',
        version: 'v1.0.0'
      });

      // Collected one Metric on 'meter2'
      assert.strictEqual(result?.instrumentationLibraryMetrics[1].metrics.length, 1);

      // View updated the name to 'renamed-instrument' and instrument is still a Counter
      assertMetricData(result?.instrumentationLibraryMetrics[1].metrics[0], DataPointType.SINGULAR, {
        name: 'renamed-instrument',
        type: InstrumentType.COUNTER
      });
    });

    it('with meter name should apply view to only the selected meter', async () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });

      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

      // Add view that renames 'test-counter' to 'renamed-instrument' on 'meter1'
      meterProvider.addView({
          name: 'renamed-instrument'
        },
        {
          instrument: {
            name: 'test-counter'
          },
          meter: {
            name: 'meter1'
          }
        });

      // Create two meters.
      const meter1 = meterProvider.getMeter('meter1', 'v1.0.0');
      const meter2 = meterProvider.getMeter('meter2', 'v1.0.0');

      // Create counters with same name on both meters.
      const counter1 = meter1.createCounter('test-counter', { unit: 'ms' });
      const counter2 = meter2.createCounter('test-counter', { unit: 'ms' });

      // Add values to both.
      counter1.add(1);
      counter2.add(1);

      // Perform collection.
      const result = await reader.collect();

      // Results came from two Meters.
      assert.strictEqual(result?.instrumentationLibraryMetrics.length, 2);

      // First InstrumentationLibrary matches the first created Meter.
      assertInstrumentationLibraryMetrics(result?.instrumentationLibraryMetrics[0], {
        name: 'meter1',
        version: 'v1.0.0'
      });

      // Collected one Metric on 'meter1'
      assert.strictEqual(result?.instrumentationLibraryMetrics[0].metrics.length, 1);

      // View updated the name to 'renamed-instrument' and instrument is still a Counter
      assertMetricData(result?.instrumentationLibraryMetrics[0].metrics[0], DataPointType.SINGULAR, {
        name: 'renamed-instrument',
        type: InstrumentType.COUNTER
      });

      // Second InstrumentationLibrary matches the second created Meter.
      assertInstrumentationLibraryMetrics(result?.instrumentationLibraryMetrics[1], {
        name: 'meter2',
        version: 'v1.0.0'
      });

      // Collected one Metric on 'meter2'
      assert.strictEqual(result?.instrumentationLibraryMetrics[1].metrics.length, 1);

      // No updated name on 'test-counter'.
      assertMetricData(result?.instrumentationLibraryMetrics[1].metrics[0], DataPointType.SINGULAR, {
        name: 'test-counter',
        type: InstrumentType.COUNTER
      });
    });

    it('with different instrument types does not throw', async () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });
      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

      // Add Views to rename both instruments (of different types) to the same name.
      meterProvider.addView({
          name: 'renamed-instrument'
        },
        {
          instrument: {
            name: 'test-counter'
          },
          meter: {
            name: 'meter1'
          }
        });

      meterProvider.addView({
          name: 'renamed-instrument'
        },
        {
          instrument: {
            name: 'test-histogram'
          },
          meter: {
            name: 'meter1'
          }
        });

      // Create meter and instruments.
      const meter = meterProvider.getMeter('meter1', 'v1.0.0');
      const counter = meter.createCounter('test-counter', { unit: 'ms' });
      const histogram = meter.createHistogram('test-histogram', { unit: 'ms' });

      // Record values for both.
      counter.add(1);
      histogram.record(1);

      // Perform collection.
      const result = await reader.collect();

      // Results came only from one Meter.
      assert.strictEqual(result?.instrumentationLibraryMetrics.length, 1);

      // InstrumentationLibrary matches the only created Meter.
      assertInstrumentationLibraryMetrics(result?.instrumentationLibraryMetrics[0], {
        name: 'meter1',
        version: 'v1.0.0'
      });

      // Two metrics are collected ('renamed-instrument'-Counter and 'renamed-instrument'-Histogram)
      assert.strictEqual(result?.instrumentationLibraryMetrics[0].metrics.length, 2);

      // Both 'renamed-instrument' are still exported with their types.
      assertMetricData(result?.instrumentationLibraryMetrics[0].metrics[0], DataPointType.SINGULAR, {
        name: 'renamed-instrument',
        type: InstrumentType.COUNTER
      });
      assertMetricData(result?.instrumentationLibraryMetrics[0].metrics[1], DataPointType.HISTOGRAM, {
        name: 'renamed-instrument',
        type: InstrumentType.HISTOGRAM
      });
    });
  });

  describe('shutdown', () => {
    it('should shutdown all registered metric readers', async () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });
      const reader1 = new TestMetricReader();
      const reader2 = new TestMetricReader();
      const reader1ShutdownSpy = sinon.spy(reader1, 'shutdown');
      const reader2ShutdownSpy = sinon.spy(reader2, 'shutdown');

      meterProvider.addMetricReader(reader1);
      meterProvider.addMetricReader(reader2);

      await meterProvider.shutdown({ timeoutMillis: 1234 });
      await meterProvider.shutdown();
      await meterProvider.shutdown();

      assert.strictEqual(reader1ShutdownSpy.callCount, 1);
      assert.deepStrictEqual(reader1ShutdownSpy.args[0][0], { timeoutMillis: 1234 });
      assert.strictEqual(reader2ShutdownSpy.callCount, 1);
      assert.deepStrictEqual(reader2ShutdownSpy.args[0][0], { timeoutMillis: 1234 });
    });
  });

  describe('forceFlush', () => {
    it('should forceFlush all registered metric readers', async () => {
      const meterProvider = new MeterProvider({ resource: defaultResource });
      const reader1 = new TestMetricReader();
      const reader2 = new TestMetricReader();
      const reader1ForceFlushSpy = sinon.spy(reader1, 'forceFlush');
      const reader2ForceFlushSpy = sinon.spy(reader2, 'forceFlush');

      meterProvider.addMetricReader(reader1);
      meterProvider.addMetricReader(reader2);

      await meterProvider.forceFlush({ timeoutMillis: 1234 });
      await meterProvider.forceFlush({ timeoutMillis: 5678 });
      assert.strictEqual(reader1ForceFlushSpy.callCount, 2);
      assert.deepStrictEqual(reader1ForceFlushSpy.args[0][0], { timeoutMillis: 1234 });
      assert.deepStrictEqual(reader1ForceFlushSpy.args[1][0], { timeoutMillis: 5678 });
      assert.strictEqual(reader2ForceFlushSpy.callCount, 2);
      assert.deepStrictEqual(reader2ForceFlushSpy.args[0][0], { timeoutMillis: 1234 });
      assert.deepStrictEqual(reader2ForceFlushSpy.args[1][0], { timeoutMillis: 5678 });

      await meterProvider.shutdown();
      await meterProvider.forceFlush();
      assert.strictEqual(reader1ForceFlushSpy.callCount, 2);
      assert.strictEqual(reader2ForceFlushSpy.callCount, 2);
    });
  });
});

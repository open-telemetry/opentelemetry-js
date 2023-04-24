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
  MeterProvider,
  InstrumentType,
  DataPointType,
  ExplicitBucketHistogramAggregation,
  HistogramMetricData,
} from '../src';
import {
  assertScopeMetrics,
  assertMetricData,
  assertPartialDeepStrictEqual,
  defaultResource,
} from './util';
import { TestMetricReader } from './export/TestMetricReader';
import * as sinon from 'sinon';
import { View } from '../src/view/View';
import { Meter } from '../src/Meter';

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
      // returned tracer should be no-op, not instance of Meter (from SDK)
      assert.ok(!(meter instanceof Meter));
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
      meterProvider.getMeter('meter1', 'v1.0.1', {
        schemaUrl: 'https://opentelemetry.io/schemas/1.4.0',
      });
      meterProvider.getMeter('meter1', 'v1.0.1', {
        schemaUrl: 'https://opentelemetry.io/schemas/1.4.0',
      });

      // Perform collection.
      const { resourceMetrics, errors } = await reader.collect();

      assert.strictEqual(errors.length, 0);
      // Results came only from de-duplicated meters.
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 4);

      // InstrumentationScope matches from de-duplicated meters.
      assertScopeMetrics(resourceMetrics.scopeMetrics[0], {
        name: 'meter1',
        version: 'v1.0.0',
      });
      assertScopeMetrics(resourceMetrics.scopeMetrics[1], {
        name: 'meter2',
        version: 'v1.0.0',
      });
      assertScopeMetrics(resourceMetrics.scopeMetrics[2], {
        name: 'meter1',
        version: 'v1.0.1',
      });
      assertScopeMetrics(resourceMetrics.scopeMetrics[3], {
        name: 'meter1',
        version: 'v1.0.1',
        schemaUrl: 'https://opentelemetry.io/schemas/1.4.0',
      });
    });
  });

  describe('addView', () => {
    it('with existing instrument should rename', async () => {
      const meterProvider = new MeterProvider({
        resource: defaultResource,
        // Add view to rename 'non-renamed-instrument' to 'renamed-instrument'
        views: [
          new View({
            name: 'renamed-instrument',
            description: 'my renamed instrument',
            instrumentName: 'non-renamed-instrument',
          }),
        ],
      });

      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

      // Create meter and instrument.
      const myMeter = meterProvider.getMeter('meter1', 'v1.0.0');
      const counter = myMeter.createCounter('non-renamed-instrument');
      counter.add(1, { attrib1: 'attrib_value1', attrib2: 'attrib_value2' });

      // Perform collection.
      const { resourceMetrics, errors } = await reader.collect();

      assert.strictEqual(errors.length, 0);
      // Results came only from one Meter.
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);

      // InstrumentationScope matches the only created Meter.
      assertScopeMetrics(resourceMetrics.scopeMetrics[0], {
        name: 'meter1',
        version: 'v1.0.0',
      });

      // Collected only one Metric.
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);

      // View updated name and description.
      assertMetricData(
        resourceMetrics.scopeMetrics[0].metrics[0],
        DataPointType.SUM,
        {
          name: 'renamed-instrument',
          type: InstrumentType.COUNTER,
          description: 'my renamed instrument',
        }
      );

      // Only one DataPoint added.
      assert.strictEqual(
        resourceMetrics.scopeMetrics[0].metrics[0].dataPoints.length,
        1
      );

      // DataPoint matches attributes and point.
      assertPartialDeepStrictEqual(
        resourceMetrics.scopeMetrics[0].metrics[0].dataPoints[0],
        {
          // MetricAttributes are still there.
          attributes: {
            attrib1: 'attrib_value1',
            attrib2: 'attrib_value2',
          },
          // Value that has been added to the counter.
          value: 1,
        }
      );
    });

    it('with attributeKeys should drop non-listed attributes', async () => {
      // Add view to drop all attributes except 'attrib1'
      const meterProvider = new MeterProvider({
        resource: defaultResource,
        views: [
          new View({
            attributeKeys: ['attrib1'],
            instrumentName: 'non-renamed-instrument',
          }),
        ],
      });

      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

      // Create meter and instrument.
      const myMeter = meterProvider.getMeter('meter1', 'v1.0.0');
      const counter = myMeter.createCounter('non-renamed-instrument');
      counter.add(1, { attrib1: 'attrib_value1', attrib2: 'attrib_value2' });

      // Perform collection.
      const { resourceMetrics, errors } = await reader.collect();

      assert.strictEqual(errors.length, 0);
      // Results came only from one Meter.
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);

      // InstrumentationScope matches the only created Meter.
      assertScopeMetrics(resourceMetrics.scopeMetrics[0], {
        name: 'meter1',
        version: 'v1.0.0',
      });

      // Collected only one Metric.
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);

      // View updated name and description.
      assertMetricData(
        resourceMetrics.scopeMetrics[0].metrics[0],
        DataPointType.SUM,
        {
          name: 'non-renamed-instrument',
          type: InstrumentType.COUNTER,
        }
      );

      // Only one DataPoint added.
      assert.strictEqual(
        resourceMetrics.scopeMetrics[0].metrics[0].dataPoints.length,
        1
      );

      // DataPoint matches attributes and point.
      assertPartialDeepStrictEqual(
        resourceMetrics.scopeMetrics[0].metrics[0].dataPoints[0],
        {
          // 'attrib_1' is still here but 'attrib_2' is not.
          attributes: {
            attrib1: 'attrib_value1',
          },
          // Value that has been added to the counter.
          value: 1,
        }
      );
    });

    it('with no meter name should apply view to instruments of all meters', async () => {
      // Add view that renames 'test-counter' to 'renamed-instrument'
      const meterProvider = new MeterProvider({
        resource: defaultResource,
        views: [
          new View({
            name: 'renamed-instrument',
            instrumentName: 'test-counter',
          }),
        ],
      });

      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

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
      const { resourceMetrics, errors } = await reader.collect();

      assert.strictEqual(errors.length, 0);
      // Results came from two Meters.
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 2);

      // First InstrumentationScope matches the first created Meter.
      assertScopeMetrics(resourceMetrics.scopeMetrics[0], {
        name: 'meter1',
        version: 'v1.0.0',
      });

      // Collected one Metric on 'meter1'
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);

      // View updated the name to 'renamed-instrument' and instrument is still a Counter
      assertMetricData(
        resourceMetrics.scopeMetrics[0].metrics[0],
        DataPointType.SUM,
        {
          name: 'renamed-instrument',
          type: InstrumentType.COUNTER,
        }
      );

      // Second InstrumentationScope matches the second created Meter.
      assertScopeMetrics(resourceMetrics.scopeMetrics[1], {
        name: 'meter2',
        version: 'v1.0.0',
      });

      // Collected one Metric on 'meter2'
      assert.strictEqual(resourceMetrics.scopeMetrics[1].metrics.length, 1);

      // View updated the name to 'renamed-instrument' and instrument is still a Counter
      assertMetricData(
        resourceMetrics.scopeMetrics[1].metrics[0],
        DataPointType.SUM,
        {
          name: 'renamed-instrument',
          type: InstrumentType.COUNTER,
        }
      );
    });

    it('with meter name should apply view to only the selected meter', async () => {
      const meterProvider = new MeterProvider({
        resource: defaultResource,
        views: [
          // Add view that renames 'test-counter' to 'renamed-instrument' on 'meter1'
          new View({
            name: 'renamed-instrument',
            instrumentName: 'test-counter',
            meterName: 'meter1',
          }),
        ],
      });

      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

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
      const { resourceMetrics, errors } = await reader.collect();

      assert.strictEqual(errors.length, 0);
      // Results came from two Meters.
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 2);

      // First InstrumentationScope matches the first created Meter.
      assertScopeMetrics(resourceMetrics.scopeMetrics[0], {
        name: 'meter1',
        version: 'v1.0.0',
      });

      // Collected one Metric on 'meter1'
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);

      // View updated the name to 'renamed-instrument' and instrument is still a Counter
      assertMetricData(
        resourceMetrics.scopeMetrics[0].metrics[0],
        DataPointType.SUM,
        {
          name: 'renamed-instrument',
          type: InstrumentType.COUNTER,
        }
      );

      // Second InstrumentationScope matches the second created Meter.
      assertScopeMetrics(resourceMetrics.scopeMetrics[1], {
        name: 'meter2',
        version: 'v1.0.0',
      });

      // Collected one Metric on 'meter2'
      assert.strictEqual(resourceMetrics.scopeMetrics[1].metrics.length, 1);

      // No updated name on 'test-counter'.
      assertMetricData(
        resourceMetrics.scopeMetrics[1].metrics[0],
        DataPointType.SUM,
        {
          name: 'test-counter',
          type: InstrumentType.COUNTER,
        }
      );
    });

    it('with different instrument types does not throw', async () => {
      const meterProvider = new MeterProvider({
        resource: defaultResource,
        // Add Views to rename both instruments (of different types) to the same name.
        views: [
          new View({
            name: 'renamed-instrument',
            instrumentName: 'test-counter',
            meterName: 'meter1',
          }),
          new View({
            name: 'renamed-instrument',
            instrumentName: 'test-histogram',
            meterName: 'meter1',
          }),
        ],
      });
      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

      // Create meter and instruments.
      const meter = meterProvider.getMeter('meter1', 'v1.0.0');
      const counter = meter.createCounter('test-counter', { unit: 'ms' });
      const histogram = meter.createHistogram('test-histogram', { unit: 'ms' });

      // Record values for both.
      counter.add(1);
      histogram.record(1);

      // Perform collection.
      const { resourceMetrics, errors } = await reader.collect();

      assert.strictEqual(errors.length, 0);
      // Results came only from one Meter.
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);

      // InstrumentationScope matches the only created Meter.
      assertScopeMetrics(resourceMetrics.scopeMetrics[0], {
        name: 'meter1',
        version: 'v1.0.0',
      });

      // Two metrics are collected ('renamed-instrument'-Counter and 'renamed-instrument'-Histogram)
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 2);

      // Both 'renamed-instrument' are still exported with their types.
      assertMetricData(
        resourceMetrics.scopeMetrics[0].metrics[0],
        DataPointType.SUM,
        {
          name: 'renamed-instrument',
          type: InstrumentType.COUNTER,
        }
      );
      assertMetricData(
        resourceMetrics.scopeMetrics[0].metrics[1],
        DataPointType.HISTOGRAM,
        {
          name: 'renamed-instrument',
          type: InstrumentType.HISTOGRAM,
        }
      );
    });

    it('with instrument unit should apply view to only the selected instrument unit', async () => {
      // Add views with different boundaries for each unit.
      const msBoundaries = [0, 1, 2, 3, 4, 5];
      const sBoundaries = [10, 50, 250, 1000];

      const meterProvider = new MeterProvider({
        resource: defaultResource,
        views: [
          new View({
            instrumentUnit: 'ms',
            aggregation: new ExplicitBucketHistogramAggregation(msBoundaries),
          }),
          new View({
            instrumentUnit: 's',
            aggregation: new ExplicitBucketHistogramAggregation(sBoundaries),
          }),
        ],
      });

      const reader = new TestMetricReader();
      meterProvider.addMetricReader(reader);

      // Create meter and histograms, with different units.
      const meter = meterProvider.getMeter('meter1', 'v1.0.0');
      const histogram1 = meter.createHistogram('test-histogram-ms', {
        unit: 'ms',
      });
      const histogram2 = meter.createHistogram('test-histogram-s', {
        unit: 's',
      });

      // Record values for both.
      histogram1.record(1);
      histogram2.record(1);

      // Perform collection.
      const { resourceMetrics, errors } = await reader.collect();

      assert.strictEqual(errors.length, 0);
      // Results came only from one Meter
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);

      // InstrumentationScope matches the only created Meter.
      assertScopeMetrics(resourceMetrics.scopeMetrics[0], {
        name: 'meter1',
        version: 'v1.0.0',
      });

      // Two metrics are collected ('test-histogram-ms' and 'test-histogram-s')
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 2);

      // Check if the boundaries are applied to the correct instrument.
      assert.deepStrictEqual(
        (resourceMetrics.scopeMetrics[0].metrics[0] as HistogramMetricData)
          .dataPoints[0].value.buckets.boundaries,
        msBoundaries
      );
      assert.deepStrictEqual(
        (resourceMetrics.scopeMetrics[0].metrics[1] as HistogramMetricData)
          .dataPoints[0].value.buckets.boundaries,
        sBoundaries
      );
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
      assert.deepStrictEqual(reader1ShutdownSpy.args[0][0], {
        timeoutMillis: 1234,
      });
      assert.strictEqual(reader2ShutdownSpy.callCount, 1);
      assert.deepStrictEqual(reader2ShutdownSpy.args[0][0], {
        timeoutMillis: 1234,
      });
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
      assert.deepStrictEqual(reader1ForceFlushSpy.args[0][0], {
        timeoutMillis: 1234,
      });
      assert.deepStrictEqual(reader1ForceFlushSpy.args[1][0], {
        timeoutMillis: 5678,
      });
      assert.strictEqual(reader2ForceFlushSpy.callCount, 2);
      assert.deepStrictEqual(reader2ForceFlushSpy.args[0][0], {
        timeoutMillis: 1234,
      });
      assert.deepStrictEqual(reader2ForceFlushSpy.args[1][0], {
        timeoutMillis: 5678,
      });

      await meterProvider.shutdown();
      await meterProvider.forceFlush();
      assert.strictEqual(reader1ForceFlushSpy.callCount, 2);
      assert.strictEqual(reader2ForceFlushSpy.callCount, 2);
    });
  });
});

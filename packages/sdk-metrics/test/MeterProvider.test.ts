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
  HistogramMetricData,
  DataPoint,
} from '../src';
import {
  assertScopeMetrics,
  assertMetricData,
  assertPartialDeepStrictEqual,
  testResource,
} from './util';
import { TestMetricReader } from './export/TestMetricReader';
import * as sinon from 'sinon';
import { Meter } from '../src/Meter';
import { createAllowListAttributesProcessor } from '../src/view/AttributesProcessor';
import { AggregationType } from '../src/view/AggregationOption';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';

describe('MeterProvider', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should construct without exceptions', () => {
      const meterProvider = new MeterProvider();
      assert.ok(meterProvider instanceof MeterProvider);
    });

    it('construct with resource', () => {
      const meterProvider = new MeterProvider({ resource: testResource });
      assert.ok(meterProvider instanceof MeterProvider);
    });

    it('should use default resource when no resource is passed', async function () {
      const reader = new TestMetricReader();

      const meterProvider = new MeterProvider({
        readers: [reader],
      });

      // Create meter and instrument, otherwise nothing will export
      const myMeter = meterProvider.getMeter('meter1', 'v1.0.0');
      const counter = myMeter.createCounter('non-renamed-instrument');
      counter.add(1, { attrib1: 'attrib_value1', attrib2: 'attrib_value2' });

      // Perform collection.
      const { resourceMetrics } = await reader.collect();
      assert.deepStrictEqual(resourceMetrics.resource, defaultResource());
    });

    it('should use the resource passed in constructor', async function () {
      const reader = new TestMetricReader();
      const expectedResource = resourceFromAttributes({ foo: 'bar' });

      const meterProvider = new MeterProvider({
        readers: [reader],
        resource: expectedResource,
      });

      // Create meter and instrument, otherwise nothing will export
      const myMeter = meterProvider.getMeter('meter1', 'v1.0.0');
      const counter = myMeter.createCounter('non-renamed-instrument');
      counter.add(1, { attrib1: 'attrib_value1', attrib2: 'attrib_value2' });

      // Perform collection.
      const { resourceMetrics } = await reader.collect();
      assert.deepStrictEqual(resourceMetrics.resource, expectedResource);
    });

    it('should use default resource if not passed in constructor', async function () {
      const reader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        readers: [reader],
      });

      // Create meter and instrument, otherwise nothing will export
      const myMeter = meterProvider.getMeter('meter1', 'v1.0.0');
      const counter = myMeter.createCounter('non-renamed-instrument');
      counter.add(1, { attrib1: 'attrib_value1', attrib2: 'attrib_value2' });

      // Perform collection.
      const { resourceMetrics } = await reader.collect();
      assert.deepStrictEqual(resourceMetrics.resource, defaultResource());
    });
  });

  describe('getMeter', () => {
    it('should get a meter', () => {
      const meterProvider = new MeterProvider();
      const meter = meterProvider.getMeter('meter1', '1.0.0');
      assert.ok(meter instanceof Meter);
    });

    it('should get an identical meter on duplicated calls', () => {
      const meterProvider = new MeterProvider();
      const meter1 = meterProvider.getMeter('meter1', '1.0.0');
      const meter2 = meterProvider.getMeter('meter1', '1.0.0');
      assert.strictEqual(meter1, meter2);
    });

    it('get a noop meter on shutdown', async () => {
      const meterProvider = new MeterProvider();
      await meterProvider.shutdown();
      const meter = meterProvider.getMeter('meter1', '1.0.0');
      // returned tracer should be no-op, not instance of Meter (from SDK)
      assert.ok(!(meter instanceof Meter));
    });

    it('get meter with same identity', async () => {
      const reader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        resource: testResource,
        readers: [reader],
      });

      // Create meter and instrument, needs observation on instrument, otherwise the scope will not be reported.
      // name+version pair 1
      meterProvider.getMeter('meter1', 'v1.0.0').createCounter('test').add(1);
      meterProvider.getMeter('meter1', 'v1.0.0').createCounter('test').add(1);
      // name+version pair 2
      meterProvider.getMeter('meter2', 'v1.0.0').createCounter('test').add(1);
      meterProvider.getMeter('meter2', 'v1.0.0').createCounter('test').add(1);
      // name+version pair 3
      meterProvider.getMeter('meter1', 'v1.0.1').createCounter('test').add(1);
      meterProvider.getMeter('meter1', 'v1.0.1').createCounter('test').add(1);
      // name+version+schemaUrl pair 4
      meterProvider
        .getMeter('meter1', 'v1.0.1', {
          schemaUrl: 'https://opentelemetry.io/schemas/1.4.0',
        })
        .createCounter('test')
        .add(1);
      meterProvider
        .getMeter('meter1', 'v1.0.1', {
          schemaUrl: 'https://opentelemetry.io/schemas/1.4.0',
        })
        .createCounter('test')
        .add(1);

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
      const reader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        resource: testResource,
        // Add view to rename 'non-renamed-instrument' to 'renamed-instrument'
        views: [
          {
            name: 'renamed-instrument',
            description: 'my renamed instrument',
            instrumentName: 'non-renamed-instrument',
          },
        ],
        readers: [reader],
      });

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
          // Attributes are still there.
          attributes: {
            attrib1: 'attrib_value1',
            attrib2: 'attrib_value2',
          },
          // Value that has been added to the counter.
          value: 1,
        }
      );
    });

    it('with allowListProcessor should drop non-listed attributes', async () => {
      const reader = new TestMetricReader();

      // Add view to drop all attributes except 'attrib1'
      const meterProvider = new MeterProvider({
        resource: testResource,
        views: [
          {
            attributesProcessors: [
              createAllowListAttributesProcessor(['attrib1']),
            ],
            instrumentName: 'non-renamed-instrument',
          },
        ],
        readers: [reader],
      });

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
      const reader = new TestMetricReader();

      // Add view that renames 'test-counter' to 'renamed-instrument'
      const meterProvider = new MeterProvider({
        resource: testResource,
        views: [
          {
            name: 'renamed-instrument',
            instrumentName: 'test-counter',
          },
        ],
        readers: [reader],
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
      const reader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        resource: testResource,
        views: [
          // Add view that renames 'test-counter' to 'renamed-instrument' on 'meter1'
          {
            name: 'renamed-instrument',
            instrumentName: 'test-counter',
            meterName: 'meter1',
          },
        ],
        readers: [reader],
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
      const reader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        resource: testResource,
        // Add Views to rename both instruments (of different types) to the same name.
        views: [
          {
            name: 'renamed-instrument',
            instrumentName: 'test-counter',
            meterName: 'meter1',
          },
          {
            name: 'renamed-instrument',
            instrumentName: 'test-histogram',
            meterName: 'meter1',
          },
        ],
        readers: [reader],
      });

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

      const reader = new TestMetricReader();

      const meterProvider = new MeterProvider({
        resource: testResource,
        views: [
          {
            instrumentUnit: 'ms',
            // aggregation: new ExplicitBucketHistogramAggregation(msBoundaries),
            aggregation: {
              type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
              options: { boundaries: msBoundaries },
            },
          },
          {
            instrumentUnit: 's',
            aggregation: {
              type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
              options: { boundaries: sBoundaries },
            },
          },
        ],
        readers: [reader],
      });

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

  describe('aggregationCardinalityLimit with view should apply the cardinality limit', () => {
    it('should respect the aggregationCardinalityLimit', async () => {
      const reader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        resource: testResource,
        readers: [reader],
        views: [
          {
            instrumentName: 'test-counter',
            aggregationCardinalityLimit: 2, // Set cardinality limit to 2
          },
        ],
      });

      const meter = meterProvider.getMeter('meter1', 'v1.0.0');
      const counter = meter.createCounter('test-counter');

      // Add values with different attributes
      counter.add(1, { attr1: 'value1' });
      counter.add(1, { attr2: 'value2' });
      counter.add(1, { attr3: 'value3' });
      counter.add(1, { attr1: 'value1' });

      // Perform collection
      const { resourceMetrics, errors } = await reader.collect();

      assert.strictEqual(errors.length, 0);
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);

      const metricData = resourceMetrics.scopeMetrics[0].metrics[0];
      assert.strictEqual(metricData.dataPoints.length, 2);

      // Check if the overflow data point is present
      const overflowDataPoint = (
        metricData.dataPoints as DataPoint<number>[]
      ).find((dataPoint: DataPoint<number>) =>
        Object.prototype.hasOwnProperty.call(
          dataPoint.attributes,
          'otel.metric.overflow'
        )
      );
      assert.ok(overflowDataPoint);
      assert.strictEqual(overflowDataPoint.value, 2);
    });

    it('should respect the aggregationCardinalityLimit for observable counter', async () => {
      const reader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        resource: testResource,
        readers: [reader],
        views: [
          {
            instrumentName: 'test-observable-counter',
            aggregationCardinalityLimit: 2, // Set cardinality limit to 2
          },
        ],
      });

      const meter = meterProvider.getMeter('meter1', 'v1.0.0');
      const observableCounter = meter.createObservableCounter(
        'test-observable-counter'
      );
      observableCounter.addCallback(observableResult => {
        observableResult.observe(1, { attr1: 'value1' });
        observableResult.observe(2, { attr2: 'value2' });
        observableResult.observe(3, { attr3: 'value3' });
        observableResult.observe(4, { attr1: 'value1' });
      });

      // Perform collection
      const { resourceMetrics, errors } = await reader.collect();

      assert.strictEqual(errors.length, 0);
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);

      const metricData = resourceMetrics.scopeMetrics[0].metrics[0];
      assert.strictEqual(metricData.dataPoints.length, 2);

      // Check if the overflow data point is present
      const overflowDataPoint = (
        metricData.dataPoints as DataPoint<number>[]
      ).find((dataPoint: DataPoint<number>) =>
        Object.prototype.hasOwnProperty.call(
          dataPoint.attributes,
          'otel.metric.overflow'
        )
      );
      assert.ok(overflowDataPoint);
      assert.strictEqual(overflowDataPoint.value, 3);
    });
  });

  describe('aggregationCardinalityLimit via MetricReader should apply the cardinality limit', () => {
    it('should respect the aggregationCardinalityLimit set via MetricReader', async () => {
      const reader = new TestMetricReader({
        cardinalitySelector: (instrumentType: InstrumentType) => 2, // Set cardinality limit to 2 via cardinalitySelector
      });
      const meterProvider = new MeterProvider({
        resource: testResource,
        readers: [reader],
      });

      const meter = meterProvider.getMeter('meter1', 'v1.0.0');
      const counter = meter.createCounter('test-counter');

      // Add values with different attributes
      counter.add(1, { attr1: 'value1' });
      counter.add(1, { attr2: 'value2' });
      counter.add(1, { attr3: 'value3' });
      counter.add(1, { attr1: 'value1' });

      // Perform collection
      const { resourceMetrics, errors } = await reader.collect();

      assert.strictEqual(errors.length, 0);
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);

      const metricData = resourceMetrics.scopeMetrics[0].metrics[0];
      assert.strictEqual(metricData.dataPoints.length, 2);

      // Check if the overflow data point is present
      const overflowDataPoint = (
        metricData.dataPoints as DataPoint<number>[]
      ).find((dataPoint: DataPoint<number>) =>
        Object.prototype.hasOwnProperty.call(
          dataPoint.attributes,
          'otel.metric.overflow'
        )
      );
      assert.ok(overflowDataPoint);
      assert.strictEqual(overflowDataPoint.value, 2);
    });
  });

  describe('default aggregationCardinalityLimit should apply the cardinality limit', () => {
    it('should respect the default aggregationCardinalityLimit', async () => {
      const reader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        resource: testResource,
        readers: [reader],
      });

      const meter = meterProvider.getMeter('meter1', 'v1.0.0');
      const counter = meter.createCounter('test-counter');

      // Add values with different attributes
      for (let i = 0; i < 2001; i++) {
        const attributes = { [`attr${i}`]: `value${i}` };
        counter.add(1, attributes);
      }

      // Perform collection
      const { resourceMetrics, errors } = await reader.collect();

      assert.strictEqual(errors.length, 0);
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);

      const metricData = resourceMetrics.scopeMetrics[0].metrics[0];
      assert.strictEqual(metricData.dataPoints.length, 2000);

      // Check if the overflow data point is present
      const overflowDataPoint = (
        metricData.dataPoints as DataPoint<number>[]
      ).find((dataPoint: DataPoint<number>) =>
        Object.prototype.hasOwnProperty.call(
          dataPoint.attributes,
          'otel.metric.overflow'
        )
      );
      assert.ok(overflowDataPoint);
      assert.strictEqual(overflowDataPoint.value, 2);
    });
  });

  describe('shutdown', () => {
    it('should shutdown all registered metric readers', async () => {
      const reader1 = new TestMetricReader();
      const reader2 = new TestMetricReader();
      const reader1ShutdownSpy = sinon.spy(reader1, 'shutdown');
      const reader2ShutdownSpy = sinon.spy(reader2, 'shutdown');
      const meterProvider = new MeterProvider({
        resource: testResource,
        readers: [reader1, reader2],
      });

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
      const reader1 = new TestMetricReader();
      const reader2 = new TestMetricReader();
      const reader1ForceFlushSpy = sinon.spy(reader1, 'forceFlush');
      const reader2ForceFlushSpy = sinon.spy(reader2, 'forceFlush');
      const meterProvider = new MeterProvider({
        resource: testResource,
        readers: [reader1, reader2],
      });

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

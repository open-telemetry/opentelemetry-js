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
import * as sinon from 'sinon';
import { InstrumentationScope } from '@opentelemetry/core';
import {
  DataPoint,
  DataPointType,
  Histogram,
  InstrumentType,
  MeterProvider,
} from '../src';
import { InstrumentDescriptor } from '../src/InstrumentDescriptor';
import {
  TestDeltaMetricReader,
  TestMetricReader,
} from './export/TestMetricReader';
import {
  assertDataPoint,
  assertMetricData,
  commonAttributes,
  commonValues,
  defaultInstrumentationScope,
  testResource,
} from './util';
import { ObservableResult, ValueType } from '@opentelemetry/api';
import { IMetricReader } from '../src/export/MetricReader';
import { Resource } from '@opentelemetry/resources';

describe('Instruments', () => {
  describe('Counter', () => {
    it('should add common values and attributes without exceptions', async () => {
      const { meter, cumulativeReader } = setup();
      const counter = meter.createCounter('test', {
        description: 'foobar',
        unit: 'kB',
      });

      for (const values of commonValues) {
        for (const attributes of commonAttributes) {
          counter.add(values, attributes);
        }
      }

      await validateExport(cumulativeReader, {
        descriptor: {
          name: 'test',
          description: 'foobar',
          unit: 'kB',
          type: InstrumentType.COUNTER,
          valueType: ValueType.DOUBLE,
          advice: {},
        },
      });
    });

    it('should add valid INT values', async () => {
      const { meter, cumulativeReader } = setup();
      const counter = meter.createCounter('test', {
        valueType: ValueType.INT,
      });

      counter.add(1);
      counter.add(1, { foo: 'bar' });
      // floating-point values should be trunc-ed.
      counter.add(1.1);
      // non-finite/non-number values should be ignored.
      counter.add(Infinity);
      counter.add(-Infinity);
      counter.add(NaN);
      counter.add('1' as any);
      await validateExport(cumulativeReader, {
        descriptor: {
          name: 'test',
          description: '',
          unit: '',
          type: InstrumentType.COUNTER,
          valueType: ValueType.INT,
          advice: {},
        },
        dataPointType: DataPointType.SUM,
        isMonotonic: true,
        dataPoints: [
          {
            attributes: {},
            value: 2,
          },
          {
            attributes: { foo: 'bar' },
            value: 1,
          },
        ],
      });

      // add negative values should not be observable.
      counter.add(-1.1);
      await validateExport(cumulativeReader, {
        dataPointType: DataPointType.SUM,
        isMonotonic: true,
        dataPoints: [
          {
            attributes: {},
            value: 2,
          },
          {
            attributes: { foo: 'bar' },
            value: 1,
          },
        ],
      });
    });

    it('should add valid DOUBLE values', async () => {
      const { meter, cumulativeReader } = setup();
      const counter = meter.createCounter('test', {
        valueType: ValueType.DOUBLE,
      });

      counter.add(1);
      counter.add(1, { foo: 'bar' });
      // add floating-point values.
      counter.add(1.1);
      counter.add(1.2, { foo: 'bar' });
      // non-number values should be ignored.
      counter.add('1' as any);

      await validateExport(cumulativeReader, {
        dataPointType: DataPointType.SUM,
        isMonotonic: true,
        dataPoints: [
          {
            attributes: {},
            value: 2.1,
          },
          {
            attributes: { foo: 'bar' },
            value: 2.2,
          },
        ],
      });

      // add negative values should not be observable.
      counter.add(-1.1);
      await validateExport(cumulativeReader, {
        dataPointType: DataPointType.SUM,
        isMonotonic: true,
        dataPoints: [
          {
            attributes: {},
            value: 2.1,
          },
          {
            attributes: { foo: 'bar' },
            value: 2.2,
          },
        ],
      });
    });
  });

  describe('UpDownCounter', () => {
    it('should add common values and attributes without exceptions', async () => {
      const { meter, cumulativeReader } = setup();
      const upDownCounter = meter.createUpDownCounter('test', {
        description: 'foobar',
        unit: 'kB',
      });

      for (const values of commonValues) {
        for (const attributes of commonAttributes) {
          upDownCounter.add(values, attributes);
        }
      }

      await validateExport(cumulativeReader, {
        descriptor: {
          name: 'test',
          description: 'foobar',
          unit: 'kB',
          type: InstrumentType.UP_DOWN_COUNTER,
          valueType: ValueType.DOUBLE,
          advice: {},
        },
      });
    });

    it('should add INT values', async () => {
      const { meter, deltaReader } = setup();
      const upDownCounter = meter.createUpDownCounter('test', {
        valueType: ValueType.INT,
      });

      upDownCounter.add(3);
      upDownCounter.add(-1.1);
      upDownCounter.add(4, { foo: 'bar' });
      upDownCounter.add(1.1, { foo: 'bar' });

      // non-finite/non-number values should be ignored.
      upDownCounter.add(Infinity);
      upDownCounter.add(-Infinity);
      upDownCounter.add(NaN);
      upDownCounter.add('1' as any);

      await validateExport(deltaReader, {
        descriptor: {
          name: 'test',
          description: '',
          unit: '',
          type: InstrumentType.UP_DOWN_COUNTER,
          valueType: ValueType.INT,
          advice: {},
        },
        dataPointType: DataPointType.SUM,
        isMonotonic: false,
        dataPoints: [
          {
            attributes: {},
            value: 2,
          },
          {
            attributes: { foo: 'bar' },
            value: 5,
          },
        ],
      });
    });

    it('should add DOUBLE values', async () => {
      const { meter, deltaReader } = setup();
      const upDownCounter = meter.createUpDownCounter('test', {
        valueType: ValueType.DOUBLE,
      });

      upDownCounter.add(3);
      upDownCounter.add(-1.1);
      upDownCounter.add(4, { foo: 'bar' });
      upDownCounter.add(1.1, { foo: 'bar' });
      // non-number values should be ignored.
      upDownCounter.add('1' as any);

      await validateExport(deltaReader, {
        dataPointType: DataPointType.SUM,
        isMonotonic: false,
        dataPoints: [
          {
            attributes: {},
            value: 1.9,
          },
          {
            attributes: { foo: 'bar' },
            value: 5.1,
          },
        ],
      });
    });
  });

  describe('Histogram', () => {
    it('should record common values and attributes without exceptions', async () => {
      const { meter, cumulativeReader } = setup();
      const histogram = meter.createHistogram('test', {
        description: 'foobar',
        unit: 'kB',
      });

      for (const values of commonValues) {
        for (const attributes of commonAttributes) {
          histogram.record(values, attributes);
        }
      }

      await validateExport(cumulativeReader, {
        descriptor: {
          name: 'test',
          description: 'foobar',
          unit: 'kB',
          type: InstrumentType.HISTOGRAM,
          valueType: ValueType.DOUBLE,
          advice: {},
        },
      });
    });

    it('should record INT values', async () => {
      const { meter, deltaReader } = setup();
      const histogram = meter.createHistogram('test', {
        valueType: ValueType.INT,
      });

      histogram.record(10);
      // 0.1 should be trunc-ed to 0
      histogram.record(0.1);
      histogram.record(100, { foo: 'bar' });
      histogram.record(0.1, { foo: 'bar' });
      // non-finite/non-number values should be ignored.
      histogram.record(Infinity);
      histogram.record(-Infinity);
      histogram.record(NaN);
      histogram.record('1' as any);

      await validateExport(deltaReader, {
        descriptor: {
          name: 'test',
          description: '',
          unit: '',
          type: InstrumentType.HISTOGRAM,
          valueType: ValueType.INT,
          advice: {},
        },
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: [
          {
            attributes: {},
            value: {
              buckets: {
                boundaries: [
                  0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                  7500, 10000,
                ],
                counts: [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              count: 2,
              sum: 10,
              max: 10,
              min: 0,
            },
          },
          {
            attributes: { foo: 'bar' },
            value: {
              buckets: {
                boundaries: [
                  0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                  7500, 10000,
                ],
                counts: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              count: 2,
              sum: 100,
              max: 100,
              min: 0,
            },
          },
        ],
      });
    });

    it('should recognize metric advice', async () => {
      const { meter, deltaReader } = setup();
      const histogram = meter.createHistogram('test', {
        valueType: ValueType.INT,
        advice: {
          // Set explicit boundaries that are different from the default one.
          explicitBucketBoundaries: [1, 9, 100],
        },
      });

      histogram.record(10);
      histogram.record(0);
      histogram.record(100, { foo: 'bar' });
      histogram.record(0, { foo: 'bar' });
      await validateExport(deltaReader, {
        descriptor: {
          name: 'test',
          description: '',
          unit: '',
          type: InstrumentType.HISTOGRAM,
          valueType: ValueType.INT,
          advice: {
            explicitBucketBoundaries: [1, 9, 100],
          },
        },
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: [
          {
            attributes: {},
            value: {
              buckets: {
                boundaries: [1, 9, 100],
                counts: [1, 0, 1, 0],
              },
              count: 2,
              sum: 10,
              max: 10,
              min: 0,
            },
          },
          {
            attributes: { foo: 'bar' },
            value: {
              buckets: {
                boundaries: [1, 9, 100],
                counts: [1, 0, 1, 0],
              },
              count: 2,
              sum: 100,
              max: 100,
              min: 0,
            },
          },
        ],
      });
    });

    it('should allow metric advice with empty explicit boundaries', function () {
      const meter = new MeterProvider({
        readers: [new TestMetricReader()],
      }).getMeter('meter');

      assert.doesNotThrow(() => {
        meter.createHistogram('histogram', {
          advice: {
            explicitBucketBoundaries: [],
          },
        });
      });
    });

    it('should collect min and max', async () => {
      const { meter, deltaReader, cumulativeReader } = setup();
      const histogram = meter.createHistogram('test', {
        valueType: ValueType.INT,
      });

      histogram.record(10);
      histogram.record(100);
      await deltaReader.collect();
      await cumulativeReader.collect();

      histogram.record(20);
      histogram.record(90);

      // Delta should only have min/max of values recorded after the collection.
      await validateExport(deltaReader, {
        descriptor: {
          name: 'test',
          description: '',
          unit: '',
          type: InstrumentType.HISTOGRAM,
          valueType: ValueType.INT,
          advice: {},
        },
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: [
          {
            attributes: {},
            value: {
              buckets: {
                boundaries: [
                  0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                  7500, 10000,
                ],
                counts: [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              count: 2,
              sum: 110,
              min: 20,
              max: 90,
            },
          },
        ],
      });

      // Cumulative should have min/max of all recorded values.
      await validateExport(cumulativeReader, {
        descriptor: {
          name: 'test',
          description: '',
          unit: '',
          type: InstrumentType.HISTOGRAM,
          valueType: ValueType.INT,
          advice: {},
        },
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: [
          {
            attributes: {},
            value: {
              buckets: {
                boundaries: [
                  0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                  7500, 10000,
                ],
                counts: [0, 0, 1, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              count: 4,
              sum: 220,
              min: 10,
              max: 100,
            },
          },
        ],
      });
    });

    it('should not record negative INT values', async () => {
      const { meter, deltaReader } = setup();
      const histogram = meter.createHistogram('test', {
        valueType: ValueType.DOUBLE,
      });

      histogram.record(-1, { foo: 'bar' });
      const result = await deltaReader.collect();

      // nothing observed
      assert.equal(result.resourceMetrics.scopeMetrics.length, 0);
    });

    it('should record DOUBLE values', async () => {
      const { meter, deltaReader } = setup();
      const histogram = meter.createHistogram('test', {
        valueType: ValueType.DOUBLE,
      });

      histogram.record(10);
      histogram.record(0.1);
      histogram.record(100, { foo: 'bar' });
      histogram.record(0.1, { foo: 'bar' });
      // non-number values should be ignored.
      histogram.record('1' as any);
      histogram.record(NaN);

      await validateExport(deltaReader, {
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: [
          {
            attributes: {},
            value: {
              buckets: {
                boundaries: [
                  0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                  7500, 10000,
                ],
                counts: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              count: 2,
              sum: 10.1,
              max: 10,
              min: 0.1,
            },
          },
          {
            attributes: { foo: 'bar' },
            value: {
              buckets: {
                boundaries: [
                  0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000,
                  7500, 10000,
                ],
                counts: [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
              count: 2,
              sum: 100.1,
              max: 100,
              min: 0.1,
            },
          },
        ],
      });
    });

    it('should not record negative DOUBLE values', async () => {
      const { meter, deltaReader } = setup();
      const histogram = meter.createHistogram('test', {
        valueType: ValueType.DOUBLE,
      });

      histogram.record(-0.5, { foo: 'bar' });
      const result = await deltaReader.collect();

      // nothing observed
      assert.equal(result.resourceMetrics.scopeMetrics.length, 0);
    });
  });

  describe('ObservableCounter', () => {
    it('should observe common values and attributes without exceptions', async () => {
      const { meter, deltaReader } = setup();
      const callback = sinon.spy((observableResult: ObservableResult) => {
        for (const values of commonValues) {
          for (const attributes of commonAttributes) {
            observableResult.observe(values, attributes);
          }
        }
      });
      const observableCounter = meter.createObservableCounter('test');
      observableCounter.addCallback(callback);

      await deltaReader.collect();
      assert.strictEqual(callback.callCount, 1);
    });

    it('should observe values', async () => {
      const { meter, cumulativeReader } = setup();
      let callCount = 0;
      const observableCounter = meter.createObservableCounter('test');
      observableCounter.addCallback(observableResult => {
        observableResult.observe(++callCount);
        observableResult.observe(1, { foo: 'bar' });
      });

      await validateExport(cumulativeReader, {
        dataPointType: DataPointType.SUM,
        isMonotonic: false,
        dataPoints: [
          {
            attributes: {},
            value: 1,
          },
          {
            attributes: { foo: 'bar' },
            value: 1,
          },
        ],
      });
      await validateExport(cumulativeReader, {
        dataPointType: DataPointType.SUM,
        isMonotonic: false,
        dataPoints: [
          {
            attributes: {},
            value: 2,
          },
          {
            attributes: { foo: 'bar' },
            value: 1,
          },
        ],
      });
    });
  });

  describe('ObservableUpDownCounter', () => {
    it('should observe common values and attributes without exceptions', async () => {
      const { meter, deltaReader } = setup();
      const callback = sinon.spy((observableResult: ObservableResult) => {
        for (const values of commonValues) {
          for (const attributes of commonAttributes) {
            observableResult.observe(values, attributes);
          }
        }
      });
      const observableUpDownCounter =
        meter.createObservableUpDownCounter('test');
      observableUpDownCounter.addCallback(callback);

      await deltaReader.collect();
      assert.strictEqual(callback.callCount, 1);
    });

    it('should observe values', async () => {
      const { meter, cumulativeReader } = setup();
      let callCount = 0;
      const observableUpDownCounter =
        meter.createObservableUpDownCounter('test');
      observableUpDownCounter.addCallback(observableResult => {
        observableResult.observe(++callCount);
        observableResult.observe(1, { foo: 'bar' });
      });

      await validateExport(cumulativeReader, {
        dataPointType: DataPointType.SUM,
        isMonotonic: false,
        dataPoints: [
          {
            attributes: {},
            value: 1,
          },
          {
            attributes: { foo: 'bar' },
            value: 1,
          },
        ],
      });
      await validateExport(cumulativeReader, {
        dataPointType: DataPointType.SUM,
        isMonotonic: false,
        dataPoints: [
          {
            attributes: {},
            value: 2,
          },
          {
            attributes: { foo: 'bar' },
            value: 1,
          },
        ],
      });
    });
  });

  describe('ObservableGauge', () => {
    it('should observe common values and attributes without exceptions', async () => {
      const { meter, deltaReader } = setup();
      const callback = sinon.spy((observableResult: ObservableResult) => {
        for (const values of commonValues) {
          for (const attributes of commonAttributes) {
            observableResult.observe(values, attributes);
          }
        }
      });
      const observableGauge = meter.createObservableGauge('test');
      observableGauge.addCallback(callback);

      await deltaReader.collect();
      assert.strictEqual(callback.callCount, 1);
    });

    it('should observe values', async () => {
      const { meter, cumulativeReader } = setup();
      let num = 0;
      const observableGauge = meter.createObservableGauge('test');
      observableGauge.addCallback(observableResult => {
        num += 10;
        if (num === 30) {
          observableResult.observe(-1);
        } else {
          observableResult.observe(num);
        }
        observableResult.observe(1, { foo: 'bar' });
      });

      await validateExport(cumulativeReader, {
        dataPointType: DataPointType.GAUGE,
        dataPoints: [
          {
            attributes: {},
            value: 10,
          },
          {
            attributes: { foo: 'bar' },
            value: 1,
          },
        ],
      });
      await validateExport(cumulativeReader, {
        dataPointType: DataPointType.GAUGE,
        dataPoints: [
          {
            attributes: {},
            value: 20,
          },
          {
            attributes: { foo: 'bar' },
            value: 1,
          },
        ],
      });
      await validateExport(cumulativeReader, {
        dataPointType: DataPointType.GAUGE,
        dataPoints: [
          {
            attributes: {},
            value: -1,
          },
          {
            attributes: { foo: 'bar' },
            value: 1,
          },
        ],
      });
    });
  });

  describe('Gauge', () => {
    it('should record common values and attributes without exceptions', async () => {
      const { meter } = setup();
      const gauge = meter.createGauge('test');

      for (const values of commonValues) {
        for (const attributes of commonAttributes) {
          gauge.record(values, attributes);
        }
      }
    });

    it('should record values', async () => {
      const { meter, cumulativeReader } = setup();
      const gauge = meter.createGauge('test');

      gauge.record(1, { foo: 'bar' });
      gauge.record(-1);

      await validateExport(cumulativeReader, {
        dataPointType: DataPointType.GAUGE,
        dataPoints: [
          {
            attributes: { foo: 'bar' },
            value: 1,
          },
          {
            attributes: {},
            value: -1,
          },
        ],
      });
    });
  });
});

function setup() {
  const deltaReader = new TestDeltaMetricReader();
  const cumulativeReader = new TestMetricReader();
  const meterProvider = new MeterProvider({
    resource: testResource,
    readers: [deltaReader, cumulativeReader],
  });
  const meter = meterProvider.getMeter(
    defaultInstrumentationScope.name,
    defaultInstrumentationScope.version,
    {
      schemaUrl: defaultInstrumentationScope.schemaUrl,
    }
  );

  return {
    meterProvider,
    meter,
    deltaReader,
    cumulativeReader,
  };
}

interface ValidateMetricData {
  resource?: Resource;
  instrumentationScope?: InstrumentationScope;
  descriptor?: InstrumentDescriptor;
  dataPointType?: DataPointType;
  dataPoints?: Partial<DataPoint<number | Partial<Histogram>>>[];
  isMonotonic?: boolean;
}

async function validateExport(
  reader: IMetricReader,
  expected: ValidateMetricData
) {
  const { resourceMetrics, errors } = await reader.collect();

  assert.strictEqual(errors.length, 0);
  assert.notStrictEqual(resourceMetrics, undefined);

  const { resource, scopeMetrics } = resourceMetrics!;

  const { scope, metrics } = scopeMetrics[0];

  assert.ok(!resource.asyncAttributesPending);
  assert.deepStrictEqual(resource.attributes, testResource.attributes);
  assert.deepStrictEqual(scope, defaultInstrumentationScope);

  const metric = metrics[0];

  assertMetricData(metric, expected.dataPointType, expected.descriptor ?? null);

  if (expected.dataPoints == null) {
    return;
  }
  assert.strictEqual(metric.dataPoints.length, expected.dataPoints.length);

  for (let idx = 0; idx < metric.dataPoints.length; idx++) {
    const expectedDataPoint = expected.dataPoints[idx];
    assertDataPoint(
      metric.dataPoints[idx],
      expectedDataPoint.attributes ?? {},
      expectedDataPoint.value as any,
      expectedDataPoint.startTime,
      expectedDataPoint.endTime
    );
  }
}

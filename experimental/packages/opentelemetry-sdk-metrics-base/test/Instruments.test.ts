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
import { Resource } from '@opentelemetry/resources';
import {
  AggregationTemporality,
  InstrumentDescriptor,
  InstrumentType,
  MeterProvider,
  MetricReader,
  DataPoint,
  DataPointType
} from '../src';
import { TestMetricReader } from './export/TestMetricReader';
import {
  assertMetricData,
  assertDataPoint,
  commonValues,
  commonAttributes,
  defaultResource,
  defaultInstrumentationScope
} from './util';
import { Histogram } from '../src/aggregator/types';
import { ObservableResult, ValueType } from '@opentelemetry/api-metrics';

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
        },
      });
    });

    it('should add valid INT values', async () => {
      const { meter, cumulativeReader } = setup();
      const counter = meter.createCounter('test', {
        valueType: ValueType.INT,
      });

      counter.add(1);
      // floating-point value should be trunc-ed.
      counter.add(1.1);
      counter.add(1, { foo: 'bar' });
      await validateExport(cumulativeReader, {
        descriptor: {
          name: 'test',
          description: '',
          unit: '',
          type: InstrumentType.COUNTER,
          valueType: ValueType.INT,
        },
        dataPointType: DataPointType.SINGULAR,
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
        dataPointType: DataPointType.SINGULAR,
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
      // add floating-point value.
      counter.add(1.1);
      counter.add(1, { foo: 'bar' });
      counter.add(1.2, { foo: 'bar' });
      await validateExport(cumulativeReader, {
        dataPointType: DataPointType.SINGULAR,
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
        dataPointType: DataPointType.SINGULAR,
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
      await validateExport(deltaReader, {
        descriptor: {
          name: 'test',
          description: '',
          unit: '',
          type: InstrumentType.UP_DOWN_COUNTER,
          valueType: ValueType.INT,
        },
        dataPointType: DataPointType.SINGULAR,
        dataPoints: [
          {
            attributes: {},
            value: 2,
          },
          {
            attributes: { foo: 'bar' },
            value: 5,
          }
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
      await validateExport(deltaReader, {
        dataPointType: DataPointType.SINGULAR,
        dataPoints: [
          {
            attributes: {},
            value: 1.9,
          },
          {
            attributes: { foo: 'bar' },
            value: 5.1,
          }
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
      await validateExport(deltaReader, {
        descriptor: {
          name: 'test',
          description: '',
          unit: '',
          type: InstrumentType.HISTOGRAM,
          valueType: ValueType.INT,
        },
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: [
          {
            attributes: {},
            value: {
              buckets: {
                boundaries: [0, 5, 10, 25, 50, 75, 100, 250, 500, 1000],
                counts: [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
              },
              count: 2,
              sum: 10,
              hasMinMax: true,
              max: 10,
              min: 0
            },
          },
          {
            attributes: { foo: 'bar' },
            value: {
              buckets: {
                boundaries: [0, 5, 10, 25, 50, 75, 100, 250, 500, 1000],
                counts: [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
              },
              count: 2,
              sum: 100,
              hasMinMax: true,
              max: 100,
              min: 0
            },
          },
        ],
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
        },
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: [
          {
            attributes: {},
            value: {
              buckets: {
                boundaries: [0, 5, 10, 25, 50, 75, 100, 250, 500, 1000],
                counts: [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
              },
              count: 2,
              sum: 110,
              hasMinMax: true,
              min: 20,
              max: 90
            },
          }
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
        },
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: [
          {
            attributes: {},
            value: {
              buckets: {
                boundaries: [0, 5, 10, 25, 50, 75, 100, 250, 500, 1000],
                counts: [0, 0, 0, 2, 0, 0, 1, 1, 0, 0, 0],
              },
              count: 4,
              sum: 220,
              hasMinMax: true,
              min: 10,
              max: 100
            },
          }
        ],
      });
    });

    it('should not record negative INT values', async () => {
      const { meter, deltaReader } = setup();
      const histogram = meter.createHistogram('test', {
        valueType: ValueType.DOUBLE,
      });

      histogram.record(-1, { foo: 'bar' });
      await validateExport(deltaReader, {
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: [],
      });
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
      await validateExport(deltaReader, {
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: [
          {
            attributes: {},
            value: {
              buckets: {
                boundaries: [0, 5, 10, 25, 50, 75, 100, 250, 500, 1000],
                counts: [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
              },
              count: 2,
              sum: 10.1,
              hasMinMax: true,
              max: 10,
              min: 0.1
            },
          },
          {
            attributes: { foo: 'bar' },
            value: {
              buckets: {
                boundaries: [0, 5, 10, 25, 50, 75, 100, 250, 500, 1000],
                counts: [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
              },
              count: 2,
              sum: 100.1,
              hasMinMax: true,
              max: 100,
              min: 0.1
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
      await validateExport(deltaReader, {
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: [],
      });
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
        dataPointType: DataPointType.SINGULAR,
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
        dataPointType: DataPointType.SINGULAR,
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
      const observableUpDownCounter = meter.createObservableUpDownCounter('test');
      observableUpDownCounter.addCallback(callback);

      await deltaReader.collect();
      assert.strictEqual(callback.callCount, 1);
    });

    it('should observe values', async () => {
      const { meter, cumulativeReader } = setup();
      let callCount = 0;
      const observableUpDownCounter = meter.createObservableUpDownCounter('test');
      observableUpDownCounter.addCallback(observableResult => {
        observableResult.observe(++callCount);
        observableResult.observe(1, { foo: 'bar' });
      });

      await validateExport(cumulativeReader, {
        dataPointType: DataPointType.SINGULAR,
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
        dataPointType: DataPointType.SINGULAR,
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
        dataPointType: DataPointType.SINGULAR,
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
        dataPointType: DataPointType.SINGULAR,
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
        dataPointType: DataPointType.SINGULAR,
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
});

function setup() {
  const meterProvider = new MeterProvider({ resource: defaultResource });
  const meter = meterProvider.getMeter(defaultInstrumentationScope.name, defaultInstrumentationScope.version, {
    schemaUrl: defaultInstrumentationScope.schemaUrl,
  });
  const deltaReader = new TestMetricReader(() => AggregationTemporality.DELTA);
  meterProvider.addMetricReader(deltaReader);
  const cumulativeReader = new TestMetricReader(() => AggregationTemporality.CUMULATIVE);
  meterProvider.addMetricReader(cumulativeReader);

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
  dataPointType?: DataPointType,
  dataPoints?: Partial<DataPoint<number | Partial<Histogram>>>[];
}

async function validateExport(reader: MetricReader, expected: ValidateMetricData) {
  const { resourceMetrics, errors } = await reader.collect();

  assert.strictEqual(errors.length, 0);
  assert.notStrictEqual(resourceMetrics, undefined);

  const { resource, scopeMetrics } = resourceMetrics!;

  const { scope, metrics } = scopeMetrics[0];

  assert.deepStrictEqual(resource, defaultResource);
  assert.deepStrictEqual(scope, defaultInstrumentationScope);

  const metric = metrics[0];

  assertMetricData(
    metric,
    expected.dataPointType,
    expected.descriptor ?? null,
  );

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

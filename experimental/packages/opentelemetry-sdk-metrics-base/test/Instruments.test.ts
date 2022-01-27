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
import { InstrumentationLibrary } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { AggregationTemporality, InstrumentDescriptor, MeterProvider, MetricReader, PointData, PointDataType } from '../src';
import { TestMetricReader } from './export/TestMetricReader';
import { assertMetricData, assertPointData, commonValues, commonAttributes, defaultResource, defaultInstrumentationLibrary } from './util';
import { Histogram } from '../src/aggregator/types';
import { ObservableResult } from '@opentelemetry/api-metrics-wip';

describe('Instruments', () => {
  describe('Counter', () => {
    it('should add common values and attributes', () => {
      const { meter } = setup();
      const counter = meter.createCounter('test');

      for (const values of commonValues) {
        for (const attributes of commonAttributes) {
          counter.add(values, attributes);
        }
      }
    });

    it('should add valid values', async () => {
      const { meter, cumulativeReader } = setup();
      const counter = meter.createCounter('test');

      counter.add(1);
      counter.add(1);
      await validateExport(cumulativeReader, {
        pointDataType: PointDataType.SINGULAR,
        pointData: [
          {
            point: 2,
          },
        ],
      });

      // add negative values should not be observable.
      counter.add(-1);
      await validateExport(cumulativeReader, {
        pointDataType: PointDataType.SINGULAR,
        pointData: [
          {
            point: 2,
          },
        ],
      });
    });
  });

  describe('UpDownCounter', () => {
    it('should add common values and attributes', () => {
      const { meter } = setup();
      const upDownCounter = meter.createUpDownCounter('test');

      for (const values of commonValues) {
        for (const attributes of commonAttributes) {
          upDownCounter.add(values, attributes);
        }
      }
    });

    it('should add values', async () => {
      const { meter, deltaReader } = setup();
      const upDownCounter = meter.createUpDownCounter('test');

      upDownCounter.add(3);
      upDownCounter.add(-1);
      await validateExport(deltaReader, {
        pointDataType: PointDataType.SINGULAR,
        pointData: [
          {
            point: 2,
          },
        ],
      });
    });
  });

  describe('Histogram', () => {
    it('should record common values and attributes', () => {
      const { meter } = setup();
      const histogram = meter.createHistogram('test');

      for (const values of commonValues) {
        for (const attributes of commonAttributes) {

          histogram.record(values, attributes);
        }
      }
    });

    it('should record values', async () => {
      const { meter, deltaReader } = setup();
      const histogram = meter.createHistogram('test');

      histogram.record(10);
      histogram.record(-1);
      await validateExport(deltaReader, {
        pointDataType: PointDataType.HISTOGRAM,
        pointData: [
          {
            point: {
              buckets: {
                boundaries: [0, 5, 10, 25, 50, 75, 100, 250, 500, 1000],
                counts: [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
              },
              count: 2,
              sum: 9,
            },
          },
        ],
      });
    });
  });

  describe('ObservableCounter', () => {
    it('should observe common values and attributes', async () => {
      const { meter, deltaReader } = setup();
      const callback = sinon.spy((observableResult: ObservableResult) => {
        for (const values of commonValues) {
          for (const attributes of commonAttributes) {
            observableResult.observe(values, attributes);
          }
        }
      });
      meter.createObservableCounter('test', callback);

      await deltaReader.collect();
      assert.strictEqual(callback.callCount, 1);
    });

    it('should observe values', async () => {
      const { meter, cumulativeReader } = setup();
      let callCount = 0;
      meter.createObservableCounter('test', observableResult => {
        observableResult.observe(++callCount);
      });

      await validateExport(cumulativeReader, {
        pointDataType: PointDataType.SINGULAR,
        pointData: [
          {
            point: 1,
          },
        ],
      });
      await validateExport(cumulativeReader, {
        pointDataType: PointDataType.SINGULAR,
        pointData: [
          {
            point: 2,
          },
        ],
      });
    });
  });

  describe('ObservableUpDownCounter', () => {
    it('should observe common values and attributes', async () => {
      const { meter, deltaReader } = setup();
      const callback = sinon.spy((observableResult: ObservableResult) => {
        for (const values of commonValues) {
          for (const attributes of commonAttributes) {
            observableResult.observe(values, attributes);
          }
        }
      });
      meter.createObservableUpDownCounter('test', callback);

      await deltaReader.collect();
      assert.strictEqual(callback.callCount, 1);
    });

    it('should observe values', async () => {
      const { meter, cumulativeReader } = setup();
      let callCount = 0;
      meter.createObservableUpDownCounter('test', observableResult => {
        observableResult.observe(++callCount);
      });

      await validateExport(cumulativeReader, {
        pointDataType: PointDataType.SINGULAR,
        pointData: [
          {
            point: 1,
          },
        ],
      });
      await validateExport(cumulativeReader, {
        pointDataType: PointDataType.SINGULAR,
        pointData: [
          {
            point: 2,
          },
        ],
      });
    });
  });

  describe('ObservableGauge', () => {
    it('should observe common values and attributes', async () => {
      const { meter, deltaReader } = setup();
      const callback = sinon.spy((observableResult: ObservableResult) => {
        for (const values of commonValues) {
          for (const attributes of commonAttributes) {
            observableResult.observe(values, attributes);
          }
        }
      });
      meter.createObservableGauge('test', callback);

      await deltaReader.collect();
      assert.strictEqual(callback.callCount, 1);
    });

    it('should observe values', async () => {
      const { meter, cumulativeReader } = setup();
      let num = 0;
      meter.createObservableGauge('test', observableResult => {
        num += 10;
        if (num === 30) {
          observableResult.observe(-1);
        } else {
          observableResult.observe(num);
        }
      });

      await validateExport(cumulativeReader, {
        pointDataType: PointDataType.SINGULAR,
        pointData: [
          {
            point: 10,
          },
        ],
      });
      await validateExport(cumulativeReader, {
        pointDataType: PointDataType.SINGULAR,
        pointData: [
          {
            point: 20,
          },
        ],
      });
      await validateExport(cumulativeReader, {
        pointDataType: PointDataType.SINGULAR,
        pointData: [
          {
            point: -1,
          },
        ],
      });
    });
  });
});

function setup() {
  const meterProvider = new MeterProvider({ resource: defaultResource });
  const meter = meterProvider.getMeter(defaultInstrumentationLibrary.name, defaultInstrumentationLibrary.version, {
    schemaUrl: defaultInstrumentationLibrary.schemaUrl,
  });
  const deltaReader = new TestMetricReader(AggregationTemporality.DELTA);
  meterProvider.addMetricReader(deltaReader);
  const cumulativeReader = new TestMetricReader(AggregationTemporality.CUMULATIVE);
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
  instrumentationLibrary?: InstrumentationLibrary;
  instrumentDescriptor?: InstrumentDescriptor;
  pointDataType: PointDataType,
  pointData: Partial<PointData<number | Partial<Histogram>>>[];
}

async function validateExport(deltaReader: MetricReader, expected: ValidateMetricData) {
  const metricData = await deltaReader.collect();
  const metric = metricData[0];

  assertMetricData(
    metric,
    expected.pointDataType,
    expected.instrumentDescriptor ?? null,
    expected.instrumentationLibrary,
    expected.resource
  );
  assert.strictEqual(metric.pointData.length, expected.pointData.length);

  for (let idx = 0; idx < metric.pointData.length; idx++) {
    const expectedPointData = expected.pointData[idx];
    assertPointData(
      metric.pointData[idx],
      expectedPointData.attributes ?? {},
      expectedPointData.point as any,
      expectedPointData.startTime,
      expectedPointData.endTime
    );
  }
}

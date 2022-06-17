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
import { MetricAttributes, UpDownCounter } from '@opentelemetry/api-metrics';
import {
  AggregationTemporality,
  MeterProvider,
  MetricReader,
  DataPoint,
  DataPointType,
  ExplicitBucketHistogramAggregation,
  SumAggregation,
  Histogram,
} from '@opentelemetry/sdk-metrics-base';
import * as sinon from 'sinon';
import { PrometheusSerializer } from '../src';
import { mockedHrTimeMs, mockHrTime } from './util';

const attributes = {
  foo1: 'bar1',
  foo2: 'bar2',
};

class TestMetricReader extends MetricReader {
  constructor() {
    super();
  }

  selectAggregationTemporality() {
    return AggregationTemporality.CUMULATIVE;
  }

  async onForceFlush() {}
  async onShutdown() {}
}

describe('PrometheusSerializer', () => {
  beforeEach(() => {
    mockHrTime();
  });
  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should construct a serializer', () => {
      const serializer = new PrometheusSerializer();
      assert(serializer instanceof PrometheusSerializer);
    });
  });

  describe('serializePointData', () => {
    describe('Singular', () => {
      async function testSerializer(serializer: PrometheusSerializer) {
        const reader = new TestMetricReader();
        const meterProvider = new MeterProvider();
        meterProvider.addMetricReader(reader);
        meterProvider.addView({
          aggregation: new SumAggregation(),
        });
        const meter = meterProvider.getMeter('test');

        const counter = meter.createCounter('test_total');
        counter.add(1, attributes);

        const { resourceMetrics, errors } = await reader.collect();
        assert.strictEqual(errors.length, 0);
        assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
        assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);
        const metric = resourceMetrics.scopeMetrics[0].metrics[0];
        assert.strictEqual(metric.dataPointType, DataPointType.SINGULAR);
        const pointData = metric.dataPoints as DataPoint<number>[];
        assert.strictEqual(pointData.length, 1);

        const result = serializer['_serializeSingularDataPoint'](metric.descriptor.name, metric.descriptor.type, pointData[0]);
        return result;
      }

      it('should serialize metrics with singular data type', async () => {
        const serializer = new PrometheusSerializer();
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          `test_total{foo1="bar1",foo2="bar2"} 1 ${mockedHrTimeMs}\n`
        );
      });

      it('should serialize metrics with singular data type without timestamp', async () => {
        const serializer = new PrometheusSerializer(undefined, false);
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          'test_total{foo1="bar1",foo2="bar2"} 1\n'
        );
      });
    });

    describe('Histogram', () => {
      async function testSerializer(serializer: PrometheusSerializer) {
        const reader = new TestMetricReader();
        const meterProvider = new MeterProvider();
        meterProvider.addMetricReader(reader);
        meterProvider.addView({ aggregation: new ExplicitBucketHistogramAggregation([1, 10, 100]) });
        const meter = meterProvider.getMeter('test');

        const histogram = meter.createHistogram('test');
        histogram.record(5, attributes);

        const { resourceMetrics, errors } = await reader.collect();
        assert.strictEqual(errors.length, 0);
        assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
        assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);
        const metric = resourceMetrics.scopeMetrics[0].metrics[0];
        assert.strictEqual(metric.dataPointType, DataPointType.HISTOGRAM);
        const pointData = metric.dataPoints as DataPoint<Histogram>[];
        assert.strictEqual(pointData.length, 1);

        const result = serializer['_serializeHistogramDataPoint'](metric.descriptor.name, metric.descriptor.type, pointData[0]);
        return result;
      }

      it('should serialize metrics with histogram data type', async () => {
        const serializer = new PrometheusSerializer();
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          `test_count{foo1="bar1",foo2="bar2"} 1 ${mockedHrTimeMs}\n` +
            `test_sum{foo1="bar1",foo2="bar2"} 5 ${mockedHrTimeMs}\n` +
            `test_bucket{foo1="bar1",foo2="bar2",le="1"} 0 ${mockedHrTimeMs}\n` +
            `test_bucket{foo1="bar1",foo2="bar2",le="10"} 1 ${mockedHrTimeMs}\n` +
            `test_bucket{foo1="bar1",foo2="bar2",le="100"} 1 ${mockedHrTimeMs}\n` +
            `test_bucket{foo1="bar1",foo2="bar2",le="+Inf"} 1 ${mockedHrTimeMs}\n`
        );
      });

      it('serialize metric record with sum aggregator without timestamp', async () => {
        const serializer = new PrometheusSerializer(undefined, false);
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          'test_count{foo1="bar1",foo2="bar2"} 1\n' +
            'test_sum{foo1="bar1",foo2="bar2"} 5\n' +
            'test_bucket{foo1="bar1",foo2="bar2",le="1"} 0\n' +
            'test_bucket{foo1="bar1",foo2="bar2",le="10"} 1\n' +
            'test_bucket{foo1="bar1",foo2="bar2",le="100"} 1\n' +
            'test_bucket{foo1="bar1",foo2="bar2",le="+Inf"} 1\n'
        );
      });
    });
  });

  describe('serialize an instrumentation metrics', () => {
    describe('Singular', () => {
      async function testSerializer(serializer: PrometheusSerializer) {
        const reader = new TestMetricReader();
        const meterProvider = new MeterProvider();
        meterProvider.addMetricReader(reader);
        meterProvider.addView({ aggregation: new SumAggregation() });
        const meter = meterProvider.getMeter('test');

        const counter = meter.createCounter('test_total', {
          description: 'foobar',
        });
        counter.add(1, { val: '1' });
        counter.add(1, { val: '2' });

        const { resourceMetrics, errors } = await reader.collect();
        assert.strictEqual(errors.length, 0);
        assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
        assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);
        const scopeMetrics = resourceMetrics.scopeMetrics[0];

        const result = serializer['_serializeScopeMetrics'](scopeMetrics);
        return result;
      }

      it('should serialize metric record with sum aggregator', async () => {
        const serializer = new PrometheusSerializer();
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          '# HELP test_total foobar\n' +
            '# TYPE test_total counter\n' +
            `test_total{val="1"} 1 ${mockedHrTimeMs}\n` +
            `test_total{val="2"} 1 ${mockedHrTimeMs}\n`
        );
      });

      it('serialize metric record with sum aggregator without timestamp', async () => {
        const serializer = new PrometheusSerializer(undefined, false);
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          '# HELP test_total foobar\n' +
            '# TYPE test_total counter\n' +
            'test_total{val="1"} 1\n' +
            'test_total{val="2"} 1\n'
        );
      });
    });

    describe('with ExplicitBucketHistogramAggregation', () => {
      async function testSerializer(serializer: PrometheusSerializer) {
        const reader = new TestMetricReader();
        const meterProvider = new MeterProvider();
        meterProvider.addMetricReader(reader);
        meterProvider.addView({ aggregation: new ExplicitBucketHistogramAggregation([1, 10, 100]) });
        const meter = meterProvider.getMeter('test');

        const histogram = meter.createHistogram('test', {
          description: 'foobar',
        });
        histogram.record(5, { val: '1' });
        histogram.record(50, { val: '1' });
        histogram.record(120, { val: '1' });

        histogram.record(5, { val: '2' });

        const { resourceMetrics, errors } = await reader.collect();
        assert.strictEqual(errors.length, 0);
        assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
        assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);
        const scopeMetrics = resourceMetrics.scopeMetrics[0];

        const result = serializer['_serializeScopeMetrics'](scopeMetrics);
        return result;
      }

      it('serialize metric record with ExplicitHistogramAggregation aggregator, cumulative', async () => {
        const serializer = new PrometheusSerializer();
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          '# HELP test foobar\n' +
            '# TYPE test histogram\n' +
            `test_count{val="1"} 3 ${mockedHrTimeMs}\n` +
            `test_sum{val="1"} 175 ${mockedHrTimeMs}\n` +
            `test_bucket{val="1",le="1"} 0 ${mockedHrTimeMs}\n` +
            `test_bucket{val="1",le="10"} 1 ${mockedHrTimeMs}\n` +
            `test_bucket{val="1",le="100"} 2 ${mockedHrTimeMs}\n` +
            `test_bucket{val="1",le="+Inf"} 3 ${mockedHrTimeMs}\n` +
            `test_count{val="2"} 1 ${mockedHrTimeMs}\n` +
            `test_sum{val="2"} 5 ${mockedHrTimeMs}\n` +
            `test_bucket{val="2",le="1"} 0 ${mockedHrTimeMs}\n` +
            `test_bucket{val="2",le="10"} 1 ${mockedHrTimeMs}\n` +
            `test_bucket{val="2",le="100"} 1 ${mockedHrTimeMs}\n` +
            `test_bucket{val="2",le="+Inf"} 1 ${mockedHrTimeMs}\n`
        );
      });
    });
  });

  describe('validate against metric conventions', () => {
    async function getCounterResult(name: string, serializer: PrometheusSerializer) {
      const reader = new TestMetricReader();
      const meterProvider = new MeterProvider();
      meterProvider.addMetricReader(reader);
      meterProvider.addView({ aggregation: new SumAggregation() });
      const meter = meterProvider.getMeter('test');

      const counter = meter.createCounter(name);
      counter.add(1);

      const { resourceMetrics, errors } = await reader.collect();
      assert.strictEqual(errors.length, 0);
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);
      const metric = resourceMetrics.scopeMetrics[0].metrics[0];
      assert.strictEqual(metric.dataPointType, DataPointType.SINGULAR);
      const pointData = metric.dataPoints as DataPoint<number>[];
      assert.strictEqual(pointData.length, 1);

      const result = serializer['_serializeSingularDataPoint'](metric.descriptor.name, metric.descriptor.type, pointData[0]);
      return result;
    }

    it('should rename metric of type counter when name misses _total suffix', async () => {
      const serializer = new PrometheusSerializer();

      const result = await getCounterResult('test', serializer);
      assert.strictEqual(result, `test_total 1 ${mockedHrTimeMs}\n`);
    });

    it('should not rename metric of type counter when name contains _total suffix', async () => {
      const serializer = new PrometheusSerializer();
      const result = await getCounterResult('test_total', serializer);

      assert.strictEqual(result, `test_total 1 ${mockedHrTimeMs}\n`);
    });
  });

  describe('serialize non-normalized values', () => {
    async function testSerializer(serializer: PrometheusSerializer, name: string, fn: (counter: UpDownCounter) => void) {
      const reader = new TestMetricReader();
      const meterProvider = new MeterProvider();
      meterProvider.addMetricReader(reader);
      meterProvider.addView({ aggregation: new SumAggregation() });
      const meter = meterProvider.getMeter('test');

      const counter = meter.createUpDownCounter(name);
      fn(counter);

      const { resourceMetrics, errors } = await reader.collect();
      assert.strictEqual(errors.length, 0);
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);
      const metric = resourceMetrics.scopeMetrics[0].metrics[0];
      assert.strictEqual(metric.dataPointType, DataPointType.SINGULAR);
      const pointData = metric.dataPoints as DataPoint<number>[];
      assert.strictEqual(pointData.length, 1);

      const result = serializer['_serializeSingularDataPoint'](metric.descriptor.name, metric.descriptor.type, pointData[0]);
      return result;
    }

    it('should serialize records without attributes', async () => {
      const serializer = new PrometheusSerializer();

      const result = await testSerializer(serializer, 'test_total', counter => {
        counter.add(1);
      });

      assert.strictEqual(result, `test_total 1 ${mockedHrTimeMs}\n`);
    });

    it('should serialize non-string attribute values', async () => {
      const serializer = new PrometheusSerializer();

      const result = await testSerializer(serializer, 'test_total', counter => {
        counter.add(1, ({
          object: {},
          NaN: NaN,
          null: null,
          undefined: undefined,
        } as unknown) as MetricAttributes);
      });

      assert.strictEqual(
        result,
        `test_total{object="[object Object]",NaN="NaN",null="null",undefined="undefined"} 1 ${mockedHrTimeMs}\n`
      );
    });

    it('should serialize non-finite values', async () => {
      const serializer = new PrometheusSerializer();
      const cases = [
        [NaN, 'Nan'],
        [-Infinity, '-Inf'],
        [+Infinity, '+Inf'],
      ] as [number, string][];

      for (const esac of cases) {
        const result = await testSerializer(serializer, 'test', counter => {
          counter.add(esac[0], attributes);
        });

        assert.strictEqual(
          result,
          `test{foo1="bar1",foo2="bar2"} ${esac[1]} ${mockedHrTimeMs}\n`
        );
      }
    });

    it('should escape backslash (\\), double-quote ("), and line feed (\\n) in attribute values', async () => {
      const serializer = new PrometheusSerializer();

      const result = await testSerializer(serializer, 'test_total', counter => {
        counter.add(1, ({
          backslash: '\u005c', // \ => \\ (\u005c\u005c)
          doubleQuote: '\u0022', // " => \" (\u005c\u0022)
          lineFeed: '\u000a', // ↵ => \n (\u005c\u006e)
          backslashN: '\u005c\u006e', // \n => \\n (\u005c\u005c\u006e)
          backslashDoubleQuote: '\u005c\u0022', // \" => \\\" (\u005c\u005c\u005c\u0022)
          backslashLineFeed: '\u005c\u000a', // \↵ => \\\n (\u005c\u005c\u005c\u006e)
        } as unknown) as MetricAttributes);
      });

      assert.strictEqual(
        result,
        'test_total{' +
          'backslash="\u005c\u005c",' +
          'doubleQuote="\u005c\u0022",' +
          'lineFeed="\u005c\u006e",' +
          'backslashN="\u005c\u005c\u006e",' +
          'backslashDoubleQuote="\u005c\u005c\u005c\u0022",' +
          'backslashLineFeed="\u005c\u005c\u005c\u006e"' +
          `} 1 ${mockedHrTimeMs}\n`
      );
    });

    it('should sanitize attribute names', async () => {
      const serializer = new PrometheusSerializer();

      const result = await testSerializer(serializer, 'test_total', counter => {
        // if you try to use a attribute name like account-id prometheus will complain
        // with an error like:
        // error while linting: text format parsing error in line 282: expected '=' after label name, found '-'
        counter.add(1, ({
          'account-id': '123456',
        } as unknown) as MetricAttributes);
      });

      assert.strictEqual(
        result,
        `test_total{account_id="123456"} 1 ${mockedHrTimeMs}\n`
      );
    });
  });
});

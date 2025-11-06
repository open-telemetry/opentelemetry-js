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
import { Attributes, UpDownCounter } from '@opentelemetry/api';
import {
  AggregationTemporality,
  DataPoint,
  DataPointType,
  Histogram,
  MeterProvider,
  MetricReader,
} from '@opentelemetry/sdk-metrics';
import * as sinon from 'sinon';
import { PrometheusSerializer } from '../src';
import {
  mockedHrTimeMs,
  mockHrTime,
  sdkLanguage,
  sdkName,
  sdkVersion,
  serviceName,
} from './util';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { AggregationType } from '@opentelemetry/sdk-metrics';

const attributes = {
  foo1: 'bar1',
  foo2: 'bar2',
};

const resourceAttributes = `service_name="${serviceName}",telemetry_sdk_language="${sdkLanguage}",telemetry_sdk_name="${sdkName}",telemetry_sdk_version="${sdkVersion}"`;

const serializedDefaultResource =
  '# HELP target_info Target metadata\n' +
  '# TYPE target_info gauge\n' +
  `target_info{${resourceAttributes}} 1\n`;

class TestMetricReader extends MetricReader {
  constructor() {
    super({
      aggregationTemporalitySelector: _instrumentType =>
        AggregationTemporality.CUMULATIVE,
      aggregationSelector: _instrumentType => {
        return { type: AggregationType.DEFAULT };
      },
    });
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
      assert.ok(serializer instanceof PrometheusSerializer);
    });
  });

  describe('serializePointData', () => {
    describe('Singular', () => {
      async function testSerializer(serializer: PrometheusSerializer) {
        const reader = new TestMetricReader();
        const meterProvider = new MeterProvider({
          views: [
            {
              aggregation: { type: AggregationType.SUM },
              instrumentName: '*',
            },
          ],
          readers: [reader],
        });
        const meter = meterProvider.getMeter('test');

        const counter = meter.createCounter('test_total');
        counter.add(1, attributes);

        const { resourceMetrics, errors } = await reader.collect();
        assert.strictEqual(errors.length, 0);
        assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
        assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);
        const metric = resourceMetrics.scopeMetrics[0].metrics[0];
        assert.strictEqual(metric.dataPointType, DataPointType.SUM);
        const pointData = metric.dataPoints as DataPoint<number>[];
        assert.strictEqual(pointData.length, 1);
        const resourceAttributes = resourceMetrics.resource.attributes;
        serializer['_additionalAttributes'] = serializer[
          '_filterResourceConstantLabels'
        ](resourceAttributes, serializer['_withResourceConstantLabels']);

        const result = serializer['_serializeSingularDataPoint'](
          metric.descriptor.name,
          metric,
          pointData[0],
          serializer['_additionalAttributes']
        );
        return result;
      }

      it('should serialize metrics with singular data type', async () => {
        const serializer = new PrometheusSerializer();
        const result = await testSerializer(serializer);
        assert.strictEqual(result, 'test_total{foo1="bar1",foo2="bar2"} 1\n');
      });

      it('should serialize metrics with singular data type with timestamp', async () => {
        const serializer = new PrometheusSerializer(undefined, true);
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          `test_total{foo1="bar1",foo2="bar2"} 1 ${mockedHrTimeMs}\n`
        );
      });
    });

    describe('Histogram', () => {
      async function testSerializer(serializer: PrometheusSerializer) {
        const reader = new TestMetricReader();
        const meterProvider = new MeterProvider({
          views: [
            {
              aggregation: {
                type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
                options: {
                  boundaries: [1, 10, 100],
                },
              },
              instrumentName: '*',
            },
          ],
          readers: [reader],
        });
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
        const resourceAttributes = resourceMetrics.resource.attributes;
        serializer['_additionalAttributes'] = serializer[
          '_filterResourceConstantLabels'
        ](resourceAttributes, serializer['_withResourceConstantLabels']);

        const result = serializer['_serializeHistogramDataPoint'](
          metric.descriptor.name,
          metric,
          pointData[0],
          serializer['_additionalAttributes']
        );
        return result;
      }

      it('should serialize metrics with histogram data type', async () => {
        const serializer = new PrometheusSerializer();
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

      it('serialize metric record with sum aggregator with timestamp', async () => {
        const serializer = new PrometheusSerializer(undefined, true);
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

      it('serialize metric record with sum aggregator with timestamp and all resource attributes', async () => {
        const serializer = new PrometheusSerializer(undefined, true, /.*/);
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          `test_count{foo1="bar1",foo2="bar2",${resourceAttributes}} 1 ${mockedHrTimeMs}\n` +
            `test_sum{foo1="bar1",foo2="bar2",${resourceAttributes}} 5 ${mockedHrTimeMs}\n` +
            `test_bucket{foo1="bar1",foo2="bar2",${resourceAttributes},le="1"} 0 ${mockedHrTimeMs}\n` +
            `test_bucket{foo1="bar1",foo2="bar2",${resourceAttributes},le="10"} 1 ${mockedHrTimeMs}\n` +
            `test_bucket{foo1="bar1",foo2="bar2",${resourceAttributes},le="100"} 1 ${mockedHrTimeMs}\n` +
            `test_bucket{foo1="bar1",foo2="bar2",${resourceAttributes},le="+Inf"} 1 ${mockedHrTimeMs}\n`
        );
      });
    });
  });

  describe('serialize an instrumentation metrics', () => {
    describe('monotonic Sum', () => {
      async function testSerializer(serializer: PrometheusSerializer) {
        const reader = new TestMetricReader();
        const meterProvider = new MeterProvider({
          views: [
            {
              aggregation: { type: AggregationType.SUM },
              instrumentName: '*',
            },
          ],
          readers: [reader],
        });
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
        const resourceAttributes = resourceMetrics.resource.attributes;
        serializer['_additionalAttributes'] = serializer[
          '_filterResourceConstantLabels'
        ](resourceAttributes, serializer['_withResourceConstantLabels']);

        const result = serializer['_serializeScopeMetrics'](scopeMetrics);
        return result;
      }

      it('should serialize metric record', async () => {
        const serializer = new PrometheusSerializer();
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          '# HELP test_total foobar\n' +
            '# TYPE test_total counter\n' +
            'test_total{val="1",otel_scope_name="test"} 1\n' +
            'test_total{val="2",otel_scope_name="test"} 1\n'
        );
      });

      it('should serialize metric record with timestamp', async () => {
        const serializer = new PrometheusSerializer(undefined, true);
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          '# HELP test_total foobar\n' +
            '# TYPE test_total counter\n' +
            `test_total{val="1",otel_scope_name="test"} 1 ${mockedHrTimeMs}\n` +
            `test_total{val="2",otel_scope_name="test"} 1 ${mockedHrTimeMs}\n`
        );
      });

      it('should serialize metric record with timestamp and all resource attributes', async () => {
        const serializer = new PrometheusSerializer(undefined, true, /.*/);
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          '# HELP test_total foobar\n' +
            '# TYPE test_total counter\n' +
            `test_total{val="1",otel_scope_name="test",${resourceAttributes}} 1 ${mockedHrTimeMs}\n` +
            `test_total{val="2",otel_scope_name="test",${resourceAttributes}} 1 ${mockedHrTimeMs}\n`
        );
      });
    });

    describe('non-monotonic Sum', () => {
      async function testSerializer(serializer: PrometheusSerializer) {
        const reader = new TestMetricReader();
        const meterProvider = new MeterProvider({
          views: [
            {
              aggregation: { type: AggregationType.SUM },
              instrumentName: '*',
            },
          ],
          readers: [reader],
        });
        const meter = meterProvider.getMeter('test');

        const counter = meter.createUpDownCounter('test_total', {
          description: 'foobar',
        });
        counter.add(1, { val: '1' });
        counter.add(1, { val: '2' });

        const { resourceMetrics, errors } = await reader.collect();
        assert.strictEqual(errors.length, 0);
        assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
        assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);
        const scopeMetrics = resourceMetrics.scopeMetrics[0];
        const resourceAttributes = resourceMetrics.resource.attributes;
        serializer['_additionalAttributes'] = serializer[
          '_filterResourceConstantLabels'
        ](resourceAttributes, serializer['_withResourceConstantLabels']);

        return serializer['_serializeScopeMetrics'](scopeMetrics);
      }

      it('should serialize metric record', async () => {
        const serializer = new PrometheusSerializer();
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          '# HELP test_total foobar\n' +
            '# TYPE test_total gauge\n' +
            'test_total{val="1",otel_scope_name="test"} 1\n' +
            'test_total{val="2",otel_scope_name="test"} 1\n'
        );
      });

      it('serialize metric record with timestamp', async () => {
        const serializer = new PrometheusSerializer(undefined, true);
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          '# HELP test_total foobar\n' +
            '# TYPE test_total gauge\n' +
            `test_total{val="1",otel_scope_name="test"} 1 ${mockedHrTimeMs}\n` +
            `test_total{val="2",otel_scope_name="test"} 1 ${mockedHrTimeMs}\n`
        );
      });

      it('serialize metric record with timestamp and all resource attributes', async () => {
        const serializer = new PrometheusSerializer(undefined, true, /.*/);

        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          '# HELP test_total foobar\n' +
            '# TYPE test_total gauge\n' +
            `test_total{val="1",otel_scope_name="test",${resourceAttributes}} 1 ${mockedHrTimeMs}\n` +
            `test_total{val="2",otel_scope_name="test",${resourceAttributes}} 1 ${mockedHrTimeMs}\n`
        );
      });
    });

    describe('Gauge', () => {
      async function testSerializer(serializer: PrometheusSerializer) {
        const reader = new TestMetricReader();
        const meterProvider = new MeterProvider({
          views: [
            {
              aggregation: {
                type: AggregationType.LAST_VALUE,
              },
              instrumentName: '*',
            },
          ],
          readers: [reader],
        });
        const meter = meterProvider.getMeter('test');

        const counter = meter.createUpDownCounter('test_total', {
          description: 'foobar',
        });
        counter.add(1, { val: '1' });
        counter.add(1, { val: '2' });

        const { resourceMetrics, errors } = await reader.collect();
        assert.strictEqual(errors.length, 0);
        assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
        assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);
        const scopeMetrics = resourceMetrics.scopeMetrics[0];
        const resourceAttributes = resourceMetrics.resource.attributes;
        serializer['_additionalAttributes'] = serializer[
          '_filterResourceConstantLabels'
        ](resourceAttributes, serializer['_withResourceConstantLabels']);

        return serializer['_serializeScopeMetrics'](scopeMetrics);
      }

      it('should serialize metric record', async () => {
        const serializer = new PrometheusSerializer();
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          '# HELP test_total foobar\n' +
            '# TYPE test_total gauge\n' +
            'test_total{val="1",otel_scope_name="test"} 1\n' +
            'test_total{val="2",otel_scope_name="test"} 1\n'
        );
      });

      it('serialize metric record with timestamp', async () => {
        const serializer = new PrometheusSerializer(undefined, true);
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          '# HELP test_total foobar\n' +
            '# TYPE test_total gauge\n' +
            `test_total{val="1",otel_scope_name="test"} 1 ${mockedHrTimeMs}\n` +
            `test_total{val="2",otel_scope_name="test"} 1 ${mockedHrTimeMs}\n`
        );
      });

      it('serialize metric record with timestamp and all resource attributes', async () => {
        const serializer = new PrometheusSerializer(undefined, true, /.*/);
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          '# HELP test_total foobar\n' +
            '# TYPE test_total gauge\n' +
            `test_total{val="1",otel_scope_name="test",${resourceAttributes}} 1 ${mockedHrTimeMs}\n` +
            `test_total{val="2",otel_scope_name="test",${resourceAttributes}} 1 ${mockedHrTimeMs}\n`
        );
      });
    });

    describe('with ExplicitBucketHistogramAggregation', () => {
      async function testSerializer(serializer: PrometheusSerializer) {
        const reader = new TestMetricReader();
        const meterProvider = new MeterProvider({
          views: [
            {
              aggregation: {
                type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
                options: { boundaries: [1, 10, 100] },
              },
              instrumentName: '*',
            },
          ],
          readers: [reader],
        });
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
        const resourceAttributes = resourceMetrics.resource.attributes;
        serializer['_additionalAttributes'] = serializer[
          '_filterResourceConstantLabels'
        ](resourceAttributes, serializer['_withResourceConstantLabels']);

        const result = serializer['_serializeScopeMetrics'](scopeMetrics);
        return result;
      }

      it('serialize cumulative metric record', async () => {
        const serializer = new PrometheusSerializer();
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          '# HELP test foobar\n' +
            '# TYPE test histogram\n' +
            'test_count{val="1",otel_scope_name="test"} 3\n' +
            'test_sum{val="1",otel_scope_name="test"} 175\n' +
            'test_bucket{val="1",otel_scope_name="test",le="1"} 0\n' +
            'test_bucket{val="1",otel_scope_name="test",le="10"} 1\n' +
            'test_bucket{val="1",otel_scope_name="test",le="100"} 2\n' +
            'test_bucket{val="1",otel_scope_name="test",le="+Inf"} 3\n' +
            'test_count{val="2",otel_scope_name="test"} 1\n' +
            'test_sum{val="2",otel_scope_name="test"} 5\n' +
            'test_bucket{val="2",otel_scope_name="test",le="1"} 0\n' +
            'test_bucket{val="2",otel_scope_name="test",le="10"} 1\n' +
            'test_bucket{val="2",otel_scope_name="test",le="100"} 1\n' +
            'test_bucket{val="2",otel_scope_name="test",le="+Inf"} 1\n'
        );
      });

      it('serialize cumulative metric record with all resource attributes', async () => {
        const serializer = new PrometheusSerializer('', false, /.*/);
        const result = await testSerializer(serializer);
        assert.strictEqual(
          result,
          '# HELP test foobar\n' +
            '# TYPE test histogram\n' +
            `test_count{val="1",otel_scope_name="test",${resourceAttributes}} 3\n` +
            `test_sum{val="1",otel_scope_name="test",${resourceAttributes}} 175\n` +
            `test_bucket{val="1",otel_scope_name="test",${resourceAttributes},le="1"} 0\n` +
            `test_bucket{val="1",otel_scope_name="test",${resourceAttributes},le="10"} 1\n` +
            `test_bucket{val="1",otel_scope_name="test",${resourceAttributes},le="100"} 2\n` +
            `test_bucket{val="1",otel_scope_name="test",${resourceAttributes},le="+Inf"} 3\n` +
            `test_count{val="2",otel_scope_name="test",${resourceAttributes}} 1\n` +
            `test_sum{val="2",otel_scope_name="test",${resourceAttributes}} 5\n` +
            `test_bucket{val="2",otel_scope_name="test",${resourceAttributes},le="1"} 0\n` +
            `test_bucket{val="2",otel_scope_name="test",${resourceAttributes},le="10"} 1\n` +
            `test_bucket{val="2",otel_scope_name="test",${resourceAttributes},le="100"} 1\n` +
            `test_bucket{val="2",otel_scope_name="test",${resourceAttributes},le="+Inf"} 1\n`
        );
      });

      it('serialize cumulative metric record on instrument that allows negative values', async () => {
        const serializer = new PrometheusSerializer();
        const reader = new TestMetricReader();
        const meterProvider = new MeterProvider({
          views: [
            {
              aggregation: {
                type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
                options: { boundaries: [1, 10, 100] },
              },
              instrumentName: '*',
            },
          ],
          readers: [reader],
        });
        const meter = meterProvider.getMeter('test');

        const upDownCounter = meter.createUpDownCounter('test', {
          description: 'foobar',
        });
        upDownCounter.add(5, { val: '1' });
        upDownCounter.add(50, { val: '1' });
        upDownCounter.add(120, { val: '1' });

        upDownCounter.add(5, { val: '2' });

        const { resourceMetrics, errors } = await reader.collect();
        assert.strictEqual(errors.length, 0);
        assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
        assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);
        const scopeMetrics = resourceMetrics.scopeMetrics[0];
        const resourceAttributes = resourceMetrics.resource.attributes;
        serializer['_additionalAttributes'] = serializer[
          '_filterResourceConstantLabels'
        ](resourceAttributes, serializer['_withResourceConstantLabels']);

        const result = serializer['_serializeScopeMetrics'](scopeMetrics);
        assert.strictEqual(
          result,
          '# HELP test foobar\n' +
            '# TYPE test histogram\n' +
            'test_count{val="1",otel_scope_name="test"} 3\n' +
            'test_bucket{val="1",otel_scope_name="test",le="1"} 0\n' +
            'test_bucket{val="1",otel_scope_name="test",le="10"} 1\n' +
            'test_bucket{val="1",otel_scope_name="test",le="100"} 2\n' +
            'test_bucket{val="1",otel_scope_name="test",le="+Inf"} 3\n' +
            'test_count{val="2",otel_scope_name="test"} 1\n' +
            'test_bucket{val="2",otel_scope_name="test",le="1"} 0\n' +
            'test_bucket{val="2",otel_scope_name="test",le="10"} 1\n' +
            'test_bucket{val="2",otel_scope_name="test",le="100"} 1\n' +
            'test_bucket{val="2",otel_scope_name="test",le="+Inf"} 1\n'
        );
      });
    });
  });

  describe('validate against metric conventions', () => {
    async function getCounterResult(
      name: string,
      serializer: PrometheusSerializer,
      options: Partial<{ unit: string; exportAll: boolean }> = {}
    ) {
      const reader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        views: [
          {
            aggregation: { type: AggregationType.SUM },
            instrumentName: '*',
          },
        ],
        readers: [reader],
      });
      const meter = meterProvider.getMeter('test');

      const { unit, exportAll = false } = options;
      const counter = meter.createCounter(name, { unit: unit });
      counter.add(1);

      const { resourceMetrics, errors } = await reader.collect();
      assert.strictEqual(errors.length, 0);
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);
      const metric = resourceMetrics.scopeMetrics[0].metrics[0];
      assert.strictEqual(metric.dataPointType, DataPointType.SUM);
      const pointData = metric.dataPoints as DataPoint<number>[];
      assert.strictEqual(pointData.length, 1);
      const resourceAttributes = resourceMetrics.resource.attributes;
      serializer['_additionalAttributes'] = serializer[
        '_filterResourceConstantLabels'
      ](resourceAttributes, serializer['_withResourceConstantLabels']);

      if (exportAll) {
        const result = serializer.serialize(resourceMetrics);
        return result;
      } else {
        const result = serializer['_serializeSingularDataPoint'](
          metric.descriptor.name,
          metric,
          pointData[0],
          serializer['_additionalAttributes']
        );
        return result;
      }
    }

    it('should export unit block when unit of metric is given', async () => {
      const serializer = new PrometheusSerializer();

      const unitOfMetric = 'seconds';
      const result = await getCounterResult('test', serializer, {
        unit: unitOfMetric,
        exportAll: true,
      });
      assert.strictEqual(
        result,
        serializedDefaultResource +
          '# HELP test_total description missing\n' +
          `# UNIT test_total ${unitOfMetric}\n` +
          '# TYPE test_total counter\n' +
          'test_total{otel_scope_name="test"} 1\n'
      );
    });

    it('should not export unit block when unit of metric is missing', async () => {
      const serializer = new PrometheusSerializer();

      const result = await getCounterResult('test', serializer, {
        exportAll: true,
      });
      assert.strictEqual(
        result,
        serializedDefaultResource +
          '# HELP test_total description missing\n' +
          '# TYPE test_total counter\n' +
          'test_total{otel_scope_name="test"} 1\n'
      );
    });

    it('should rename metric of type counter when name misses _total suffix', async () => {
      const serializer = new PrometheusSerializer();

      const result = await getCounterResult('test', serializer);
      assert.strictEqual(result, 'test_total 1\n');
    });

    it('should not rename metric of type counter when name contains _total suffix', async () => {
      const serializer = new PrometheusSerializer();
      const result = await getCounterResult('test_total', serializer);

      assert.strictEqual(result, 'test_total 1\n');
    });
  });

  describe('serialize non-normalized values', () => {
    async function testSerializer(
      serializer: PrometheusSerializer,
      name: string,
      fn: (counter: UpDownCounter) => void
    ) {
      const reader = new TestMetricReader();
      const meterProvider = new MeterProvider({
        views: [
          {
            aggregation: { type: AggregationType.SUM },
            instrumentName: '*',
          },
        ],
        readers: [reader],
      });
      const meter = meterProvider.getMeter('test');

      const counter = meter.createUpDownCounter(name);
      fn(counter);

      const { resourceMetrics, errors } = await reader.collect();
      assert.strictEqual(errors.length, 0);
      assert.strictEqual(resourceMetrics.scopeMetrics.length, 1);
      assert.strictEqual(resourceMetrics.scopeMetrics[0].metrics.length, 1);
      const metric = resourceMetrics.scopeMetrics[0].metrics[0];
      assert.strictEqual(metric.dataPointType, DataPointType.SUM);
      const pointData = metric.dataPoints as DataPoint<number>[];
      assert.strictEqual(pointData.length, 1);
      const resourceAttributes = resourceMetrics.resource.attributes;
      serializer['_additionalAttributes'] = serializer[
        '_filterResourceConstantLabels'
      ](resourceAttributes, serializer['_withResourceConstantLabels']);

      const result = serializer['_serializeSingularDataPoint'](
        metric.descriptor.name,
        metric,
        pointData[0],
        serializer['_additionalAttributes']
      );
      return result;
    }

    it('should serialize records without attributes', async () => {
      const serializer = new PrometheusSerializer();

      const result = await testSerializer(serializer, 'test_total', counter => {
        counter.add(1);
      });

      assert.strictEqual(result, 'test_total 1\n');
    });

    it('should serialize non-string attribute values in JSON representations', async () => {
      const serializer = new PrometheusSerializer();

      const result = await testSerializer(serializer, 'test_total', counter => {
        counter.add(1, {
          true: true,
          false: false,
          array: [1, undefined, null, 2],
          object: {},
          Infinity: Infinity,
          NaN: NaN,
          null: null,
          undefined: undefined,
        } as unknown as Attributes);
      });

      assert.strictEqual(
        result,
        'test_total{true="true",false="false",array="[1,null,null,2]",object="{}",Infinity="null",NaN="null",null="null",undefined=""} 1\n'
      );
    });

    it('should serialize non-finite values', async () => {
      const serializer = new PrometheusSerializer();
      const cases = [
        [NaN, 'NaN'],
        [-Infinity, '-Inf'],
        [+Infinity, '+Inf'],
      ] as [number, string][];

      for (const esac of cases) {
        const result = await testSerializer(serializer, 'test', counter => {
          counter.add(esac[0], attributes);
        });

        assert.strictEqual(
          result,
          `test{foo1="bar1",foo2="bar2"} ${esac[1]}\n`
        );
      }
    });

    it('should escape backslash (\\), double-quote ("), and line feed (\\n) in attribute values', async () => {
      const serializer = new PrometheusSerializer();

      const result = await testSerializer(serializer, 'test_total', counter => {
        counter.add(1, {
          backslash: '\u005c', // \ => \\ (\u005c\u005c)
          doubleQuote: '\u0022', // " => \" (\u005c\u0022)
          lineFeed: '\u000a', // ↵ => \n (\u005c\u006e)
          backslashN: '\u005c\u006e', // \n => \\n (\u005c\u005c\u006e)
          backslashDoubleQuote: '\u005c\u0022', // \" => \\\" (\u005c\u005c\u005c\u0022)
          backslashLineFeed: '\u005c\u000a', // \↵ => \\\n (\u005c\u005c\u005c\u006e)
        } as unknown as Attributes);
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
          '} 1\n'
      );
    });

    it('should sanitize attribute names', async () => {
      const serializer = new PrometheusSerializer();

      const result = await testSerializer(serializer, 'test_total', counter => {
        // if you try to use an attribute name like account-id prometheus will complain
        // with an error like:
        // error while linting: text format parsing error in line 282: expected '=' after label name, found '-'
        counter.add(1, {
          'account-id': '123456',
        } as unknown as Attributes);
      });

      assert.strictEqual(result, 'test_total{account_id="123456"} 1\n');
    });
  });

  describe('_serializeResource', () => {
    it('should serialize resource', () => {
      const serializer = new PrometheusSerializer(undefined, true);
      const result = serializer['_serializeResource'](
        resourceFromAttributes({
          env: 'prod',
          hostname: 'myhost',
          datacenter: 'sdc',
          region: 'europe',
          owner: 'frontend',
        })
      );

      assert.strictEqual(
        result,
        '# HELP target_info Target metadata\n' +
          '# TYPE target_info gauge\n' +
          'target_info{env="prod",hostname="myhost",datacenter="sdc",region="europe",owner="frontend"} 1\n'
      );
    });

    it('omits target_info if withoutTargetInfo is true', () => {
      const serializer = new PrometheusSerializer(
        undefined,
        true,
        undefined,
        true
      );
      const result = serializer['_serializeResource'](
        resourceFromAttributes({
          env: 'prod',
          hostname: 'myhost',
          datacenter: 'sdc',
          region: 'europe',
          owner: 'frontend',
        })
      );

      assert.strictEqual(result.includes('target_info'), false);
    });

    it('omits scope labels if withoutScopeInfo is true', async () => {
      const serializer = new PrometheusSerializer(
        undefined,
        true,
        undefined,
        false,
        true
      );
      const result = serializer['_serializeResource'](
        resourceFromAttributes({
          env: 'prod',
          hostname: 'myhost',
          datacenter: 'sdc',
          region: 'europe',
          owner: 'frontend',
        })
      );

      assert.strictEqual(result.includes('otel_scope_name'), false);
      assert.strictEqual(result.includes('otel_scope_schema_url'), false);
      assert.strictEqual(result.includes('otel_scope_version'), false);
    });
  });
});

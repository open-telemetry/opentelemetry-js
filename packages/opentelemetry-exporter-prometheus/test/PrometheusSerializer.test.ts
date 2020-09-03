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
import {
  SumAggregator,
  MinMaxLastSumCountAggregator,
  HistogramAggregator,
  MeterProvider,
  CounterMetric,
  ValueRecorderMetric,
  UpDownCounterMetric,
} from '@opentelemetry/metrics';
import * as assert from 'assert';
import { Labels } from '@opentelemetry/api';
import { PrometheusSerializer } from '../src/PrometheusSerializer';
import { PrometheusLabelsBatcher } from '../src/PrometheusLabelsBatcher';
import { ExactBatcher } from './ExactBatcher';
import { mockedHrTimeMs, mockAggregator } from './util';

const labels = {
  foo1: 'bar1',
  foo2: 'bar2',
};

describe('PrometheusSerializer', () => {
  describe('constructor', () => {
    it('should construct a serializer', () => {
      const serializer = new PrometheusSerializer();
      assert(serializer instanceof PrometheusSerializer);
    });
  });

  describe('serialize a metric record', () => {
    describe('with SumAggregator', () => {
      mockAggregator(SumAggregator);

      it('should serialize metric record with sum aggregator', async () => {
        const serializer = new PrometheusSerializer();

        const meter = new MeterProvider({
          batcher: new ExactBatcher(SumAggregator),
        }).getMeter('test');
        const counter = meter.createCounter('test') as CounterMetric;
        counter.bind(labels).add(1);

        const records = await counter.getMetricRecord();
        const record = records[0];

        const result = serializer.serializeRecord(
          record.descriptor.name,
          record
        );
        assert.strictEqual(
          result,
          `test{foo1="bar1",foo2="bar2"} 1 ${mockedHrTimeMs}\n`
        );
      });

      it('serialize metric record with sum aggregator without timestamp', async () => {
        const serializer = new PrometheusSerializer(undefined, false);

        const meter = new MeterProvider({
          batcher: new ExactBatcher(SumAggregator),
        }).getMeter('test');
        const counter = meter.createCounter('test') as CounterMetric;
        counter.bind(labels).add(1);

        const records = await counter.getMetricRecord();
        const record = records[0];

        const result = serializer.serializeRecord(
          record.descriptor.name,
          record
        );
        assert.strictEqual(result, 'test{foo1="bar1",foo2="bar2"} 1\n');
      });
    });

    describe('with MinMaxLastSumCountAggregator', () => {
      mockAggregator(MinMaxLastSumCountAggregator);

      it('should serialize metric record with sum aggregator', async () => {
        const serializer = new PrometheusSerializer();

        const meter = new MeterProvider({
          batcher: new ExactBatcher(MinMaxLastSumCountAggregator),
        }).getMeter('test');
        const counter = meter.createCounter('test') as CounterMetric;
        counter.bind(labels).add(1);

        const records = await counter.getMetricRecord();
        const record = records[0];

        const result = serializer.serializeRecord(
          record.descriptor.name,
          record
        );
        assert.strictEqual(
          result,
          `test_count{foo1="bar1",foo2="bar2"} 1 ${mockedHrTimeMs}\n` +
            `test_sum{foo1="bar1",foo2="bar2"} 1 ${mockedHrTimeMs}\n` +
            `test{foo1="bar1",foo2="bar2",quantile="0"} 1 ${mockedHrTimeMs}\n` +
            `test{foo1="bar1",foo2="bar2",quantile="1"} 1 ${mockedHrTimeMs}\n`
        );
      });

      it('serialize metric record with sum aggregator without timestamp', async () => {
        const serializer = new PrometheusSerializer(undefined, false);

        const meter = new MeterProvider({
          batcher: new ExactBatcher(MinMaxLastSumCountAggregator),
        }).getMeter('test');
        const counter = meter.createCounter('test') as CounterMetric;
        counter.bind(labels).add(1);

        const records = await counter.getMetricRecord();
        const record = records[0];

        const result = serializer.serializeRecord(
          record.descriptor.name,
          record
        );
        assert.strictEqual(
          result,
          'test_count{foo1="bar1",foo2="bar2"} 1\n' +
            'test_sum{foo1="bar1",foo2="bar2"} 1\n' +
            'test{foo1="bar1",foo2="bar2",quantile="0"} 1\n' +
            'test{foo1="bar1",foo2="bar2",quantile="1"} 1\n'
        );
      });
    });

    describe('with HistogramAggregator', () => {
      mockAggregator(HistogramAggregator);

      it('should serialize metric record with sum aggregator', async () => {
        const serializer = new PrometheusSerializer();

        const batcher = new ExactBatcher(HistogramAggregator, [1, 10, 100]);
        const meter = new MeterProvider({ batcher }).getMeter('test');
        const recorder = meter.createValueRecorder('test', {
          description: 'foobar',
        }) as ValueRecorderMetric;
        recorder.bind(labels).record(5);

        const records = await recorder.getMetricRecord();
        const record = records[0];

        const result = serializer.serializeRecord(
          record.descriptor.name,
          record
        );
        assert.strictEqual(
          result,
          `test_count{foo1="bar1",foo2="bar2"} 1 ${mockedHrTimeMs}\n` +
            `test_sum{foo1="bar1",foo2="bar2"} 5 ${mockedHrTimeMs}\n` +
            `test_bucket{foo1="bar1",foo2="bar2",le="1"} 0 ${mockedHrTimeMs}\n` +
            `test_bucket{foo1="bar1",foo2="bar2",le="10"} 1 ${mockedHrTimeMs}\n` +
            `test_bucket{foo1="bar1",foo2="bar2",le="100"} 0 ${mockedHrTimeMs}\n` +
            `test_bucket{foo1="bar1",foo2="bar2",le="+Inf"} 0 ${mockedHrTimeMs}\n`
        );
      });

      it('serialize metric record with sum aggregator without timestamp', async () => {
        const serializer = new PrometheusSerializer(undefined, false);

        const batcher = new ExactBatcher(HistogramAggregator, [1, 10, 100]);
        const meter = new MeterProvider({ batcher }).getMeter('test');
        const recorder = meter.createValueRecorder('test', {
          description: 'foobar',
        }) as ValueRecorderMetric;
        recorder.bind(labels).record(5);

        const records = await recorder.getMetricRecord();
        const record = records[0];

        const result = serializer.serializeRecord(
          record.descriptor.name,
          record
        );
        assert.strictEqual(
          result,
          'test_count{foo1="bar1",foo2="bar2"} 1\n' +
            'test_sum{foo1="bar1",foo2="bar2"} 5\n' +
            'test_bucket{foo1="bar1",foo2="bar2",le="1"} 0\n' +
            'test_bucket{foo1="bar1",foo2="bar2",le="10"} 1\n' +
            'test_bucket{foo1="bar1",foo2="bar2",le="100"} 0\n' +
            'test_bucket{foo1="bar1",foo2="bar2",le="+Inf"} 0\n'
        );
      });
    });
  });

  describe('serialize a checkpoint set', () => {
    describe('with SumAggregator', () => {
      mockAggregator(SumAggregator);

      it('should serialize metric record with sum aggregator', async () => {
        const serializer = new PrometheusSerializer();

        const meter = new MeterProvider({
          batcher: new ExactBatcher(SumAggregator),
        }).getMeter('test');
        const batcher = new PrometheusLabelsBatcher();
        const counter = meter.createCounter('test', {
          description: 'foobar',
        }) as CounterMetric;
        counter.bind({ val: '1' }).add(1);
        counter.bind({ val: '2' }).add(1);

        const records = await counter.getMetricRecord();
        records.forEach(it => batcher.process(it));
        const checkPointSet = batcher.checkPointSet();

        const result = serializer.serialize(checkPointSet);
        assert.strictEqual(
          result,
          '# HELP test foobar\n' +
            '# TYPE test counter\n' +
            `test{val="1"} 1 ${mockedHrTimeMs}\n` +
            `test{val="2"} 1 ${mockedHrTimeMs}\n`
        );
      });

      it('serialize metric record with sum aggregator without timestamp', async () => {
        const serializer = new PrometheusSerializer(undefined, false);

        const meter = new MeterProvider({
          batcher: new ExactBatcher(SumAggregator),
        }).getMeter('test');
        const batcher = new PrometheusLabelsBatcher();
        const counter = meter.createCounter('test', {
          description: 'foobar',
        }) as CounterMetric;
        counter.bind({ val: '1' }).add(1);
        counter.bind({ val: '2' }).add(1);

        const records = await counter.getMetricRecord();
        records.forEach(it => batcher.process(it));
        const checkPointSet = batcher.checkPointSet();

        const result = serializer.serialize(checkPointSet);
        assert.strictEqual(
          result,
          '# HELP test foobar\n' +
            '# TYPE test counter\n' +
            'test{val="1"} 1\n' +
            'test{val="2"} 1\n'
        );
      });
    });

    describe('with MinMaxLastSumCountAggregator', () => {
      mockAggregator(MinMaxLastSumCountAggregator);

      it('serialize metric record with MinMaxLastSumCountAggregator aggregator', async () => {
        const serializer = new PrometheusSerializer();

        const meter = new MeterProvider({
          batcher: new ExactBatcher(MinMaxLastSumCountAggregator),
        }).getMeter('test');
        const batcher = new PrometheusLabelsBatcher();
        const counter = meter.createCounter('test', {
          description: 'foobar',
        }) as CounterMetric;
        counter.bind({ val: '1' }).add(1);
        counter.bind({ val: '2' }).add(1);

        const records = await counter.getMetricRecord();
        records.forEach(it => batcher.process(it));
        const checkPointSet = batcher.checkPointSet();

        const result = serializer.serialize(checkPointSet);
        assert.strictEqual(
          result,
          '# HELP test foobar\n' +
            '# TYPE test summary\n' +
            `test_count{val="1"} 1 ${mockedHrTimeMs}\n` +
            `test_sum{val="1"} 1 ${mockedHrTimeMs}\n` +
            `test{val="1",quantile="0"} 1 ${mockedHrTimeMs}\n` +
            `test{val="1",quantile="1"} 1 ${mockedHrTimeMs}\n` +
            `test_count{val="2"} 1 ${mockedHrTimeMs}\n` +
            `test_sum{val="2"} 1 ${mockedHrTimeMs}\n` +
            `test{val="2",quantile="0"} 1 ${mockedHrTimeMs}\n` +
            `test{val="2",quantile="1"} 1 ${mockedHrTimeMs}\n`
        );
      });
    });

    describe('with HistogramAggregator', () => {
      mockAggregator(HistogramAggregator);

      it('serialize metric record with MinMaxLastSumCountAggregator aggregator', async () => {
        const serializer = new PrometheusSerializer();

        const batcher = new ExactBatcher(HistogramAggregator, [1, 10, 100]);
        const meter = new MeterProvider({ batcher }).getMeter('test');
        const recorder = meter.createValueRecorder('test', {
          description: 'foobar',
        }) as ValueRecorderMetric;
        recorder.bind({ val: '1' }).record(5);
        recorder.bind({ val: '2' }).record(5);

        const records = await recorder.getMetricRecord();
        const labelBatcher = new PrometheusLabelsBatcher();
        records.forEach(it => labelBatcher.process(it));
        const checkPointSet = labelBatcher.checkPointSet();

        const result = serializer.serialize(checkPointSet);
        assert.strictEqual(
          result,
          '# HELP test foobar\n' +
            '# TYPE test histogram\n' +
            `test_count{val="1"} 1 ${mockedHrTimeMs}\n` +
            `test_sum{val="1"} 5 ${mockedHrTimeMs}\n` +
            `test_bucket{val="1",le="1"} 0 ${mockedHrTimeMs}\n` +
            `test_bucket{val="1",le="10"} 1 ${mockedHrTimeMs}\n` +
            `test_bucket{val="1",le="100"} 0 ${mockedHrTimeMs}\n` +
            `test_bucket{val="1",le="+Inf"} 0 ${mockedHrTimeMs}\n` +
            `test_count{val="2"} 1 ${mockedHrTimeMs}\n` +
            `test_sum{val="2"} 5 ${mockedHrTimeMs}\n` +
            `test_bucket{val="2",le="1"} 0 ${mockedHrTimeMs}\n` +
            `test_bucket{val="2",le="10"} 1 ${mockedHrTimeMs}\n` +
            `test_bucket{val="2",le="100"} 0 ${mockedHrTimeMs}\n` +
            `test_bucket{val="2",le="+Inf"} 0 ${mockedHrTimeMs}\n`
        );
      });
    });
  });

  describe('serialize non-normalized values', () => {
    describe('with SumAggregator', () => {
      mockAggregator(SumAggregator);

      it('should serialize records without labels', async () => {
        const serializer = new PrometheusSerializer();

        const meter = new MeterProvider({
          batcher: new ExactBatcher(SumAggregator),
        }).getMeter('test');
        const counter = meter.createCounter('test') as CounterMetric;
        counter.bind({}).add(1);

        const records = await counter.getMetricRecord();
        const record = records[0];

        const result = serializer.serializeRecord(
          record.descriptor.name,
          record
        );
        assert.strictEqual(result, `test 1 ${mockedHrTimeMs}\n`);
      });

      it('should serialize non-string label values', async () => {
        const serializer = new PrometheusSerializer();

        const meter = new MeterProvider({
          batcher: new ExactBatcher(SumAggregator),
        }).getMeter('test');
        const counter = meter.createCounter('test') as CounterMetric;
        counter
          .bind(({
            object: {},
            NaN: NaN,
            null: null,
            undefined: undefined,
          } as unknown) as Labels)
          .add(1);
        const records = await counter.getMetricRecord();
        const record = records[0];

        const result = serializer.serializeRecord(
          record.descriptor.name,
          record
        );
        assert.strictEqual(
          result,
          `test{object="[object Object]",NaN="NaN",null="null",undefined="undefined"} 1 ${mockedHrTimeMs}\n`
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
          const meter = new MeterProvider({
            batcher: new ExactBatcher(SumAggregator),
          }).getMeter('test');
          const counter = meter.createUpDownCounter(
            'test'
          ) as UpDownCounterMetric;
          counter.bind(labels).add(esac[0]);
          const records = await counter.getMetricRecord();
          const record = records[0];

          const result = serializer.serializeRecord(
            record.descriptor.name,
            record
          );
          assert.strictEqual(
            result,
            `test{foo1="bar1",foo2="bar2"} ${esac[1]} ${mockedHrTimeMs}\n`
          );
        }
      });

      it('should escape backslash (\\), double-quote ("), and line feed (\\n) in label values', async () => {
        const serializer = new PrometheusSerializer();

        const meter = new MeterProvider({
          batcher: new ExactBatcher(SumAggregator),
        }).getMeter('test');
        const counter = meter.createCounter('test') as CounterMetric;
        counter
          .bind(({
            backslash: '\u005c', // \ => \\ (\u005c\u005c)
            doubleQuote: '\u0022', // " => \" (\u005c\u0022)
            lineFeed: '\u000a', // ↵ => \n (\u005c\u006e)
            backslashN: '\u005c\u006e', // \n => \\n (\u005c\u005c\u006e)
            backslashDoubleQuote: '\u005c\u0022', // \" => \\\" (\u005c\u005c\u005c\u0022)
            backslashLineFeed: '\u005c\u000a', // \↵ => \\\n (\u005c\u005c\u005c\u006e)
          } as unknown) as Labels)
          .add(1);
        const records = await counter.getMetricRecord();
        const record = records[0];

        const result = serializer.serializeRecord(
          record.descriptor.name,
          record
        );
        assert.strictEqual(
          result,
          'test{' +
            'backslash="\u005c\u005c",' +
            'doubleQuote="\u005c\u0022",' +
            'lineFeed="\u005c\u006e",' +
            'backslashN="\u005c\u005c\u006e",' +
            'backslashDoubleQuote="\u005c\u005c\u005c\u0022",' +
            'backslashLineFeed="\u005c\u005c\u005c\u006e"' +
            `} 1 ${mockedHrTimeMs}\n`
        );
      });
    });
  });
});

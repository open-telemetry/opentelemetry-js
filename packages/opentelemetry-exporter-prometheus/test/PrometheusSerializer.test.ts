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
  Point,
  Sum,
  SumAggregator,
  MetricRecord,
  MetricKind,
  MinMaxLastSumCountAggregator,
  HistogramAggregator,
  Aggregator,
} from '@opentelemetry/metrics';
import * as assert from 'assert';
import { HrTime, ValueType, Labels } from '@opentelemetry/api';
import { PrometheusSerializer } from '../src/PrometheusSerializer';
import { Resource } from '../../opentelemetry-metrics/node_modules/@opentelemetry/resources/build/src';

const mockedHrTime: HrTime = [1586347902211, 0];
const mockedHrTimeMs = 1586347902211000;
const resource = Resource.EMPTY;
const instrumentationLibrary: MetricRecord['instrumentationLibrary'] = {
  name: 'test',
  version: '*',
};
const descriptor: MetricRecord['descriptor'] = {
  name: 'test',
  description: 'foobar',
  metricKind: MetricKind.COUNTER,
  unit: '',
  valueType: ValueType.INT,
};
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

      it('should serialize metric record with sum aggregator', () => {
        const serializer = new PrometheusSerializer();
        const aggregator = new SumAggregator();
        aggregator.update(1);
        const metricRecord: MetricRecord = {
          descriptor,
          instrumentationLibrary,
          resource,
          labels,
          aggregator,
        };
        const result = serializer.serializeRecord(
          metricRecord.descriptor.name,
          metricRecord
        );
        assert.strictEqual(
          result,
          `test{foo1="bar1",foo2="bar2"} 1 ${mockedHrTimeMs}\n`
        );
      });

      it('serialize metric record with sum aggregator without timestamp', () => {
        const serializer = new PrometheusSerializer(undefined, false);
        const aggregator = new SumAggregator();
        aggregator.update(1);
        const metricRecord: MetricRecord = {
          descriptor,
          instrumentationLibrary,
          resource,
          labels,
          aggregator,
        };
        const result = serializer.serializeRecord(
          metricRecord.descriptor.name,
          metricRecord
        );
        assert.strictEqual(
          result,
          `test{foo1="bar1",foo2="bar2"} 1\n`
        );
      });
    });

    describe('with MinMaxLastSumCountAggregator', () => {
      mockAggregator(MinMaxLastSumCountAggregator);

      it('should serialize metric record with sum aggregator', () => {
        const serializer = new PrometheusSerializer();
        const aggregator = new MinMaxLastSumCountAggregator();
        aggregator.update(1);
        const metricRecord: MetricRecord = {
          descriptor,
          instrumentationLibrary,
          resource,
          labels,
          aggregator,
        };
        const result = serializer.serializeRecord(
          metricRecord.descriptor.name,
          metricRecord
        );
        assert.strictEqual(
          result,
          `test_min{foo1="bar1",foo2="bar2"} 1 ${mockedHrTimeMs}\n` +
            `test_max{foo1="bar1",foo2="bar2"} 1 ${mockedHrTimeMs}\n` +
            `test_count{foo1="bar1",foo2="bar2"} 1 ${mockedHrTimeMs}\n` +
            `test_last{foo1="bar1",foo2="bar2"} 1 ${mockedHrTimeMs}\n` +
            `test_sum{foo1="bar1",foo2="bar2"} 1 ${mockedHrTimeMs}\n`
        );
      });

      it('serialize metric record with sum aggregator without timestamp', () => {
        const serializer = new PrometheusSerializer(undefined, false);
        const aggregator = new MinMaxLastSumCountAggregator();
        aggregator.update(1);
        const metricRecord: MetricRecord = {
          descriptor,
          instrumentationLibrary,
          resource,
          labels,
          aggregator,
        };
        const result = serializer.serializeRecord(
          metricRecord.descriptor.name,
          metricRecord
        );
        assert.strictEqual(
          result,
          `test_min{foo1="bar1",foo2="bar2"} 1\n` +
            `test_max{foo1="bar1",foo2="bar2"} 1\n` +
            `test_count{foo1="bar1",foo2="bar2"} 1\n` +
            `test_last{foo1="bar1",foo2="bar2"} 1\n` +
            `test_sum{foo1="bar1",foo2="bar2"} 1\n`
        );
      });
    });

    describe('with HistogramAggregator', () => {
      mockAggregator(HistogramAggregator);

      it('should serialize metric record with sum aggregator', () => {
        const serializer = new PrometheusSerializer();
        const aggregator = new HistogramAggregator([1, 10, 100]);
        aggregator.update(5);
        // TODO(#1292);
        aggregator.reset();

        const metricRecord = makeMetricRecord(aggregator);
        const result = serializer.serializeRecord(
          metricRecord.descriptor.name,
          metricRecord
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

      it('serialize metric record with sum aggregator without timestamp', () => {
        const serializer = new PrometheusSerializer(undefined, false);
        const aggregator = new HistogramAggregator([1, 10, 100]);
        aggregator.update(5);
        // TODO(#1292);
        aggregator.reset();

        const metricRecord = makeMetricRecord(aggregator);
        const result = serializer.serializeRecord(
          metricRecord.descriptor.name,
          metricRecord
        );
        assert.strictEqual(
          result,
          `test_count{foo1="bar1",foo2="bar2"} 1\n` +
            `test_sum{foo1="bar1",foo2="bar2"} 5\n` +
            `test_bucket{foo1="bar1",foo2="bar2",le="1"} 0\n` +
            `test_bucket{foo1="bar1",foo2="bar2",le="10"} 1\n` +
            `test_bucket{foo1="bar1",foo2="bar2",le="100"} 0\n` +
            `test_bucket{foo1="bar1",foo2="bar2",le="+Inf"} 0\n`
        );
      });
    });
  });

  describe('serialize a checkpoint set', () => {
    mockAggregator(SumAggregator);

    it('should serialize metric record with sum aggregator', () => {
      const serializer = new PrometheusSerializer();
      const aggregator = new SumAggregator();
      aggregator.update(1);

      const result = serializer.serialize([
        {
          descriptor,
          aggregatorKind: aggregator.kind,
          records: [
            {
              descriptor,
              instrumentationLibrary,
              resource,
              labels: {
                val: '1',
              },
              aggregator,
            },
            {
              descriptor,
              instrumentationLibrary,
              resource,
              labels: {
                val: '2',
              },
              aggregator,
            }
          ]
        }
      ]);
      assert.strictEqual(
        result,
        `# HELP test foobar\n` +
        `# TYPE test counter\n` +
        `test{val="1"} 1 ${mockedHrTimeMs}\n` +
        `test{val="2"} 1 ${mockedHrTimeMs}\n`
      );
    });

    it('serialize metric record with sum aggregator without timestamp', () => {
      const serializer = new PrometheusSerializer(undefined, false);
      const aggregator = new SumAggregator();
      aggregator.update(1);

      const result = serializer.serialize([
        {
          descriptor,
          aggregatorKind: aggregator.kind,
          records: [
            {
              descriptor,
              instrumentationLibrary,
              resource,
              labels: {
                val: '1',
              },
              aggregator,
            },
            {
              descriptor,
              instrumentationLibrary,
              resource,
              labels: {
                val: '2',
              },
              aggregator,
            }
          ]
        }
      ]);
      assert.strictEqual(
        result,
        `# HELP test foobar\n` +
        `# TYPE test counter\n` +
        `test{val="1"} 1\n` +
        `test{val="2"} 1\n`
      );
    });
  });

  describe('serialize non-normalized values', () => {
    describe('with SumAggregator', () => {
      mockAggregator(SumAggregator);

      it('should serialize records without labels', () => {
        const serializer = new PrometheusSerializer();
        const aggregator = new SumAggregator();
        aggregator.update(1);

        const metricRecord = makeMetricRecord(aggregator, {});
        const result = serializer.serializeRecord(
          metricRecord.descriptor.name,
          metricRecord
        );
        assert.strictEqual(
          result,
          `test 1 ${mockedHrTimeMs}\n`
        );
      });

      it('should serialize non-string label values', () => {
        const serializer = new PrometheusSerializer();
        const aggregator = new SumAggregator();
        aggregator.update(1);

        const metricRecord = makeMetricRecord(aggregator, {
          object: {},
          NaN: NaN,
          null: null,
          undefined: undefined,
        } as unknown as Labels);
        const result = serializer.serializeRecord(
          metricRecord.descriptor.name,
          metricRecord
        );
        assert.strictEqual(
          result,
          `test{object="[object Object]",NaN="NaN",null="null",undefined="undefined"} 1 ${mockedHrTimeMs}\n`
        );
      });


      it('should serialize non-finite values', () => {
        const serializer = new PrometheusSerializer();

        ([
          [NaN, "Nan"],
          [-Infinity, "-Inf"],
          [+Infinity, '+Inf'],
        ] as [number, string][]).forEach(esac => {
          const aggregator = new SumAggregator();
          aggregator.update(esac[0]);

          const metricRecord = makeMetricRecord(aggregator);
          const result = serializer.serializeRecord(
            metricRecord.descriptor.name,
            metricRecord
          );
          assert.strictEqual(
            result,
            `test{foo1="bar1",foo2="bar2"} ${esac[1]} ${mockedHrTimeMs}\n`
          );
        })
      });
    });
  });
});

function mockAggregator(Aggregator: any) {
  let toPoint: () => Point<Sum>;
  before(() => {
    toPoint = Aggregator.prototype.toPoint;
    Aggregator.prototype.toPoint = function (): Point<Sum> {
      const point = toPoint.apply(this);
      point.timestamp = mockedHrTime;
      return point;
    };
  });
  after(() => {
    Aggregator.prototype.toPoint = toPoint;
  });
}

function makeMetricRecord(aggregator: Aggregator, _labels?: Labels): MetricRecord {
  return {
    descriptor,
    instrumentationLibrary,
    resource,
    labels: _labels ?? labels,
    aggregator,
  };
}

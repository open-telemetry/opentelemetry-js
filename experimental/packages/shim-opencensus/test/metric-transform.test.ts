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

import { mapOcMetric } from '../src/metric-transform';

import * as oc from '@opencensus/core';
import { ValueType } from '@opentelemetry/api';
import {
  AggregationTemporality,
  DataPointType,
  GaugeMetricData,
  HistogramMetricData,
  SumMetricData,
} from '@opentelemetry/sdk-metrics';
import * as assert from 'assert';

describe('metric-transform', () => {
  it('should map OpenCensus CUMULATIVE_INT64 to Sum', () => {
    const metricData = mapOcMetric({
      descriptor: {
        description: 'ocDescription',
        name: 'ocMetricName',
        type: oc.MetricDescriptorType.CUMULATIVE_INT64,
        unit: 'ocUnit',
        labelKeys: [
          { key: 'key1', description: '' },
          { key: 'key2', description: '' },
        ],
      },
      timeseries: [
        {
          startTimestamp: { seconds: 10, nanos: 10 },
          labelValues: [{ value: 'value1' }, { value: 'value2' }],
          points: [{ timestamp: { seconds: 20, nanos: 20 }, value: 5 }],
        },
      ],
    });

    assert.deepStrictEqual(metricData, {
      aggregationTemporality: AggregationTemporality.CUMULATIVE,
      dataPointType: DataPointType.SUM,
      dataPoints: [
        {
          attributes: { key1: 'value1', key2: 'value2' },
          endTime: [20, 20],
          startTime: [10, 10],
          value: 5,
        },
      ],
      descriptor: {
        description: 'ocDescription',
        name: 'ocMetricName',
        unit: 'ocUnit',
        valueType: ValueType.INT,
      },
      isMonotonic: true,
    } as SumMetricData);
  });

  it('should map OpenCensus CUMULATIVE_DOUBLE to Sum', () => {
    const metricData = mapOcMetric({
      descriptor: {
        description: 'ocDescription',
        name: 'ocMetricName',
        type: oc.MetricDescriptorType.CUMULATIVE_DOUBLE,
        unit: 'ocUnit',
        labelKeys: [
          { key: 'key1', description: '' },
          { key: 'key2', description: '' },
        ],
      },
      timeseries: [
        {
          startTimestamp: { seconds: 10, nanos: 10 },
          labelValues: [{ value: 'value1' }, { value: 'value2' }],
          points: [{ timestamp: { seconds: 20, nanos: 20 }, value: 5.5 }],
        },
      ],
    });

    assert.deepStrictEqual(metricData, {
      aggregationTemporality: AggregationTemporality.CUMULATIVE,
      dataPointType: DataPointType.SUM,
      dataPoints: [
        {
          attributes: { key1: 'value1', key2: 'value2' },
          endTime: [20, 20],
          startTime: [10, 10],
          value: 5.5,
        },
      ],
      descriptor: {
        description: 'ocDescription',
        name: 'ocMetricName',
        unit: 'ocUnit',
        valueType: ValueType.DOUBLE,
      },
      isMonotonic: true,
    } as SumMetricData);
  });

  it('should map OpenCensus CUMULATIVE_DISTRIBUTION to Histogram', () => {
    const metricData = mapOcMetric({
      descriptor: {
        description: 'ocDescription',
        name: 'ocMetricName',
        type: oc.MetricDescriptorType.CUMULATIVE_DISTRIBUTION,
        unit: 'ocUnit',
        labelKeys: [
          { key: 'key1', description: '' },
          { key: 'key2', description: '' },
        ],
      },
      timeseries: [
        {
          startTimestamp: { seconds: 10, nanos: 10 },
          labelValues: [{ value: 'value1' }, { value: 'value2' }],
          points: [
            {
              timestamp: { seconds: 20, nanos: 20 },
              value: {
                bucketOptions: {
                  explicit: {
                    bounds: [1, 10, 100],
                  },
                },
                buckets: [
                  { count: 0 },
                  { count: 1 },
                  { count: 2 },
                  { count: 3 },
                ],
                count: 6,
                sum: 121,
                sumOfSquaredDeviation: 4,
              },
            },
          ],
        },
      ],
    });

    assert.deepStrictEqual(metricData, {
      aggregationTemporality: AggregationTemporality.CUMULATIVE,
      dataPointType: DataPointType.HISTOGRAM,
      dataPoints: [
        {
          attributes: { key1: 'value1', key2: 'value2' },
          endTime: [20, 20],
          startTime: [10, 10],
          value: {
            buckets: {
              boundaries: [1, 10, 100],
              counts: [0, 1, 2, 3],
            },
            count: 6,
            sum: 121,
          },
        },
      ],
      descriptor: {
        description: 'ocDescription',
        name: 'ocMetricName',
        unit: 'ocUnit',
        valueType: ValueType.DOUBLE,
      },
    } as HistogramMetricData);
  });

  it('should map OpenCensus GAUGE_INT64 to Gauge', () => {
    const metricData = mapOcMetric({
      descriptor: {
        description: 'ocDescription',
        name: 'ocMetricName',
        type: oc.MetricDescriptorType.GAUGE_INT64,
        unit: 'ocUnit',
        labelKeys: [
          { key: 'key1', description: '' },
          { key: 'key2', description: '' },
        ],
      },
      timeseries: [
        {
          startTimestamp: { seconds: 10, nanos: 10 },
          labelValues: [{ value: 'value1' }, { value: 'value2' }],
          points: [{ timestamp: { seconds: 20, nanos: 20 }, value: 5 }],
        },
      ],
    });

    assert.deepStrictEqual(metricData, {
      aggregationTemporality: AggregationTemporality.CUMULATIVE,
      dataPointType: DataPointType.GAUGE,
      dataPoints: [
        {
          attributes: { key1: 'value1', key2: 'value2' },
          endTime: [20, 20],
          startTime: [10, 10],
          value: 5,
        },
      ],
      descriptor: {
        description: 'ocDescription',
        name: 'ocMetricName',
        unit: 'ocUnit',
        valueType: ValueType.INT,
      },
    } as GaugeMetricData);
  });

  it('should map OpenCensus GAUGE_DOUBLE to Gauge', () => {
    const metricData = mapOcMetric({
      descriptor: {
        description: 'ocDescription',
        name: 'ocMetricName',
        type: oc.MetricDescriptorType.GAUGE_DOUBLE,
        unit: 'ocUnit',
        labelKeys: [
          { key: 'key1', description: '' },
          { key: 'key2', description: '' },
        ],
      },
      timeseries: [
        {
          startTimestamp: { seconds: 10, nanos: 10 },
          labelValues: [{ value: 'value1' }, { value: 'value2' }],
          points: [{ timestamp: { seconds: 20, nanos: 20 }, value: 5.5 }],
        },
      ],
    });

    assert.deepStrictEqual(metricData, {
      aggregationTemporality: AggregationTemporality.CUMULATIVE,
      dataPointType: DataPointType.GAUGE,
      dataPoints: [
        {
          attributes: { key1: 'value1', key2: 'value2' },
          endTime: [20, 20],
          startTime: [10, 10],
          value: 5.5,
        },
      ],
      descriptor: {
        description: 'ocDescription',
        name: 'ocMetricName',
        unit: 'ocUnit',
        valueType: ValueType.DOUBLE,
      },
    } as GaugeMetricData);
  });

  it('should drop unsupported OpenCensus GAUGE_DISTRIBUTION', () => {
    const metricData = mapOcMetric({
      descriptor: {
        description: 'ocDescription',
        name: 'ocMetricName',
        type: oc.MetricDescriptorType.GAUGE_DISTRIBUTION,
        unit: 'ocUnit',
        labelKeys: [
          { key: 'key1', description: '' },
          { key: 'key2', description: '' },
        ],
      },
      timeseries: [
        {
          startTimestamp: { seconds: 10, nanos: 10 },
          labelValues: [{ value: 'value1' }, { value: 'value2' }],
          points: [{ timestamp: { seconds: 20, nanos: 20 }, value: 5 }],
        },
      ],
    });
    assert.deepStrictEqual(metricData, null);
  });

  it('should drop unsupported OpenCensus SUMMARY', () => {
    const metricData = mapOcMetric({
      descriptor: {
        description: 'ocDescription',
        name: 'ocMetricName',
        type: oc.MetricDescriptorType.SUMMARY,
        unit: 'ocUnit',
        labelKeys: [
          { key: 'key1', description: '' },
          { key: 'key2', description: '' },
        ],
      },
      timeseries: [
        {
          startTimestamp: { seconds: 10, nanos: 10 },
          labelValues: [{ value: 'value1' }, { value: 'value2' }],
          points: [
            {
              timestamp: { seconds: 20, nanos: 20 },
              value: { count: 5, sum: 10 },
            },
          ],
        },
      ],
    });
    assert.deepStrictEqual(metricData, null);
  });
});

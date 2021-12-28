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
import { AggregationTemporality, ValueType } from '@opentelemetry/api-metrics';
import { Resource } from '@opentelemetry/resources';
import {
    HistogramAggregator,
    LastValueAggregator,
    MetricKind,
    MetricRecord,
    SumAggregator
} from '@opentelemetry/sdk-metrics-base';
import * as assert from 'assert';
import { createExportMetricsServiceRequest } from '../src/metrics';

const START_TIME = 1640715235584374000;

describe('Metrics', () => {
    describe('createExportMetricsServiceRequest', () => {
        let sumRecord: MetricRecord;
        let sumAggregator: SumAggregator;
        let gaugeRecord: MetricRecord;
        let gaugeAggregator: LastValueAggregator;
        let histRecord: MetricRecord;
        let histAggregator: HistogramAggregator;
        let resource: Resource;

        beforeEach(() => {
            resource = new Resource({
                'resource-attribute': 'resource attribute value',
            });
            sumAggregator = new SumAggregator();
            sumRecord = {
                aggregationTemporality:
                    AggregationTemporality.AGGREGATION_TEMPORALITY_DELTA,
                attributes: { 'string-attribute': 'some attribute value' },
                descriptor: {
                    description: 'this is a description',
                    metricKind: MetricKind.COUNTER,
                    name: 'counter',
                    unit: '1',
                    valueType: ValueType.INT,
                },
                aggregator: sumAggregator,
                instrumentationLibrary: {
                    name: 'mylib',
                },
                resource,
            };
            gaugeAggregator = new LastValueAggregator();
            gaugeRecord = {
                aggregationTemporality:
                    AggregationTemporality.AGGREGATION_TEMPORALITY_UNSPECIFIED,
                attributes: { 'string-attribute': 'some attribute value' },
                descriptor: {
                    description: 'this is a description',
                    metricKind: MetricKind.OBSERVABLE_GAUGE,
                    name: 'gauge',
                    unit: '1',
                    valueType: ValueType.DOUBLE,
                },
                aggregator: gaugeAggregator,
                instrumentationLibrary: {
                    name: 'mylib',
                },
                resource,
            };
            histAggregator = new HistogramAggregator([5]);
            histRecord = {
                aggregationTemporality:
                    AggregationTemporality.AGGREGATION_TEMPORALITY_UNSPECIFIED,
                attributes: { 'string-attribute': 'some attribute value' },
                descriptor: {
                    description: 'this is a description',
                    metricKind: MetricKind.HISTOGRAM,
                    name: 'hist',
                    unit: '1',
                    valueType: ValueType.INT,
                },
                aggregator: histAggregator,
                instrumentationLibrary: {
                    name: 'mylib',
                },
                resource,
            };
        });

        it('returns null on an empty list', () => {
            assert.strictEqual(createExportMetricsServiceRequest([], 0), null);
        });

        it('serializes a sum metric record', () => {
            sumAggregator.update(10);
            // spoof the update time
            sumAggregator['_lastUpdateTime'] = [1640715557, 342725388];
            const exportRequest = createExportMetricsServiceRequest(
                [sumRecord],
                START_TIME
            );
            assert.ok(exportRequest);

            assert.deepStrictEqual(exportRequest.toObject(), {
                resource_metrics: [
                    {
                        resource: {
                            attributes: [
                                {
                                    key: 'resource-attribute',
                                    value: {
                                        string_value: 'resource attribute value',
                                    },
                                },
                            ],
                            dropped_attributes_count: 0,
                        },
                        instrumentation_library_metrics: [
                            {
                                instrumentation_library: {
                                    name: 'mylib',
                                },
                                metrics: [
                                    {
                                        name: 'counter',
                                        description: 'this is a description',
                                        unit: '1',
                                        sum: {
                                            data_points: [
                                                {
                                                    attributes: [
                                                        {
                                                            key: 'string-attribute',
                                                            value: {
                                                                string_value: 'some attribute value',
                                                            },
                                                        },
                                                    ],
                                                    labels: [],
                                                    start_time_unix_nano: START_TIME,
                                                    time_unix_nano: 1640715557342725400,
                                                    as_int: 10,
                                                    exemplars: [],
                                                },
                                            ],
                                            aggregation_temporality: 1,
                                            is_monotonic: true,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        });

        it('serializes a gauge metric record', () => {
            gaugeAggregator.update(10.5);
            // spoof the update time
            gaugeAggregator['_lastUpdateTime'] = [1640715557, 342725388];
            const exportRequest = createExportMetricsServiceRequest(
                [gaugeRecord],
                START_TIME
            );
            assert.ok(exportRequest);

            assert.deepStrictEqual(exportRequest.toObject(), {
                resource_metrics: [
                    {
                        resource: {
                            attributes: [
                                {
                                    key: 'resource-attribute',
                                    value: {
                                        string_value: 'resource attribute value',
                                    },
                                },
                            ],
                            dropped_attributes_count: 0,
                        },
                        instrumentation_library_metrics: [
                            {
                                instrumentation_library: {
                                    name: 'mylib',
                                },
                                metrics: [
                                    {
                                        name: 'gauge',
                                        description: 'this is a description',
                                        unit: '1',
                                        gauge: {
                                            data_points: [
                                                {
                                                    attributes: [
                                                        {
                                                            key: 'string-attribute',
                                                            value: {
                                                                string_value: 'some attribute value',
                                                            },
                                                        },
                                                    ],
                                                    labels: [],
                                                    start_time_unix_nano: START_TIME,
                                                    time_unix_nano: 1640715557342725400,
                                                    as_double: 10.5,
                                                    exemplars: [],
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        });

        it('serializes a histogram metric record', () => {
            histAggregator.update(2);
            histAggregator.update(7);
            // spoof the update time
            histAggregator['_lastUpdateTime'] = [1640715557, 342725388];
            const exportRequest = createExportMetricsServiceRequest(
                [histRecord],
                START_TIME
            );
            assert.ok(exportRequest);

            assert.deepStrictEqual(exportRequest.toObject(), {
                resource_metrics: [
                    {
                        resource: {
                            attributes: [
                                {
                                    key: 'resource-attribute',
                                    value: {
                                        string_value: 'resource attribute value',
                                    },
                                },
                            ],
                            dropped_attributes_count: 0,
                        },
                        instrumentation_library_metrics: [
                            {
                                instrumentation_library: {
                                    name: 'mylib',
                                },
                                metrics: [
                                    {
                                        name: 'hist',
                                        description: 'this is a description',
                                        unit: '1',
                                        histogram: {
                                            aggregation_temporality: 0,
                                            data_points: [
                                                {
                                                    attributes: [
                                                        {
                                                            key: 'string-attribute',
                                                            value: {
                                                                string_value: 'some attribute value',
                                                            },
                                                        },
                                                    ],
                                                    bucket_counts: [1, 1],
                                                    count: 2,
                                                    explicit_bounds: [5],
                                                    sum: 9,
                                                    labels: [],
                                                    start_time_unix_nano: START_TIME,
                                                    time_unix_nano: 1640715557342725400,
                                                    exemplars: [],
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        });
    });
});

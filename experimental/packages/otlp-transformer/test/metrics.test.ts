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
import { ValueType } from '@opentelemetry/api-metrics';
import { Resource } from '@opentelemetry/resources';
import {
  AggregationTemporality,
  DataPointType,
  InstrumentType,
  MetricData,
  ResourceMetrics
} from '@opentelemetry/sdk-metrics-base';
import * as assert from 'assert';
import { createExportMetricsServiceRequest } from '../src/metrics';
import { EAggregationTemporality } from '../src/metrics/types';
import { hrTime, hrTimeToNanoseconds } from '@opentelemetry/core';

const START_TIME = hrTime();
const END_TIME = hrTime();

describe('Metrics', () => {
  describe('createExportMetricsServiceRequest', () => {
    function createCounterData(value: number): MetricData {
      return {
        descriptor: {
          description: 'this is a description',
          type: InstrumentType.COUNTER,
          name: 'counter',
          unit: '1',
          valueType: ValueType.INT,
        },
        dataPointType: DataPointType.SINGULAR,
        dataPoints: [
          {
            value: value,
            startTime: START_TIME,
            endTime: END_TIME,
            attributes: { 'string-attribute': 'some attribute value' }
          }
        ]
      };
    }

    function createObservableCounterData(value: number): MetricData {
      return {
        descriptor: {
          description: 'this is a description',
          type: InstrumentType.OBSERVABLE_COUNTER,
          name: 'observable-counter',
          unit: '1',
          valueType: ValueType.INT,
        },
        dataPointType: DataPointType.SINGULAR,
        dataPoints: [
          {
            value: value,
            startTime: START_TIME,
            endTime: END_TIME,
            attributes: { 'string-attribute': 'some attribute value' }
          }
        ]
      };
    }

    function createObservableGaugeData(value: number): MetricData {
      return {
        descriptor: {
          description: 'this is a description',
          type: InstrumentType.OBSERVABLE_GAUGE,
          name: 'gauge',
          unit: '1',
          valueType: ValueType.DOUBLE,
        },
        dataPointType: DataPointType.SINGULAR,
        dataPoints: [
          {
            value: value,
            startTime: START_TIME,
            endTime: END_TIME,
            attributes: { 'string-attribute': 'some attribute value' }
          }
        ]
      };
    }

    function createHistogramMetrics(count: number, sum: number, boundaries: number[], counts: number[]): MetricData {
      return {
        descriptor: {
          description: 'this is a description',
          type: InstrumentType.HISTOGRAM,
          name: 'hist',
          unit: '1',
          valueType: ValueType.INT,
        },
        dataPointType: DataPointType.HISTOGRAM,
        dataPoints: [
          {
            value: {
              sum: sum,
              count: count,
              buckets: {
                boundaries: boundaries,
                counts: counts
              }
            },
            startTime: START_TIME,
            endTime: END_TIME,
            attributes: { 'string-attribute': 'some attribute value' },
          }
        ]
      };
    }

    function createResourceMetrics(metricData: MetricData[]): ResourceMetrics {
      const resource = new Resource({
        'resource-attribute': 'resource attribute value',
      });
      return {
        resource: resource,
        instrumentationLibraryMetrics:
          [
            {
              instrumentationLibrary: {
                name: 'mylib',
                version: '0.1.0',
                schemaUrl: 'http://url.to.schema'
              },
              metrics: metricData
            }
          ]
      };
    }

    it('serializes a sum metric record', () => {
      const metrics = createResourceMetrics([createCounterData(10)]);
      const exportRequest = createExportMetricsServiceRequest(
        metrics,
        AggregationTemporality.DELTA
      );
      assert.ok(exportRequest);

      assert.deepStrictEqual(exportRequest, {
        resourceMetrics: [
          {
            resource: {
              attributes: [
                {
                  key: 'resource-attribute',
                  value: {
                    stringValue: 'resource attribute value',
                  },
                },
              ],
              droppedAttributesCount: 0,
            },
            schemaUrl: undefined,
            instrumentationLibraryMetrics: [
              {
                instrumentationLibrary: {
                  name: 'mylib',
                  version: '0.1.0',
                },
                schemaUrl: 'http://url.to.schema',
                metrics: [
                  {
                    name: 'counter',
                    description: 'this is a description',
                    unit: '1',
                    sum: {
                      dataPoints: [
                        {
                          attributes: [
                            {
                              key: 'string-attribute',
                              value: {
                                stringValue: 'some attribute value',
                              },
                            },
                          ],
                          startTimeUnixNano: hrTimeToNanoseconds(START_TIME),
                          timeUnixNano: hrTimeToNanoseconds(END_TIME),
                          asInt: 10,
                        },
                      ],
                      aggregationTemporality: EAggregationTemporality.AGGREGATION_TEMPORALITY_DELTA,
                      isMonotonic: true,
                    },
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    it('serializes an observable sum metric record', () => {
      const exportRequest = createExportMetricsServiceRequest(
        createResourceMetrics([createObservableCounterData(10)]),
        AggregationTemporality.DELTA
      );
      assert.ok(exportRequest);

      assert.deepStrictEqual(exportRequest, {
        resourceMetrics: [
          {
            resource: {
              attributes: [
                {
                  key: 'resource-attribute',
                  value: {
                    stringValue: 'resource attribute value',
                  },
                },
              ],
              droppedAttributesCount: 0,
            },
            schemaUrl: undefined,
            instrumentationLibraryMetrics: [
              {
                instrumentationLibrary: {
                  name: 'mylib',
                  version: '0.1.0',
                },
                schemaUrl: 'http://url.to.schema',
                metrics: [
                  {
                    name: 'observable-counter',
                    description: 'this is a description',
                    unit: '1',
                    sum: {
                      dataPoints: [
                        {
                          attributes: [
                            {
                              key: 'string-attribute',
                              value: {
                                stringValue: 'some attribute value',
                              },
                            },
                          ],
                          startTimeUnixNano: hrTimeToNanoseconds(START_TIME),
                          timeUnixNano: hrTimeToNanoseconds(END_TIME),
                          asInt: 10,
                        },
                      ],
                      aggregationTemporality: EAggregationTemporality.AGGREGATION_TEMPORALITY_DELTA,
                      isMonotonic: true,
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
      const exportRequest = createExportMetricsServiceRequest(
        createResourceMetrics([createObservableGaugeData(10.5)]),
        AggregationTemporality.DELTA
      );
      assert.ok(exportRequest);

      assert.deepStrictEqual(exportRequest, {
        resourceMetrics: [
          {
            resource: {
              attributes: [
                {
                  key: 'resource-attribute',
                  value: {
                    stringValue: 'resource attribute value',
                  },
                },
              ],
              droppedAttributesCount: 0,
            },
            schemaUrl: undefined,
            instrumentationLibraryMetrics: [
              {
                instrumentationLibrary: {
                  name: 'mylib',
                  version: '0.1.0',
                },
                schemaUrl: 'http://url.to.schema',
                metrics: [
                  {
                    name: 'gauge',
                    description: 'this is a description',
                    unit: '1',
                    gauge: {
                      dataPoints: [
                        {
                          attributes: [
                            {
                              key: 'string-attribute',
                              value: {
                                stringValue: 'some attribute value',
                              },
                            },
                          ],
                          startTimeUnixNano: hrTimeToNanoseconds(START_TIME),
                          timeUnixNano: hrTimeToNanoseconds(END_TIME),
                          asDouble: 10.5,
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
      const exportRequest = createExportMetricsServiceRequest(
        createResourceMetrics([createHistogramMetrics(2, 9, [5], [1,1])]),
        AggregationTemporality.CUMULATIVE
      );
      assert.ok(exportRequest);

      assert.deepStrictEqual(exportRequest, {
        resourceMetrics: [
          {
            resource: {
              attributes: [
                {
                  key: 'resource-attribute',
                  value: {
                    stringValue: 'resource attribute value',
                  },
                },
              ],
              droppedAttributesCount: 0,
            },
            schemaUrl: undefined,
            instrumentationLibraryMetrics: [
              {
                instrumentationLibrary: {
                  name: 'mylib',
                  version: '0.1.0',
                },
                schemaUrl: 'http://url.to.schema',
                metrics: [
                  {
                    name: 'hist',
                    description: 'this is a description',
                    unit: '1',
                    histogram: {
                      aggregationTemporality: EAggregationTemporality.AGGREGATION_TEMPORALITY_CUMULATIVE,
                      dataPoints: [
                        {
                          attributes: [
                            {
                              key: 'string-attribute',
                              value: {
                                stringValue: 'some attribute value',
                              },
                            },
                          ],
                          bucketCounts: [1, 1],
                          count: 2,
                          explicitBounds: [5],
                          sum: 9,
                          startTimeUnixNano: hrTimeToNanoseconds(START_TIME),
                          timeUnixNano: hrTimeToNanoseconds(END_TIME),
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

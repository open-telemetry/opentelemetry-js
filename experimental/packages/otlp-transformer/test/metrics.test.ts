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
import { ValueType } from '@opentelemetry/api';
import { hrTime, hrTimeToNanoseconds } from '@opentelemetry/core';
import {
  Resource,
  resourceFromAttributes,
  resourceFromDetectedResource,
} from '@opentelemetry/resources';
import {
  AggregationTemporality,
  DataPointType,
  MetricData,
  ResourceMetrics,
} from '@opentelemetry/sdk-metrics';
import * as assert from 'assert';
import { encodeAsLongBits, encodeAsString } from '../src/common/utils';
import * as root from '../src/generated/root';
import { createExportMetricsServiceRequest } from '../src/metrics/internal';
import { EAggregationTemporality } from '../src/metrics/internal-types';
import { JsonMetricsSerializer } from '../src/metrics/json';
import { ProtobufMetricsSerializer } from '../src/metrics/protobuf';

const START_TIME = hrTime();
const END_TIME = hrTime();
const ATTRIBUTES = {
  'string-attribute': 'some attribute value',
  'int-attribute': 1,
  'double-attribute': 1.1,
  'boolean-attribute': true,
  'array-attribute': ['attribute value 1', 'attribute value 2'],
};

describe('Metrics', () => {
  const expectedResource = {
    attributes: [
      {
        key: 'resource-entity-id',
        value: {
          stringValue: 'resource entity value',
        },
      },
      {
        key: 'resource-entity-attribute',
        value: {
          stringValue: 'resource entity attribute value',
        },
      },
      {
        key: 'resource-attribute',
        value: {
          stringValue: 'resource attribute value',
        },
      },
    ],
    entityRefs: [
      {
        descriptionKeys: ['resource-entity-attribute'],
        idKeys: ['resource-entity-id'],
        schemaUrl: 'http://url.to.resource.schema',
        type: 'resource-entity-type',
      },
    ],
    droppedAttributesCount: 0,
  };

  const expectedScope = {
    name: 'mylib',
    version: '0.1.0',
  };

  const expectedSchemaUrl = 'http://url.to.schema';

  const expectedAttributes = [
    {
      key: 'string-attribute',
      value: {
        stringValue: 'some attribute value',
      },
    },
    {
      key: 'int-attribute',
      value: {
        intValue: 1,
      },
    },
    {
      key: 'double-attribute',
      value: {
        doubleValue: 1.1,
      },
    },
    {
      key: 'boolean-attribute',
      value: {
        boolValue: true,
      },
    },
    {
      key: 'array-attribute',
      value: {
        arrayValue: {
          values: [
            {
              stringValue: 'attribute value 1',
            },
            {
              stringValue: 'attribute value 2',
            },
          ],
        },
      },
    },
  ];

  function createCounterData(
    value: number,
    aggregationTemporality: AggregationTemporality
  ): MetricData {
    return {
      descriptor: {
        description: 'this is a description',
        name: 'counter',
        unit: '1',
        valueType: ValueType.INT,
      },
      aggregationTemporality,
      dataPointType: DataPointType.SUM,
      isMonotonic: true,
      dataPoints: [
        {
          value: value,
          startTime: START_TIME,
          endTime: END_TIME,
          attributes: ATTRIBUTES,
        },
      ],
    };
  }

  function createUpDownCounterData(
    value: number,
    aggregationTemporality: AggregationTemporality
  ): MetricData {
    return {
      descriptor: {
        description: 'this is a description',
        name: 'up-down-counter',
        unit: '1',
        valueType: ValueType.INT,
      },
      aggregationTemporality,
      dataPointType: DataPointType.SUM,
      isMonotonic: false,
      dataPoints: [
        {
          value: value,
          startTime: START_TIME,
          endTime: END_TIME,
          attributes: ATTRIBUTES,
        },
      ],
    };
  }

  function createObservableCounterData(
    value: number,
    aggregationTemporality: AggregationTemporality
  ): MetricData {
    return {
      descriptor: {
        description: 'this is a description',
        name: 'observable-counter',
        unit: '1',
        valueType: ValueType.INT,
      },
      aggregationTemporality,
      dataPointType: DataPointType.SUM,
      isMonotonic: true,
      dataPoints: [
        {
          value: value,
          startTime: START_TIME,
          endTime: END_TIME,
          attributes: ATTRIBUTES,
        },
      ],
    };
  }

  function createObservableUpDownCounterData(
    value: number,
    aggregationTemporality: AggregationTemporality
  ): MetricData {
    return {
      descriptor: {
        description: 'this is a description',
        name: 'observable-up-down-counter',
        unit: '1',
        valueType: ValueType.INT,
      },
      aggregationTemporality,
      dataPointType: DataPointType.SUM,
      isMonotonic: false,
      dataPoints: [
        {
          value: value,
          startTime: START_TIME,
          endTime: END_TIME,
          attributes: ATTRIBUTES,
        },
      ],
    };
  }

  function createObservableGaugeData(value: number): MetricData {
    return {
      descriptor: {
        description: 'this is a description',
        name: 'gauge',
        unit: '1',
        valueType: ValueType.DOUBLE,
      },
      aggregationTemporality: AggregationTemporality.CUMULATIVE,
      dataPointType: DataPointType.GAUGE,
      dataPoints: [
        {
          value: value,
          startTime: START_TIME,
          endTime: END_TIME,
          attributes: ATTRIBUTES,
        },
      ],
    };
  }

  function createHistogramMetrics(
    count: number,
    sum: number,
    boundaries: number[],
    counts: number[],
    aggregationTemporality: AggregationTemporality,
    min?: number,
    max?: number
  ): MetricData {
    return {
      descriptor: {
        description: 'this is a description',
        name: 'hist',
        unit: '1',
        valueType: ValueType.INT,
      },
      aggregationTemporality,
      dataPointType: DataPointType.HISTOGRAM,
      dataPoints: [
        {
          value: {
            sum: sum,
            count: count,
            min: min,
            max: max,
            buckets: {
              boundaries: boundaries,
              counts: counts,
            },
          },
          startTime: START_TIME,
          endTime: END_TIME,
          attributes: ATTRIBUTES,
        },
      ],
    };
  }

  function createExponentialHistogramMetrics(
    count: number,
    sum: number,
    scale: number,
    zeroCount: number,
    positive: { offset: number; bucketCounts: number[] },
    negative: { offset: number; bucketCounts: number[] },
    aggregationTemporality: AggregationTemporality,
    min?: number,
    max?: number
  ): MetricData {
    return {
      descriptor: {
        description: 'this is a description',
        name: 'xhist',
        unit: '1',
        valueType: ValueType.INT,
      },
      aggregationTemporality,
      dataPointType: DataPointType.EXPONENTIAL_HISTOGRAM,
      dataPoints: [
        {
          value: {
            sum: sum,
            count: count,
            min: min,
            max: max,
            zeroCount: zeroCount,
            scale: scale,
            positive: positive,
            negative: negative,
          },
          startTime: START_TIME,
          endTime: END_TIME,
          attributes: ATTRIBUTES,
        },
      ],
    };
  }

  function createResourceMetrics(
    metricData: MetricData[],
    customResource?: Resource
  ): ResourceMetrics {
    const resource =
      customResource ||
      resourceFromDetectedResource({
        attributes: {
          'resource-attribute': 'resource attribute value',
        },
        entities: [
          {
            identifier: {
              'resource-entity-id': 'resource entity value',
            },
            type: 'resource-entity-type',
            attributes: {
              'resource-entity-attribute': 'resource entity attribute value',
            },
            schemaUrl: 'http://url.to.resource.schema',
          },
        ],
      });

    return {
      resource: resource,
      scopeMetrics: [
        {
          scope: {
            name: 'mylib',
            version: '0.1.0',
            schemaUrl: expectedSchemaUrl,
          },
          metrics: metricData,
        },
      ],
    };
  }

  describe('createExportMetricsServiceRequest', () => {
    it('serializes a monotonic sum metric record', () => {
      const metrics = createResourceMetrics([
        createCounterData(10, AggregationTemporality.DELTA),
      ]);
      const exportRequest = createExportMetricsServiceRequest([metrics]);
      assert.ok(exportRequest);

      assert.deepStrictEqual(exportRequest, {
        resourceMetrics: [
          {
            resource: expectedResource,
            schemaUrl: undefined,
            scopeMetrics: [
              {
                scope: expectedScope,
                schemaUrl: expectedSchemaUrl,
                metrics: [
                  {
                    name: 'counter',
                    description: 'this is a description',
                    unit: '1',
                    sum: {
                      dataPoints: [
                        {
                          attributes: expectedAttributes,
                          startTimeUnixNano: encodeAsLongBits(START_TIME),
                          timeUnixNano: encodeAsLongBits(END_TIME),
                          asInt: 10,
                        },
                      ],
                      aggregationTemporality:
                        EAggregationTemporality.AGGREGATION_TEMPORALITY_DELTA,
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

    it('serializes a non-monotonic sum metric record', () => {
      const metrics = createResourceMetrics([
        createUpDownCounterData(10, AggregationTemporality.DELTA),
      ]);
      const exportRequest = createExportMetricsServiceRequest([metrics]);
      assert.ok(exportRequest);

      assert.deepStrictEqual(exportRequest, {
        resourceMetrics: [
          {
            resource: expectedResource,
            schemaUrl: undefined,
            scopeMetrics: [
              {
                scope: expectedScope,
                schemaUrl: expectedSchemaUrl,
                metrics: [
                  {
                    name: 'up-down-counter',
                    description: 'this is a description',
                    unit: '1',
                    sum: {
                      dataPoints: [
                        {
                          attributes: expectedAttributes,
                          startTimeUnixNano: encodeAsLongBits(START_TIME),
                          timeUnixNano: encodeAsLongBits(END_TIME),
                          asInt: 10,
                        },
                      ],
                      aggregationTemporality:
                        EAggregationTemporality.AGGREGATION_TEMPORALITY_DELTA,
                      isMonotonic: false,
                    },
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    it('serializes an observable monotonic sum metric record', () => {
      const exportRequest = createExportMetricsServiceRequest([
        createResourceMetrics([
          createObservableCounterData(10, AggregationTemporality.DELTA),
        ]),
      ]);
      assert.ok(exportRequest);

      assert.deepStrictEqual(exportRequest, {
        resourceMetrics: [
          {
            resource: expectedResource,
            schemaUrl: undefined,
            scopeMetrics: [
              {
                scope: expectedScope,
                schemaUrl: expectedSchemaUrl,
                metrics: [
                  {
                    name: 'observable-counter',
                    description: 'this is a description',
                    unit: '1',
                    sum: {
                      dataPoints: [
                        {
                          attributes: expectedAttributes,
                          startTimeUnixNano: encodeAsLongBits(START_TIME),
                          timeUnixNano: encodeAsLongBits(END_TIME),
                          asInt: 10,
                        },
                      ],
                      aggregationTemporality:
                        EAggregationTemporality.AGGREGATION_TEMPORALITY_DELTA,
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

    it('serializes an observable non-monotonic sum metric record', () => {
      const exportRequest = createExportMetricsServiceRequest([
        createResourceMetrics([
          createObservableUpDownCounterData(10, AggregationTemporality.DELTA),
        ]),
      ]);
      assert.ok(exportRequest);

      assert.deepStrictEqual(exportRequest, {
        resourceMetrics: [
          {
            resource: expectedResource,
            schemaUrl: undefined,
            scopeMetrics: [
              {
                scope: expectedScope,
                schemaUrl: expectedSchemaUrl,
                metrics: [
                  {
                    name: 'observable-up-down-counter',
                    description: 'this is a description',
                    unit: '1',
                    sum: {
                      dataPoints: [
                        {
                          attributes: expectedAttributes,
                          startTimeUnixNano: encodeAsLongBits(START_TIME),
                          timeUnixNano: encodeAsLongBits(END_TIME),
                          asInt: 10,
                        },
                      ],
                      aggregationTemporality:
                        EAggregationTemporality.AGGREGATION_TEMPORALITY_DELTA,
                      isMonotonic: false,
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
      const exportRequest = createExportMetricsServiceRequest([
        createResourceMetrics([createObservableGaugeData(10.5)]),
      ]);
      assert.ok(exportRequest);

      assert.deepStrictEqual(exportRequest, {
        resourceMetrics: [
          {
            resource: expectedResource,
            schemaUrl: undefined,
            scopeMetrics: [
              {
                scope: expectedScope,
                schemaUrl: expectedSchemaUrl,
                metrics: [
                  {
                    name: 'gauge',
                    description: 'this is a description',
                    unit: '1',
                    gauge: {
                      dataPoints: [
                        {
                          attributes: expectedAttributes,
                          startTimeUnixNano: encodeAsLongBits(START_TIME),
                          timeUnixNano: encodeAsLongBits(END_TIME),
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

    describe('serializes a histogram metric record', () => {
      it('with min/max', () => {
        const exportRequest = createExportMetricsServiceRequest([
          createResourceMetrics([
            createHistogramMetrics(
              2,
              9,
              [5],
              [1, 1],
              AggregationTemporality.CUMULATIVE,
              1,
              8
            ),
          ]),
        ]);
        assert.ok(exportRequest);

        assert.deepStrictEqual(exportRequest, {
          resourceMetrics: [
            {
              resource: expectedResource,
              schemaUrl: undefined,
              scopeMetrics: [
                {
                  scope: expectedScope,
                  schemaUrl: expectedSchemaUrl,
                  metrics: [
                    {
                      name: 'hist',
                      description: 'this is a description',
                      unit: '1',
                      histogram: {
                        aggregationTemporality:
                          EAggregationTemporality.AGGREGATION_TEMPORALITY_CUMULATIVE,
                        dataPoints: [
                          {
                            attributes: expectedAttributes,
                            bucketCounts: [1, 1],
                            count: 2,
                            explicitBounds: [5],
                            sum: 9,
                            min: 1,
                            max: 8,
                            startTimeUnixNano: encodeAsLongBits(START_TIME),
                            timeUnixNano: encodeAsLongBits(END_TIME),
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

      it('without min/max', () => {
        const exportRequest = createExportMetricsServiceRequest([
          createResourceMetrics([
            createHistogramMetrics(
              2,
              9,
              [5],
              [1, 1],
              AggregationTemporality.CUMULATIVE
            ),
          ]),
        ]);
        assert.ok(exportRequest);

        assert.deepStrictEqual(exportRequest, {
          resourceMetrics: [
            {
              resource: expectedResource,
              schemaUrl: undefined,
              scopeMetrics: [
                {
                  scope: expectedScope,
                  schemaUrl: expectedSchemaUrl,
                  metrics: [
                    {
                      name: 'hist',
                      description: 'this is a description',
                      unit: '1',
                      histogram: {
                        aggregationTemporality:
                          EAggregationTemporality.AGGREGATION_TEMPORALITY_CUMULATIVE,
                        dataPoints: [
                          {
                            attributes: expectedAttributes,
                            bucketCounts: [1, 1],
                            count: 2,
                            explicitBounds: [5],
                            sum: 9,
                            min: undefined,
                            max: undefined,
                            startTimeUnixNano: encodeAsLongBits(START_TIME),
                            timeUnixNano: encodeAsLongBits(END_TIME),
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

    describe('serializes an exponential histogram metric record', () => {
      it('with min/max', () => {
        const exportRequest = createExportMetricsServiceRequest([
          createResourceMetrics([
            createExponentialHistogramMetrics(
              3,
              10,
              1,
              0,
              { offset: 0, bucketCounts: [1, 0, 0, 0, 1, 0, 1, 0] },
              { offset: 0, bucketCounts: [0] },
              AggregationTemporality.CUMULATIVE,
              1,
              8
            ),
          ]),
        ]);

        assert.ok(exportRequest);

        assert.deepStrictEqual(exportRequest, {
          resourceMetrics: [
            {
              resource: expectedResource,
              schemaUrl: undefined,
              scopeMetrics: [
                {
                  scope: expectedScope,
                  schemaUrl: expectedSchemaUrl,
                  metrics: [
                    {
                      name: 'xhist',
                      description: 'this is a description',
                      unit: '1',
                      exponentialHistogram: {
                        aggregationTemporality:
                          EAggregationTemporality.AGGREGATION_TEMPORALITY_CUMULATIVE,
                        dataPoints: [
                          {
                            attributes: expectedAttributes,
                            count: 3,
                            sum: 10,
                            min: 1,
                            max: 8,
                            zeroCount: 0,
                            scale: 1,
                            positive: {
                              offset: 0,
                              bucketCounts: [1, 0, 0, 0, 1, 0, 1, 0],
                            },
                            negative: { offset: 0, bucketCounts: [0] },
                            startTimeUnixNano: encodeAsLongBits(START_TIME),
                            timeUnixNano: encodeAsLongBits(END_TIME),
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

      it('without min/max', () => {
        const exportRequest = createExportMetricsServiceRequest([
          createResourceMetrics([
            createExponentialHistogramMetrics(
              3,
              10,
              1,
              0,
              { offset: 0, bucketCounts: [1, 0, 0, 0, 1, 0, 1, 0] },
              { offset: 0, bucketCounts: [0] },
              AggregationTemporality.CUMULATIVE
            ),
          ]),
        ]);

        assert.ok(exportRequest);

        assert.deepStrictEqual(exportRequest, {
          resourceMetrics: [
            {
              resource: expectedResource,
              schemaUrl: undefined,
              scopeMetrics: [
                {
                  scope: expectedScope,
                  schemaUrl: expectedSchemaUrl,
                  metrics: [
                    {
                      name: 'xhist',
                      description: 'this is a description',
                      unit: '1',
                      exponentialHistogram: {
                        aggregationTemporality:
                          EAggregationTemporality.AGGREGATION_TEMPORALITY_CUMULATIVE,
                        dataPoints: [
                          {
                            attributes: expectedAttributes,
                            count: 3,
                            sum: 10,
                            min: undefined,
                            max: undefined,
                            zeroCount: 0,
                            scale: 1,
                            positive: {
                              offset: 0,
                              bucketCounts: [1, 0, 0, 0, 1, 0, 1, 0],
                            },
                            negative: { offset: 0, bucketCounts: [0] },
                            startTimeUnixNano: encodeAsLongBits(START_TIME),
                            timeUnixNano: encodeAsLongBits(END_TIME),
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

    it('supports schema URL on resource', () => {
      const resourceWithSchema = resourceFromAttributes(
        {},
        { schemaUrl: 'https://opentelemetry.test/schemas/1.2.3' }
      );

      const resourceMetrics = createResourceMetrics(
        [createCounterData(10, AggregationTemporality.DELTA)],
        resourceWithSchema
      );

      const exportRequest = createExportMetricsServiceRequest([
        resourceMetrics,
      ]);

      assert.ok(exportRequest);
      assert.strictEqual(exportRequest.resourceMetrics?.length, 1);
      assert.strictEqual(
        exportRequest.resourceMetrics?.[0].schemaUrl,
        'https://opentelemetry.test/schemas/1.2.3'
      );
    });
  });

  describe('ProtobufMetricsSerializer', function () {
    it('serializes an export request', () => {
      const serialized = ProtobufMetricsSerializer.serializeRequest(
        createResourceMetrics([
          createCounterData(10, AggregationTemporality.DELTA),
        ])
      );
      assert.ok(serialized, 'serialized response is undefined');
      const decoded =
        root.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.decode(
          serialized
        );

      const decodedObj =
        root.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.toObject(
          decoded,
          {
            longs: Number,
          }
        );

      const expected = {
        resourceMetrics: [
          {
            resource: expectedResource,
            scopeMetrics: [
              {
                scope: expectedScope,
                schemaUrl: expectedSchemaUrl,
                metrics: [
                  {
                    name: 'counter',
                    description: 'this is a description',
                    unit: '1',
                    sum: {
                      dataPoints: [
                        {
                          attributes: expectedAttributes,
                          startTimeUnixNano: hrTimeToNanoseconds(START_TIME),
                          timeUnixNano: hrTimeToNanoseconds(END_TIME),
                          asInt: 10,
                        },
                      ],
                      aggregationTemporality:
                        EAggregationTemporality.AGGREGATION_TEMPORALITY_DELTA,
                      isMonotonic: true,
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
      assert.deepStrictEqual(decodedObj, expected);
    });

    it('deserializes a response', () => {
      const protobufSerializedResponse =
        root.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceResponse.encode(
          {
            partialSuccess: {
              errorMessage: 'foo',
              rejectedDataPoints: 1,
            },
          }
        ).finish();

      const deserializedResponse =
        ProtobufMetricsSerializer.deserializeResponse(
          protobufSerializedResponse
        );

      assert.ok(
        deserializedResponse.partialSuccess,
        'partialSuccess not present in the deserialized message'
      );
      assert.equal(deserializedResponse.partialSuccess.errorMessage, 'foo');
      assert.equal(
        Number(deserializedResponse.partialSuccess.rejectedDataPoints),
        1
      );
    });

    it('does not throw when deserializing an empty response', () => {
      assert.doesNotThrow(() =>
        ProtobufMetricsSerializer.deserializeResponse(new Uint8Array([]))
      );
    });
  });

  describe('JsonMetricsSerializer', function () {
    it('serializes an export request', () => {
      const serialized = JsonMetricsSerializer.serializeRequest(
        createResourceMetrics([
          createCounterData(10, AggregationTemporality.DELTA),
        ])
      );

      const decoder = new TextDecoder();
      const expected = {
        resourceMetrics: [
          {
            resource: expectedResource,
            scopeMetrics: [
              {
                scope: expectedScope,
                schemaUrl: expectedSchemaUrl,
                metrics: [
                  {
                    name: 'counter',
                    description: 'this is a description',
                    unit: '1',
                    sum: {
                      dataPoints: [
                        {
                          attributes: expectedAttributes,
                          startTimeUnixNano: encodeAsString(START_TIME),
                          timeUnixNano: encodeAsString(END_TIME),
                          asInt: 10,
                        },
                      ],
                      aggregationTemporality:
                        EAggregationTemporality.AGGREGATION_TEMPORALITY_DELTA,
                      isMonotonic: true,
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      assert.deepStrictEqual(JSON.parse(decoder.decode(serialized)), expected);
    });

    it('deserializes a response', () => {
      const expectedResponse = {
        partialSuccess: {
          errorMessage: 'foo',
          rejectedDataPoints: 1,
        },
      };
      const encoder = new TextEncoder();
      const encodedResponse = encoder.encode(JSON.stringify(expectedResponse));

      const deserializedResponse =
        JsonMetricsSerializer.deserializeResponse(encodedResponse);

      assert.ok(
        deserializedResponse.partialSuccess,
        'partialSuccess not present in the deserialized message'
      );
      assert.equal(deserializedResponse.partialSuccess.errorMessage, 'foo');
      assert.equal(
        Number(deserializedResponse.partialSuccess.rejectedDataPoints),
        1
      );
    });

    it('does not throw when deserializing an empty response', () => {
      assert.doesNotThrow(() =>
        JsonMetricsSerializer.deserializeResponse(new Uint8Array([]))
      );
    });
  });
});

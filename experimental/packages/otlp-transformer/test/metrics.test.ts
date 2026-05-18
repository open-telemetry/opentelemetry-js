/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { ValueType } from '@opentelemetry/api';
import type { Resource } from '@opentelemetry/resources';
import { resourceFromAttributes } from '@opentelemetry/resources';
import type { MetricData, ResourceMetrics } from '@opentelemetry/sdk-metrics';
import {
  AggregationTemporality,
  DataPointType,
} from '@opentelemetry/sdk-metrics';
import * as assert from 'assert';
import { createExportMetricsServiceRequest } from '../src/metrics/internal';
import { EAggregationTemporality } from '../src/metrics/internal-types';
import {
  PROTOBUF_ENCODER,
  encodeAsLongBits,
  encodeAsString,
} from '../src/common/utils';
import { hrTime, hrTimeToNanoseconds } from '@opentelemetry/core';
import * as signals from '../test/generated/signals';
import { ProtobufMetricsSerializer } from '../src/metrics/protobuf';
import { JsonMetricsSerializer } from '../src/metrics/json';

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
        key: 'resource-attribute',
        value: {
          stringValue: 'resource attribute value',
        },
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
      resourceFromAttributes({
        'resource-attribute': 'resource attribute value',
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
      const exportRequest = createExportMetricsServiceRequest(
        [metrics],
        PROTOBUF_ENCODER
      );
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
      const exportRequest = createExportMetricsServiceRequest(
        [metrics],
        PROTOBUF_ENCODER
      );
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
      const exportRequest = createExportMetricsServiceRequest(
        [
          createResourceMetrics([
            createObservableCounterData(10, AggregationTemporality.DELTA),
          ]),
        ],
        PROTOBUF_ENCODER
      );
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
      const exportRequest = createExportMetricsServiceRequest(
        [
          createResourceMetrics([
            createObservableUpDownCounterData(10, AggregationTemporality.DELTA),
          ]),
        ],
        PROTOBUF_ENCODER
      );
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
      const exportRequest = createExportMetricsServiceRequest(
        [createResourceMetrics([createObservableGaugeData(10.5)])],
        PROTOBUF_ENCODER
      );
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
        const exportRequest = createExportMetricsServiceRequest(
          [
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
          ],
          PROTOBUF_ENCODER
        );
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
        const exportRequest = createExportMetricsServiceRequest(
          [
            createResourceMetrics([
              createHistogramMetrics(
                2,
                9,
                [5],
                [1, 1],
                AggregationTemporality.CUMULATIVE
              ),
            ]),
          ],
          PROTOBUF_ENCODER
        );
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
        const exportRequest = createExportMetricsServiceRequest(
          [
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
          ],
          PROTOBUF_ENCODER
        );

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
        const exportRequest = createExportMetricsServiceRequest(
          [
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
          ],
          PROTOBUF_ENCODER
        );

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

      const exportRequest = createExportMetricsServiceRequest(
        [resourceMetrics],
        PROTOBUF_ENCODER
      );

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
        signals.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.decode(
          serialized
        );

      const decodedObj =
        signals.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.toObject(
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
        signals.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceResponse.encode(
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

    it('serializes a gauge metric', () => {
      const serialized = ProtobufMetricsSerializer.serializeRequest(
        createResourceMetrics([createObservableGaugeData(10.5)])
      );
      assert.ok(serialized, 'serialized response is undefined');
      const decoded =
        signals.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.decode(
          serialized
        );
      const decodedObj =
        signals.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.toObject(
          decoded,
          { longs: Number }
        );

      assert.strictEqual(decodedObj.resourceMetrics.length, 1);
      const metric = decodedObj.resourceMetrics[0].scopeMetrics[0].metrics[0];
      assert.strictEqual(metric.name, 'gauge');
      assert.ok(metric.gauge);
      assert.strictEqual(metric.gauge.dataPoints[0].asDouble, 10.5);
    });

    it('serializes a histogram metric', () => {
      const serialized = ProtobufMetricsSerializer.serializeRequest(
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
        ])
      );
      assert.ok(serialized, 'serialized response is undefined');
      const decoded =
        signals.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.decode(
          serialized
        );
      const decodedObj =
        signals.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.toObject(
          decoded,
          { longs: Number }
        );

      const metric = decodedObj.resourceMetrics[0].scopeMetrics[0].metrics[0];
      assert.strictEqual(metric.name, 'hist');
      assert.ok(metric.histogram);
      assert.strictEqual(
        metric.histogram.aggregationTemporality,
        EAggregationTemporality.AGGREGATION_TEMPORALITY_CUMULATIVE
      );
      const dp = metric.histogram.dataPoints[0];
      assert.strictEqual(dp.count, 2);
      assert.strictEqual(dp.sum, 9);
      assert.deepStrictEqual(dp.bucketCounts, [1, 1]);
      assert.deepStrictEqual(dp.explicitBounds, [5]);
      assert.strictEqual(dp.min, 1);
      assert.strictEqual(dp.max, 8);
    });

    it('serializes an exponential histogram metric', () => {
      const serialized = ProtobufMetricsSerializer.serializeRequest(
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
        ])
      );
      assert.ok(serialized, 'serialized response is undefined');
      const decoded =
        signals.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.decode(
          serialized
        );
      const decodedObj =
        signals.opentelemetry.proto.collector.metrics.v1.ExportMetricsServiceRequest.toObject(
          decoded,
          { longs: Number }
        );

      const metric = decodedObj.resourceMetrics[0].scopeMetrics[0].metrics[0];
      assert.strictEqual(metric.name, 'xhist');
      assert.ok(metric.exponentialHistogram);
      assert.strictEqual(
        metric.exponentialHistogram.aggregationTemporality,
        EAggregationTemporality.AGGREGATION_TEMPORALITY_CUMULATIVE
      );
      const dp = metric.exponentialHistogram.dataPoints[0];
      assert.strictEqual(dp.count, 3);
      assert.strictEqual(dp.sum, 10);
      assert.strictEqual(dp.scale, 1);
      assert.strictEqual(dp.zeroCount, 0);
      assert.deepStrictEqual(
        dp.positive.bucketCounts,
        [1, 0, 0, 0, 1, 0, 1, 0]
      );
      assert.deepStrictEqual(dp.negative.bucketCounts, [0]);
      assert.strictEqual(dp.min, 1);
      assert.strictEqual(dp.max, 8);
    });

    it('does not throw when encountering unexpected wiretypes during deserialization', function () {
      // Construct a response with unexpected wire types for known fields.
      const {
        ProtobufWriter,
      } = require('../src/common/protobuf/protobuf-writer');
      const writer = new ProtobufWriter(64);

      // field 1 (partial_success) with wire type 0 (varint) instead of 2 (length-delimited)
      writer.writeTag(1, 0);
      writer.writeVarint(42);

      // unknown field 99 with wire type 5 (32-bit)
      writer.writeTag(99, 5);
      writer.writeFixed32(0);

      assert.doesNotThrow(() =>
        ProtobufMetricsSerializer.deserializeResponse(writer.finish())
      );
    });

    it('does not throw when encountering unexpected wiretypes inside partialSuccess during deserialization', function () {
      // Construct an ExportMetricsServiceResponse where the embedded
      // ExportMetricsPartialSuccess has fields encoded with incorrect wire types.
      // ExportMetricsPartialSuccess expects:
      //   1: rejected_data_points (varint, wire type 0)
      //   2: error_message (length-delimited, wire type 2)
      const {
        ProtobufWriter,
      } = require('../src/common/protobuf/protobuf-writer');
      const writer = new ProtobufWriter(128);

      // Write field 1 (partial_success) with correct wire type 2 (length-delimited),
      // but encode the inner fields with incorrect wire types.
      writer.writeTag(1, 2);
      const lengthVarintPosition = writer.startLengthDelimited();
      const innerStartPos = writer.pos;

      // Write field 1 (rejected_data_points, expects varint/wire type 0) with wire type 2 (length-delimited)
      writer.writeTag(1, 2);
      writer.writeString('not-a-number');

      // Write field 2 (error_message, expects length-delimited/wire type 2) with wire type 0 (varint)
      writer.writeTag(2, 0);
      writer.writeVarint(12345);

      // Write unknown field 99 with wire type 0 (varint)
      writer.writeTag(99, 0);
      writer.writeVarint(42);

      writer.finishLengthDelimited(
        lengthVarintPosition,
        writer.pos - innerStartPos
      );

      assert.doesNotThrow(() =>
        ProtobufMetricsSerializer.deserializeResponse(writer.finish())
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

    it('deserializes a malformed response', () => {
      const malformedResponse =
        '{ "partialSuccess": { "errorMessage": foo, "rejectedLogRecords": 1, }';
      const encoder = new TextEncoder();
      const encodedResponse = encoder.encode(malformedResponse);
      const deserializedResponse =
        JsonMetricsSerializer.deserializeResponse(encodedResponse);

      assert.deepEqual(
        deserializedResponse,
        {},
        'Malformed response should result in an empty object being returned'
      );
    });

    it('does not throw when deserializing an empty response', () => {
      assert.doesNotThrow(() =>
        JsonMetricsSerializer.deserializeResponse(new Uint8Array([]))
      );
    });
  });
});
